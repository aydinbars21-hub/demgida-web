-- DEM GIDA siparis tablosu
-- 001_admin_ve_paytr.sql dosyasi orders tablosunu YALNIZCA varsa guncelliyor.
-- Yeni Supabase projesinde tablo hic yok, bu dosya onu sifirdan kurar.
-- Kolonlar kodun gercekte yazdigi alanlardan cikarildi:
--   src/app/api/orders/create/route.ts
--   src/app/api/admin/orders/update/route.ts
--   src/app/api/odeme/paytr/bildirim/route.ts
--   src/app/admin/page.tsx  (Order arayuzu)

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  order_number      text not null unique,
  customer_name     text,
  customer_email    text,
  customer_phone    text,
  shipping_address  text,
  total_amount      numeric(12,2) not null default 0,
  status            text not null default 'preparing',
  payment_status    text not null default 'pending',
  payment_method    text,
  items             jsonb not null default '[]'::jsonb,
  tracking_number   text,
  merchant_oid      text,
  payment_provider  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint orders_durum_gecerli
    check (status in ('preparing','shipped','completed','cancelled')),
  constraint orders_odeme_durumu_gecerli
    check (payment_status in ('paid','pending','failed'))
);

-- Panel listeyi created_at azalan sirada cekiyor.
create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

-- PayTR bildirimi siparisi merchant_oid ile buluyor.
create unique index if not exists orders_merchant_oid_idx
  on public.orders (merchant_oid) where merchant_oid is not null;

-- Satir duzeyi guvenlik: bu tabloya yalnizca service_role erisir.
-- Hicbir policy tanimlanmadigi icin anon ve authenticated hicbir satiri goremez.
alter table public.orders enable row level security;
revoke all on public.orders from anon, authenticated;
