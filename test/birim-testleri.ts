// test/birim-testleri.ts
// Sifreleme, TOTP, PayTR imzasi ve emoji katmani icin birim testleri.
// Calistirma: npm run test
import crypto from 'crypto';
import { sifrele, coz, parolaOzetle, parolaDogrula, zamanGuvenliKarsilastir, jetonUret, jetonOzeti, maskele } from '../src/lib/guvenlik';
import { totpAnahtarUret, totpKodUret, totpDogrula, base32Kodla, base32Coz, otpauthBaglantisi } from '../src/lib/totp';
import { sepetiKodla, tutariKurusaCevir, tokenHashHesapla, bildirimHashDogrula, merchantOidUret } from '../src/lib/paytr';
import { EMOJI_SECENEKLERI, emojiGecerliMi, emojileriKaristir } from '../src/lib/adminEmoji';

let gecen = 0;
let kalan = 0;
const kalanlar: string[] = [];

function test(ad: string, calistir: () => void) {
  try {
    calistir();
    gecen++;
    console.log(`  GECTI  ${ad}`);
  } catch (hata) {
    kalan++;
    kalanlar.push(`${ad}: ${(hata as Error).message}`);
    console.log(`  KALDI  ${ad}  ->  ${(hata as Error).message}`);
  }
}

function esit(bulunan: unknown, beklenen: unknown, mesaj = '') {
  if (bulunan !== beklenen) {
    throw new Error(`${mesaj} beklenen ${JSON.stringify(beklenen)}, bulunan ${JSON.stringify(bulunan)}`);
  }
}

function dogru(deger: boolean, mesaj = '') {
  if (!deger) throw new Error(mesaj || 'dogru bekleniyordu');
}

function yanlis(deger: boolean, mesaj = '') {
  if (deger) throw new Error(mesaj || 'yanlis bekleniyordu');
}

// ============================================================
console.log('\n[1] Sifreleme (AES-256-GCM)');
process.env.ADMIN_ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');

test('sifrelenen metin geri cozulunce ayni cikar', () => {
  const duz = 'merchant_key_gizli_deger_123';
  esit(coz(sifrele(duz)), duz);
});

test('ayni metin iki kez sifrelenince farkli ciktilar verir', () => {
  const a = sifrele('ayni metin');
  const b = sifrele('ayni metin');
  dogru(a !== b, 'IV her seferinde degismeli');
  esit(coz(a), 'ayni metin');
  esit(coz(b), 'ayni metin');
});

test('bozulmus sifreli veri cozulemez', () => {
  const paket = sifrele('onemli veri');
  const parcalar = paket.split('.');
  const bozuk = `${parcalar[0]}.${parcalar[1]}.${'0'.repeat(parcalar[2].length)}`;
  let hataAlindi = false;
  try { coz(bozuk); } catch { hataAlindi = true; }
  dogru(hataAlindi, 'GCM etiketi bozuk veriyi reddetmeli');
});

test('turkce karakterler korunur', () => {
  const duz = 'Sifre: cgiosuCGIOSU';
  esit(coz(sifrele(duz)), duz);
});

test('yanlis uzunlukta anahtar reddedilir', () => {
  const yedek = process.env.ADMIN_ENCRYPTION_KEY;
  process.env.ADMIN_ENCRYPTION_KEY = 'abcd';
  let hataAlindi = false;
  try { sifrele('x'); } catch { hataAlindi = true; }
  process.env.ADMIN_ENCRYPTION_KEY = yedek;
  dogru(hataAlindi, '32 bayt olmayan anahtar kabul edilmemeli');
});

// ============================================================
console.log('\n[2] Parola ozeti (scrypt)');

test('dogru parola dogrulanir', () => {
  const { hash, salt } = parolaOzetle('CokGizliSifre2026');
  dogru(parolaDogrula('CokGizliSifre2026', hash, salt));
});

