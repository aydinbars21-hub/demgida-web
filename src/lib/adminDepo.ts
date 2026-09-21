// src/lib/adminDepo.ts
// Yonetim paneli ve odeme ayarlarinin veritabani katmani.
// Buradaki her sorgu service_role anahtariyla calisir, tarayiciya asla sizmaz.
import { supabaseServer } from '@/lib/supabaseServer';
import { sifrele, coz, jetonOzeti, jetonUret } from '@/lib/guvenlik';
import type { PaytrKimlik } from '@/lib/paytr';

export const OTURUM_CEREZI = 'dem_admin_oturum';
export const OTURUM_SURESI_SANIYE = 60 * 60 * 2; // 2 saat

export interface AdminYapilandirma {
  password_hash: string | null;
  password_salt: string | null;
  emoji_key: string | null;
  totp_secret_enc: string | null;
  setup_completed: boolean;
}

export interface OdemeYapilandirma {
  merchant_id: string | null;
  merchant_key_enc: string | null;
  merchant_salt_enc: string | null;
  test_mode: boolean;
  no_installment: boolean;
  max_installment: number;
  currency: string;
  timeout_limit: number;
  is_active: boolean;
  updated_at: string | null;
}

/** Veritabanina ulasilamadiginda anlasilir bir hata firlatir. */
function hataKontrol(hata: { message: string } | null, nerede: string) {
  if (hata) {
    throw new Error(`Veritabani hatasi (${nerede}): ${hata.message}`);
  }
}

export async function adminYapilandirmaOku(): Promise<AdminYapilandirma> {
  const { data, error } = await supabaseServer
    .from('admin_config')
    .select('password_hash, password_salt, emoji_key, totp_secret_enc, setup_completed')
    .eq('id', 1)
    .maybeSingle();
  hataKontrol(error, 'admin_config okuma');
  return (
    (data as AdminYapilandirma) || {
      password_hash: null,
      password_salt: null,
      emoji_key: null,
      totp_secret_enc: null,
      setup_completed: false,
    }
  );
}

export async function adminYapilandirmaYaz(deger: {
  password_hash: string;
  password_salt: string;
  emoji_key: string;
  totp_secret_enc: string;
}) {
  const { error } = await supabaseServer
    .from('admin_config')
    .upsert(
      {
        id: 1,
        ...deger,
        setup_completed: true,
        setup_done_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  hataKontrol(error, 'admin_config yazma');
}

export async function odemeYapilandirmaOku(): Promise<OdemeYapilandirma> {
  const { data, error } = await supabaseServer
    .from('payment_config')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  hataKontrol(error, 'payment_config okuma');
  return (
    (data as OdemeYapilandirma) || {
      merchant_id: null,
      merchant_key_enc: null,
      merchant_salt_enc: null,
      test_mode: true,
      no_installment: false,
      max_installment: 0,
      currency: 'TL',
      timeout_limit: 30,
      is_active: false,
      updated_at: null,
    }
  );
}

/** PayTR kimligini cozup dondurur. Eksikse null doner. */
export async function paytrKimligiAl(): Promise<PaytrKimlik | null> {
  const ayar = await odemeYapilandirmaOku();
  if (!ayar.is_active) return null;
  if (!ayar.merchant_id || !ayar.merchant_key_enc || !ayar.merchant_salt_enc) return null;
  try {
    return {
      merchantId: ayar.merchant_id,
      merchantKey: coz(ayar.merchant_key_enc),
      merchantSalt: coz(ayar.merchant_salt_enc),
    };
  } catch {
    return null;
  }
}

export async function odemeYapilandirmaYaz(deger: {
  merchant_id: string;
  merchant_key?: string;
  merchant_salt?: string;
  test_mode: boolean;
  no_installment: boolean;
  max_installment: number;
  currency: string;
  timeout_limit: number;
  is_active: boolean;
}) {
  const guncel: Record<string, unknown> = {
    id: 1,
    provider: 'paytr',
    merchant_id: deger.merchant_id,
    test_mode: deger.test_mode,
    no_installment: deger.no_installment,
    max_installment: deger.max_installment,
    currency: deger.currency,
    timeout_limit: deger.timeout_limit,
    is_active: deger.is_active,
    updated_at: new Date().toISOString(),
  };
  // Bos birakilan gizli alanlar mevcut degeri ezmez.
  if (deger.merchant_key) guncel.merchant_key_enc = sifrele(deger.merchant_key);
  if (deger.merchant_salt) guncel.merchant_salt_enc = sifrele(deger.merchant_salt);

  const { error } = await supabaseServer
    .from('payment_config')
    .upsert(guncel, { onConflict: 'id' });
  hataKontrol(error, 'payment_config yazma');
}

// ============================================================
// Oturum yonetimi
// ============================================================

export interface Oturum {
  id: string;
  stage: number;
  expires_at: string;
}

export async function oturumOlustur(ip: string, ua: string): Promise<string> {
  const jeton = jetonUret(32);
  const { error } = await supabaseServer.from('admin_sessions').insert({
    token_hash: jetonOzeti(jeton),
    stage: 1,
    ip,
    user_agent: (ua || '').slice(0, 300),
    expires_at: new Date(Date.now() + OTURUM_SURESI_SANIYE * 1000).toISOString(),
  });
  hataKontrol(error, 'oturum olusturma');
  return jeton;
}

export async function oturumOku(jeton: string | undefined): Promise<Oturum | null> {
  if (!jeton) return null;
  const { data, error } = await supabaseServer
    .from('admin_sessions')
    .select('id, stage, expires_at')
    .eq('token_hash', jetonOzeti(jeton))
    .maybeSingle();
  if (error) return null;
  if (!data) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) {
    await oturumSil(jeton);
    return null;
  }
  return data as Oturum;
}

export async function oturumAsamaYukselt(jeton: string, yeniAsama: number) {
  const { error } = await supabaseServer
    .from('admin_sessions')
    .update({ stage: yeniAsama })
    .eq('token_hash', jetonOzeti(jeton));
  hataKontrol(error, 'oturum asama guncelleme');
}

export async function oturumSil(jeton: string) {
  await supabaseServer.from('admin_sessions').delete().eq('token_hash', jetonOzeti(jeton));
}

// ============================================================
// Hiz siniri
// ============================================================

const PENCERE_DAKIKA = 15;
const AZAMI_BASARISIZ = 8;

export async function denemeKaydet(ip: string, adim: string, basarili: boolean) {
  await supabaseServer
    .from('admin_login_attempts')
    .insert({ ip, step: adim, successful: basarili });
}

/** Son 15 dakikada 8 basarisiz deneme varsa kilitler. */
export async function kilitliMi(ip: string): Promise<boolean> {
  const esik = new Date(Date.now() - PENCERE_DAKIKA * 60 * 1000).toISOString();
  const { count, error } = await supabaseServer
    .from('admin_login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('successful', false)
    .gte('created_at', esik);
  if (error) return false;
  return (count ?? 0) >= AZAMI_BASARISIZ;
}

export async function gunlukYaz(islem: string, detay: unknown, ip: string) {
  await supabaseServer
    .from('admin_audit_log')
    .insert({ action: islem, detail: detay as never, ip });
}
