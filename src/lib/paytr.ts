// src/lib/paytr.ts
// PayTR iFrame API entegrasyonu.
// Kaynak: https://dev.paytr.com/iframe-api/iframe-api-1-adim ve 2-adim
import crypto from 'crypto';

export const PAYTR_TOKEN_URL = 'https://www.paytr.com/odeme/api/get-token';
export const PAYTR_IFRAME_URL = 'https://www.paytr.com/odeme/guvenli';

export interface PaytrKimlik {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
}

export interface SepetSatiri {
  ad: string;
  fiyat: number;   // TL cinsinden birim fiyat
  adet: number;
}

export interface TokenIstegi {
  merchantOid: string;
  email: string;
  tutar: number;          // TL cinsinden toplam tutar
  kullaniciIp: string;
  kullaniciAd: string;
  kullaniciAdres: string;
  kullaniciTelefon: string;
  sepet: SepetSatiri[];
  basariliUrl: string;
  basarisizUrl: string;
  testModu: boolean;
  taksitYok: boolean;
  maksTaksit: number;
  paraBirimi?: string;
  zamanAsimiDakika?: number;
  dil?: 'tr' | 'en';
}

export interface TokenSonucu {
  basarili: boolean;
  token?: string;
  iframeUrl?: string;
  hata?: string;
}

/** Sepeti PayTR'nin bekledigi base64 kodlu JSON bicimine cevirir. */
export function sepetiKodla(sepet: SepetSatiri[]): string {
  const dizi = sepet.map((satir) => [
    satir.ad.slice(0, 100),
    satir.fiyat.toFixed(2),
    satir.adet,
  ]);
  return Buffer.from(JSON.stringify(dizi), 'utf8').toString('base64');
}

/**
 * TL tutarini PayTR'nin bekledigi kurus cinsine cevirir (9.99 TL -> 999).
 * Kayan nokta kaymasi yuzunden 19.99 * 3 gibi toplamlar 59.97000000000001
 * cikabiliyor. Once anlamli basamak sayisina yuvarlayip sonra tam sayiya
 * geciyoruz, boylece bir kurus kayma olusmuyor.
 */
export function tutariKurusaCevir(tutar: number): number {
  return Math.round(Number((tutar * 100).toPrecision(12)));
}

/**
 * 1. adim icin paytr_token degerini hesaplar.
 * Birlestirme sirasi PayTR dokumantasyonundaki sira ile birebir aynidir:
 * merchant_id + user_ip + merchant_oid + email + payment_amount + user_basket
 * + no_installment + max_installment + currency + test_mode, sonuna merchant_salt
 * eklenir ve merchant_key ile HMAC-SHA256 imzalanip base64 kodlanir.
 */
export function tokenHashHesapla(
  kimlik: PaytrKimlik,
  alanlar: {
    userIp: string;
    merchantOid: string;
    email: string;
    paymentAmount: number;
    userBasket: string;
    noInstallment: string;
    maxInstallment: string;
    currency: string;
    testMode: string;
  }
): string {
  const birlesik =
    kimlik.merchantId +
    alanlar.userIp +
    alanlar.merchantOid +
    alanlar.email +
    String(alanlar.paymentAmount) +
    alanlar.userBasket +
    alanlar.noInstallment +
    alanlar.maxInstallment +
    alanlar.currency +
    alanlar.testMode;

  return crypto
    .createHmac('sha256', kimlik.merchantKey)
    .update(birlesik + kimlik.merchantSalt)
    .digest('base64');
}

/** PayTR'den odeme jetonu ister ve iframe adresini dondurur. */
export async function odemeJetonuAl(
  kimlik: PaytrKimlik,
  istek: TokenIstegi
): Promise<TokenSonucu> {
  const paraBirimi = istek.paraBirimi || 'TL';
  const testModu = istek.testModu ? '1' : '0';
  const taksitYok = istek.taksitYok ? '1' : '0';
  const maksTaksit = String(istek.maksTaksit ?? 0);
  const sepetKodlu = sepetiKodla(istek.sepet);
  const tutarKurus = tutariKurusaCevir(istek.tutar);

  const paytrToken = tokenHashHesapla(kimlik, {
    userIp: istek.kullaniciIp,
    merchantOid: istek.merchantOid,
    email: istek.email,
    paymentAmount: tutarKurus,
    userBasket: sepetKodlu,
    noInstallment: taksitYok,
    maxInstallment: maksTaksit,
    currency: paraBirimi,
    testMode: testModu,
  });

  const govde = new URLSearchParams({
    merchant_id: kimlik.merchantId,
    user_ip: istek.kullaniciIp,
    merchant_oid: istek.merchantOid,
    email: istek.email,
    payment_amount: String(tutarKurus),
    paytr_token: paytrToken,
    user_basket: sepetKodlu,
    debug_on: '1',
    no_installment: taksitYok,
    max_installment: maksTaksit,
    user_name: istek.kullaniciAd.slice(0, 60),
    user_address: istek.kullaniciAdres.slice(0, 400),
    user_phone: istek.kullaniciTelefon.slice(0, 20),
    merchant_ok_url: istek.basariliUrl,
    merchant_fail_url: istek.basarisizUrl,
    timeout_limit: String(istek.zamanAsimiDakika ?? 30),
    currency: paraBirimi,
    test_mode: testModu,
    lang: istek.dil || 'tr',
  });

  let cevap: Response;
  try {
    cevap = await fetch(PAYTR_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: govde.toString(),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    return { basarili: false, hata: 'PayTR sunucusuna ulasilamadi.' };
  }

  if (!cevap.ok) {
    return { basarili: false, hata: `PayTR yanit kodu: ${cevap.status}` };
  }

  let veri: { status?: string; token?: string; reason?: string };
  try {
    veri = await cevap.json();
  } catch {
    return { basarili: false, hata: 'PayTR yaniti okunamadi.' };
  }

  if (veri.status !== 'success' || !veri.token) {
    return { basarili: false, hata: veri.reason || 'PayTR jeton uretmedi.' };
  }

  return {
    basarili: true,
    token: veri.token,
    iframeUrl: `${PAYTR_IFRAME_URL}/${veri.token}`,
  };
}

/**
 * 2. adim: bildirim URL'sine gelen hash degerini dogrular.
 * Birlestirme sirasi: merchant_oid + merchant_salt + status + total_amount
 * merchant_key ile HMAC-SHA256, sonra base64.
 * Bu kontrol yapilmazsa sahte bildirimle bedava siparis gecilebilir.
 */
export function bildirimHashDogrula(
  kimlik: PaytrKimlik,
  bildirim: { merchant_oid: string; status: string; total_amount: string; hash: string }
): boolean {
  const beklenen = crypto
    .createHmac('sha256', kimlik.merchantKey)
    .update(
      bildirim.merchant_oid + kimlik.merchantSalt + bildirim.status + bildirim.total_amount
    )
    .digest('base64');

  const a = Buffer.from(beklenen);
  const b = Buffer.from(bildirim.hash || '');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Benzersiz siparis numarasi. PayTR yalnizca harf ve rakam kabul eder. */
export function merchantOidUret(onEk = 'DEM'): string {
  const zaman = Date.now().toString(36).toUpperCase();
  const rastgele = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${onEk}${zaman}${rastgele}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 64);
}