test('yanlis parola reddedilir', () => {
  const { hash, salt } = parolaOzetle('CokGizliSifre2026');
  yanlis(parolaDogrula('CokGizliSifre2027', hash, salt));
});

test('ayni parola farkli tuzla farkli ozet verir', () => {
  const a = parolaOzetle('ayniSifre');
  const b = parolaOzetle('ayniSifre');
  dogru(a.salt !== b.salt);
  dogru(a.hash !== b.hash);
});

test('bos ozet ya da tuz her zaman reddedilir', () => {
  yanlis(parolaDogrula('herhangi', '', ''));
  yanlis(parolaDogrula('herhangi', 'abc', ''));
});

test('zamanGuvenliKarsilastir farkli uzunlukta cokmez', () => {
  yanlis(zamanGuvenliKarsilastir('kisa', 'cok daha uzun bir metin'));
  dogru(zamanGuvenliKarsilastir('ayni', 'ayni'));
});

test('jeton uretimi benzersiz ve ozeti sabit', () => {
  const a = jetonUret(32);
  const b = jetonUret(32);
  dogru(a !== b);
  esit(jetonOzeti(a), jetonOzeti(a));
  dogru(jetonOzeti(a) !== jetonOzeti(b));
});

test('maskeleme son dort haneyi birakir', () => {
  esit(maskele('1234567890'), '******7890');
  esit(maskele('abc'), '***');
  esit(maskele(''), '');
});

// ============================================================
console.log('\n[3] TOTP (RFC 6238 resmi test vektorleri)');

const RFC_ANAHTAR = base32Kodla(Buffer.from('12345678901234567890', 'ascii'));

test('base32 kodlama ve cozme tersine calisir', () => {
  esit(base32Coz(RFC_ANAHTAR).toString('ascii'), '12345678901234567890');
});

const vektorler: [number, string][] = [
  [59, '287082'],
  [1111111109, '081804'],
  [1111111111, '050471'],
  [1234567890, '005924'],
  [2000000000, '279037'],
  [20000000000, '353130'],
];

for (const [T, beklenen] of vektorler) {
  test(`RFC 6238 vektoru T=${T} kodu ${beklenen}`, () => {
    esit(totpKodUret(RFC_ANAHTAR, Math.floor(T / 30)), beklenen);
  });
}

test('uretilen anahtar 32 karakterlik base32', () => {
  const anahtar = totpAnahtarUret();
  esit(anahtar.length, 32);
  dogru(/^[A-Z2-7]+$/.test(anahtar));
});

test('guncel kod dogrulanir', () => {
  const anahtar = totpAnahtarUret();
  dogru(totpDogrula(anahtar, totpKodUret(anahtar)));
});

test('bir onceki ve sonraki dilim de kabul edilir', () => {
  const anahtar = totpAnahtarUret();
  const simdi = Math.floor(Date.now() / 1000 / 30);
  dogru(totpDogrula(anahtar, totpKodUret(anahtar, simdi - 1)));
  dogru(totpDogrula(anahtar, totpKodUret(anahtar, simdi + 1)));
});

test('pencere disindaki kod reddedilir', () => {
  const anahtar = totpAnahtarUret();
  const simdi = Math.floor(Date.now() / 1000 / 30);
  yanlis(totpDogrula(anahtar, totpKodUret(anahtar, simdi - 5)));
});

test('yanlis uzunluktaki kod reddedilir', () => {
  const anahtar = totpAnahtarUret();
  yanlis(totpDogrula(anahtar, '12345'));
  yanlis(totpDogrula(anahtar, ''));
  yanlis(totpDogrula(anahtar, '1234567'));
});

test('baska anahtarin kodu reddedilir', () => {
  const a = totpAnahtarUret();
  const b = totpAnahtarUret();
  yanlis(totpDogrula(a, totpKodUret(b)));
});

