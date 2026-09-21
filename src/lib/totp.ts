// src/lib/totp.ts
// Google Authenticator uyumlu TOTP (RFC 6238). Disaridan paket kullanmaz.
import crypto from 'crypto';

const BASE32_ALFABE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const ADIM_SANIYE = 30;
const BASAMAK = 6;

/** Rastgele 20 baytlik TOTP anahtari uretir ve base32 olarak dondurur. */
export function totpAnahtarUret(): string {
  return base32Kodla(crypto.randomBytes(20));
}

export function base32Kodla(veri: Buffer): string {
  let bit = 0;
  let deger = 0;
  let cikti = '';
  for (const bayt of veri) {
    deger = (deger << 8) | bayt;
    bit += 8;
    while (bit >= 5) {
      cikti += BASE32_ALFABE[(deger >>> (bit - 5)) & 31];
      bit -= 5;
    }
  }
  if (bit > 0) {
    cikti += BASE32_ALFABE[(deger << (5 - bit)) & 31];
  }
  return cikti;
}

export function base32Coz(metin: string): Buffer {
  const temiz = metin.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bit = 0;
  let deger = 0;
  const baytlar: number[] = [];
  for (const karakter of temiz) {
    const indeks = BASE32_ALFABE.indexOf(karakter);
    if (indeks === -1) {
      throw new Error('Gecersiz base32 karakteri.');
    }
    deger = (deger << 5) | indeks;
    bit += 5;
    if (bit >= 8) {
      baytlar.push((deger >>> (bit - 8)) & 255);
      bit -= 8;
    }
  }
  return Buffer.from(baytlar);
}

/** Belirli bir zaman adimi icin 6 haneli kodu uretir. */
export function totpKodUret(base32Anahtar: string, adim?: number): string {
  const anahtar = base32Coz(base32Anahtar);
  const zamanAdimi = adim ?? Math.floor(Date.now() / 1000 / ADIM_SANIYE);

  const tampon = Buffer.alloc(8);
  tampon.writeUInt32BE(Math.floor(zamanAdimi / 0x100000000), 0);
  tampon.writeUInt32BE(zamanAdimi >>> 0, 4);

  const ozet = crypto.createHmac('sha1', anahtar).update(tampon).digest();
  const kaydirma = ozet[ozet.length - 1] & 0x0f;
  const ikili =
    ((ozet[kaydirma] & 0x7f) << 24) |
    ((ozet[kaydirma + 1] & 0xff) << 16) |
    ((ozet[kaydirma + 2] & 0xff) << 8) |
    (ozet[kaydirma + 3] & 0xff);

  return String(ikili % 10 ** BASAMAK).padStart(BASAMAK, '0');
}

/**
 * Kullanicinin girdigi kodu dogrular.
 * pencere = 1 ise bir onceki ve bir sonraki 30 saniyelik dilim de kabul edilir
 * (telefon saati birkac saniye kaymissa giris yine calissin diye).
 */
export function totpDogrula(base32Anahtar: string, kod: string, pencere = 1): boolean {
  const temizKod = (kod || '').replace(/\D/g, '');
  if (temizKod.length !== BASAMAK) return false;

  const simdikiAdim = Math.floor(Date.now() / 1000 / ADIM_SANIYE);
  for (let fark = -pencere; fark <= pencere; fark++) {
    const beklenen = totpKodUret(base32Anahtar, simdikiAdim + fark);
    const a = Buffer.from(beklenen);
    const b = Buffer.from(temizKod);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
      return true;
    }
  }
  return false;
}

/** Google Authenticator uygulamasinin okudugu otpauth baglantisi. */
export function otpauthBaglantisi(base32Anahtar: string, hesap: string, yayinci: string): string {
  const e = encodeURIComponent;
  return (
    `otpauth://totp/${e(yayinci)}:${e(hesap)}` +
    `?secret=${base32Anahtar}` +
    `&issuer=${e(yayinci)}` +
    `&algorithm=SHA1&digits=${BASAMAK}&period=${ADIM_SANIYE}`
  );
}
