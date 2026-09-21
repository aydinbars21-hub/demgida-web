// src/lib/guvenlik.ts
// Sifreleme, parola ozeti ve rastgele jeton uretimi.
import crypto from 'crypto';

/** AES-256-GCM icin 32 baytlik anahtar. Vercel ortam degiskeninden okunur. */
function anahtariAl(): Buffer {
  const ham = process.env.ADMIN_ENCRYPTION_KEY;
  if (!ham) {
    throw new Error('ADMIN_ENCRYPTION_KEY ortam degiskeni tanimli degil.');
  }
  const anahtar = Buffer.from(ham, 'hex');
  if (anahtar.length !== 32) {
    throw new Error('ADMIN_ENCRYPTION_KEY 64 karakterlik hex olmali (32 bayt).');
  }
  return anahtar;
}

/** Metni AES-256-GCM ile sifreler. Cikti: iv.etiket.sifreliMetin (hex, nokta ayracli) */
export function sifrele(duzMetin: string): string {
  const anahtar = anahtariAl();
  const iv = crypto.randomBytes(12);
  const sifreleyici = crypto.createCipheriv('aes-256-gcm', anahtar, iv);
  const sifreli = Buffer.concat([sifreleyici.update(duzMetin, 'utf8'), sifreleyici.final()]);
  const etiket = sifreleyici.getAuthTag();
  return `${iv.toString('hex')}.${etiket.toString('hex')}.${sifreli.toString('hex')}`;
}

/** sifrele() ciktisini geri cozer. */
export function coz(paket: string): string {
  const anahtar = anahtariAl();
  const parcalar = paket.split('.');
  if (parcalar.length !== 3) {
    throw new Error('Sifreli veri bicimi gecersiz.');
  }
  const [ivHex, etiketHex, sifreliHex] = parcalar;
  const cozucu = crypto.createDecipheriv('aes-256-gcm', anahtar, Buffer.from(ivHex, 'hex'));
  cozucu.setAuthTag(Buffer.from(etiketHex, 'hex'));
  const duz = Buffer.concat([cozucu.update(Buffer.from(sifreliHex, 'hex')), cozucu.final()]);
  return duz.toString('utf8');
}

/** Parolayi scrypt ile ozetler. */
export function parolaOzetle(parola: string, tuz?: string): { hash: string; salt: string } {
  const salt = tuz || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(parola.normalize('NFKC'), salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  }).toString('hex');
  return { hash, salt };
}

/** Parolayi kayitli ozetle karsilastirir (zamanlama saldirisina kapali). */
export function parolaDogrula(parola: string, hash: string, salt: string): boolean {
  if (!hash || !salt) return false;
  const hesaplanan = parolaOzetle(parola, salt).hash;
  return zamanGuvenliKarsilastir(hesaplanan, hash);
}

/** Iki metni sabit surede karsilastirir. */
export function zamanGuvenliKarsilastir(a: string, b: string): boolean {
  const ab = Buffer.from(a || '', 'utf8');
  const bb = Buffer.from(b || '', 'utf8');
  if (ab.length !== bb.length) {
    // Uzunluk farkliysa yine de sabit surede bir karsilastirma yapip false donduruyoruz.
    crypto.timingSafeEqual(ab, ab);
    return false;
  }
  return crypto.timingSafeEqual(ab, bb);
}

/** Kriptografik olarak guvenli, URL uyumlu rastgele jeton. */
export function jetonUret(baytSayisi = 32): string {
  return crypto.randomBytes(baytSayisi).toString('base64url');
}

/** Jetonun veritabaninda saklanan ozeti. */
export function jetonOzeti(jeton: string): string {
  return crypto.createHash('sha256').update(jeton).digest('hex');
}

/** Bir metni maskeleyerek gosterir: son 4 karakter disi gizlenir. */
export function maskele(deger: string | null | undefined): string {
  if (!deger) return '';
  if (deger.length <= 4) return '*'.repeat(deger.length);
  return '*'.repeat(Math.min(deger.length - 4, 24)) + deger.slice(-4);
}