test('otpauth baglantisi Google Authenticator bicimindedir', () => {
  const anahtar = totpAnahtarUret();
  const url = otpauthBaglantisi(anahtar, 'yonetici', 'DEM GIDA');
  dogru(url.startsWith('otpauth://totp/DEM%20GIDA:yonetici'));
  dogru(url.includes(`secret=${anahtar}`));
  dogru(url.includes('algorithm=SHA1'));
  dogru(url.includes('digits=6'));
  dogru(url.includes('period=30'));
});

// ============================================================
console.log('\n[4] PayTR');

const KIMLIK = { merchantId: '123456', merchantKey: 'test_key', merchantSalt: 'test_salt' };

test('tutar kurusa dogru cevrilir', () => {
  esit(tutariKurusaCevir(9.99), 999);
  esit(tutariKurusaCevir(100), 10000);
  esit(tutariKurusaCevir(0.1), 10);
  esit(tutariKurusaCevir(1234.56), 123456);
});

test('kayan nokta kaymasi kurus hatasina yol acmaz', () => {
  esit(tutariKurusaCevir(19.99 * 3), 5997);
  esit(tutariKurusaCevir(0.1 + 0.2), 30);
  esit(tutariKurusaCevir(1.005), 101);
  esit(tutariKurusaCevir(8.29 * 7), 5803);
  esit(tutariKurusaCevir(864), 86400);
});

test('sepet base64 kodlu JSON dizisine cevrilir', () => {
  const kodlu = sepetiKodla([
    { ad: 'Turk Kahvesi', fiyat: 18, adet: 1 },
    { ad: 'Dibek', fiyat: 33.25, adet: 2 },
  ]);
  const cozulmus = JSON.parse(Buffer.from(kodlu, 'base64').toString('utf8'));
  esit(JSON.stringify(cozulmus), JSON.stringify([['Turk Kahvesi', '18.00', 1], ['Dibek', '33.25', 2]]));
});

test('token hash PayTR dokumanindaki sirayla hesaplanir', () => {
  const alanlar = {
    userIp: '192.168.1.1',
    merchantOid: 'ORDER123',
    email: 'musteri@ornek.com',
    paymentAmount: 999,
    userBasket: 'W1siVXJ1biIsIjkuOTkiLDFdXQ==',
    noInstallment: '0',
    maxInstallment: '0',
    currency: 'TL',
    testMode: '1',
  };
  const bulunan = tokenHashHesapla(KIMLIK, alanlar);

  // Dokumandaki birlestirme elle kuruluyor ve bagimsiz olarak imzalaniyor.
  const elle =
    KIMLIK.merchantId + alanlar.userIp + alanlar.merchantOid + alanlar.email +
    '999' + alanlar.userBasket + '0' + '0' + 'TL' + '1';
  const beklenen = crypto
    .createHmac('sha256', KIMLIK.merchantKey)
    .update(elle + KIMLIK.merchantSalt)
    .digest('base64');

  esit(bulunan, beklenen);
});

test('token hash tek alan degisince degisir', () => {
  const temel = {
    userIp: '1.1.1.1', merchantOid: 'A1', email: 'a@b.com', paymentAmount: 100,
    userBasket: 'x', noInstallment: '0', maxInstallment: '0', currency: 'TL', testMode: '0',
  };
  const a = tokenHashHesapla(KIMLIK, temel);
  const b = tokenHashHesapla(KIMLIK, { ...temel, paymentAmount: 101 });
  dogru(a !== b, 'tutar degisince imza degismeli');
});

test('bildirim hashi dogru uretilince kabul edilir', () => {
  const bildirim = { merchant_oid: 'DEM123', status: 'success', total_amount: '19900' };
  const hash = crypto
    .createHmac('sha256', KIMLIK.merchantKey)
    .update(bildirim.merchant_oid + KIMLIK.merchantSalt + bildirim.status + bildirim.total_amount)
    .digest('base64');
  dogru(bildirimHashDogrula(KIMLIK, { ...bildirim, hash }));
});

test('sahte bildirim hashi reddedilir', () => {
  yanlis(bildirimHashDogrula(KIMLIK, {
    merchant_oid: 'DEM123', status: 'success', total_amount: '19900', hash: 'sahteDeger',
  }));
});

