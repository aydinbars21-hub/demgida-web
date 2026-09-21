-- DEM GIDA yonetim paneli ve PayTR odeme altyapisi
-- Bu dosyayi Supabase panelinde SQL Editor icinde bir kez calistirin.

-- ============================================================
-- 1. Yonetici yapilandirmasi (tek satir, id = 1)
-- ============================================================
create table if not exists public.admin_config (
  id              smallint primary key default 1,
  password_hash   text,                    -- scrypt(sifre, salt), hex
  password_salt   text,                    -- rastgele 16 bayt, hex
  emoji_key       text,                    -- secilen emojinin anahtari, ornek: "anahtar"
  totp_secret_enc text,                    -- AES-256-GCM ile sifrelenmis base32 TOTP anahtari
  setup_completed boolean not null default false,
  setup_done_at   timestamptz,
  updated_at      timestamptz not null default now(),
  constraint admin_config_tek_satir check (id = 1)
);

insert into public.admin_config (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- 2. Odeme yapilandirmasi (tek satir, id = 1)
-- ============================================================
create table if not exists public.payment_config (
  id                 smallint primary key default 1,
  provider           text not null default 'paytr',
  merchant_id        text,
  merchant_key_enc   text,                 -- AES-256-GCM ile sifreli
  merchant_salt_enc  text,                 -- AES-256-GCM ile sifreli
  test_mode          boolean not null default true,
  no_installment     boolean not null default false,
  max_installment    smallint not null default 0,
  currency           text not null default 'TL',
  timeout_limit      smallint not null default 30,
  is_active          boolean not null default false,
  updated_at         timestamptz not null default now(),
  constraint payment_config_tek_satir check (id = 1),
  constraint payment_config_max_taksit check (max_installment between 0 and 12)
);

insert into public.payment_config (id) values (1) on conflict (id) do nothing;

-- ============================================================
-- 3. Yonetici oturumlari (3 katmanli girisin asamalarini tutar)
-- ============================================================
create table if not exists public.admin_sessions (
  id          uuid primary key default gen_random_uuid(),
  token_hash  text not null unique,        -- sha256(oturum jetonu), hex
  stage       smallint not null default 1, -- 1: sifre gecti, 2: emoji gecti, 3: tam yetki
  ip          text,
  user_agent  text,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now(),
  constraint admin_sessions_asama check (stage between 1 and 3)
);

create index if not exists admin_sessions_expires_idx on public.admin_sessions (expires_at);

-- ============================================================
-- 4. Giris denemeleri (hiz siniri ve kilitleme icin)
-- ============================================================
create table if not exists public.admin_login_attempts (
  id         bigserial primary key,
  ip         text not null,
  step       text not null,                -- 'sifre' | 'emoji' | 'totp' | 'kurulum'
  successful boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_idx
  on public.admin_login_attempts (ip, created_at desc);

-- ============================================================
-- 5. PayTR islem kayitlari
-- ============================================================
create table if not exists public.paytr_transactions (
  id               uuid primary key default gen_random_uuid(),
  merchant_oid     text not null unique,
  order_number     text,
  amount           numeric(12,2) not null,
  status           text not null default 'pending',  -- pending | success | failed
  payment_type     text,
  payment_amount   numeric(12,2),
  total_amount     numeric(12,2),
  installment_count smallint,
  currency         text,
  test_mode        boolean,
  failed_reason_code text,
  failed_reason_msg  text,
  callback_raw     jsonb,
  notified_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists paytr_transactions_order_idx
  on public.paytr_transactions (order_number);

-- ============================================================
-- 6. Yonetici islem gunlugu
-- ============================================================
create table if not exists public.admin_audit_log (
  id         bigserial primary key,
  action     text not null,
  detail     jsonb,
  ip         text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. Satir duzeyi guvenlik: bu tablolara yalnizca service_role erisir
-- ============================================================
alter table public.admin_config          enable row level security;
alter table public.payment_config        enable row level security;
alter table public.admin_sessions        enable row level security;
alter table public.admin_login_attempts  enable row level security;
alter table public.paytr_transactions    enable row level security;
alter table public.admin_audit_log       enable row level security;

-- Hicbir policy tanimlanmadigi icin anon ve authenticated rolleri hicbir
-- satiri goremez. service_role anahtari RLS disindadir, sunucu tarafi
-- kodumuz yalnizca o anahtarla calisir.

revoke all on public.admin_config         from anon, authenticated;
revoke all on public.payment_config       from anon, authenticated;
revoke all on public.admin_sessions       from anon, authenticated;
revoke all on public.admin_login_attempts from anon, authenticated;
revoke all on public.paytr_transactions   from anon, authenticated;
revoke all on public.admin_audit_log      from anon, authenticated;

-- ============================================================
-- 8. orders tablosuna PayTR alanlari (tablo varsa)
-- ============================================================
do $$
begin
  if exists (select 1 from information_schema.tables
             where table_schema = 'public' and table_name = 'orders') then
    alter table public.orders add column if not exists merchant_oid text;
    alter table public.orders add column if not exists payment_provider text;
    create unique index if not exists orders_merchant_oid_idx
      on public.orders (merchant_oid) where merchant_oid is not null;
  end if;
end $$;

-- ============================================================
-- 9. Suresi dolmus oturumlari temizleyen yardimci
-- ============================================================
create or replace function public.admin_sessions_temizle()
returns void language sql security definer as $$
  delete from public.admin_sessions where expires_at < now();
  delete from public.admin_login_attempts where created_at < now() - interval '1 day';
$$;