test('tutari degistirilmis bildirim reddedilir', () => {
  const bildirim = { merchant_oid: 'DEM123', status: 'success', total_amount: '19900' };
  const hash = crypto
    .createHmac('sha256', KIMLIK.merchantKey)
    .update(bildirim.merchant_oid + KIMLIK.merchantSalt + bildirim.status + bildirim.total_amount)
    .digest('base64');
  // Saldirgan tutari buyutup ayni hashi gonderiyor.
  yanlis(bildirimHashDogrula(KIMLIK, { ...bildirim, total_amount: '1', hash }));
});

test('durumu degistirilmis bildirim reddedilir', () => {
  const bildirim = { merchant_oid: 'DEM123', status: 'failed', total_amount: '19900' };
  const hash = crypto
    .createHmac('sha256', KIMLIK.merchantKey)
    .update(bildirim.merchant_oid + KIMLIK.merchantSalt + bildirim.status + bildirim.total_amount)
    .digest('base64');
  yanlis(bildirimHashDogrula(KIMLIK, { ...bildirim, status: 'success', hash }));
});

test('bos hash reddedilir', () => {
  yanlis(bildirimHashDogrula(KIMLIK, {
    merchant_oid: 'DEM123', status: 'success', total_amount: '19900', hash: '',
  }));
});

test('siparis numarasi benzersiz ve sadece harf rakam', () => {
  const uretilenler = new Set<string>();
  for (let i = 0; i < 500; i++) {
    const oid = merchantOidUret('DEM');
    dogru(/^[A-Za-z0-9]+$/.test(oid), `gecersiz karakter: ${oid}`);
    dogru(oid.length <= 64);
    uretilenler.add(oid);
  }
  esit(uretilenler.size, 500, 'tekrar eden siparis numarasi uretildi');
});

// ============================================================
console.log('\n[5] Emoji katmani');

test('tam dokuz secenek var', () => {
  esit(EMOJI_SECENEKLERI.length, 9);
});

test('anahtarlar benzersiz', () => {
  esit(new Set(EMOJI_SECENEKLERI.map((e) => e.anahtar)).size, 9);
});

test('simgeler benzersiz', () => {
  esit(new Set(EMOJI_SECENEKLERI.map((e) => e.simge)).size, 9);
});

test('gecerli anahtar kabul, gecersiz reddedilir', () => {
  dogru(emojiGecerliMi(EMOJI_SECENEKLERI[0].anahtar));
  yanlis(emojiGecerliMi('olmayan_anahtar'));
  yanlis(emojiGecerliMi(''));
});

test('karistirma kaynak diziyi bozmaz ve hepsini korur', () => {
  const oncekiSira = EMOJI_SECENEKLERI.map((e) => e.anahtar).join(',');
  const karisik = emojileriKaristir();
  esit(karisik.length, 9);
  esit(new Set(karisik.map((e) => e.anahtar)).size, 9);
  esit(EMOJI_SECENEKLERI.map((e) => e.anahtar).join(','), oncekiSira, 'kaynak dizi degismemeli');
});

test('karistirma gercekten sira degistiriyor', () => {
  const temel = EMOJI_SECENEKLERI.map((e) => e.anahtar).join(',');
  let farkliCikti = false;
  for (let i = 0; i < 40; i++) {
    if (emojileriKaristir().map((e) => e.anahtar).join(',') !== temel) {
      farkliCikti = true;
      break;
    }
  }
  dogru(farkliCikti, '40 denemede hic karismadi');
});

// ============================================================
console.log('\n' + '='.repeat(52));
console.log(`SONUC: ${gecen} test gecti, ${kalan} test kaldi.`);
if (kalanlar.length) {
  console.log('\nKalanlar:');
  kalanlar.forEach((k) => console.log(`  . ${k}`));
}
console.log('='.repeat(52) + '\n');
process.exit(kalan === 0 ? 0 : 1);
