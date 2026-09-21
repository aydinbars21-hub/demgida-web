// test/uctan-uca.mjs
// Uc katmanli girisin ve PayTR ayar akisinin gercek HTTP uzerinden testi.
// Sunucu test/sahte-supabase.mjs ile calisan bir Next dev sunucusudur.
import crypto from 'crypto';
import fs from 'fs';

const TABAN = process.env.TABAN || 'http://localhost:3400';
const SAHTE_DB = process.env.SAHTE_DB || 'http://localhost:54330';

// .env.local dosyasindan kurulum sifresini okuyoruz.
const envMetin = fs.readFileSync('.env.local', 'utf8');
const oku = (ad) => (envMetin.match(new RegExp(`^${ad}=(.*)$`, 'm')) || [])[1]?.trim();
const KURULUM_SIFRESI = oku('ADMIN_SETUP_TOKEN');
if (!KURULUM_SIFRESI) throw new Error('.env.local icinde ADMIN_SETUP_TOKEN yok');

// TOTP kodu uretmek icin derlenmis kutuphane
const { totpKodUret } = await import('../.test-build/src/lib/totp.js');

let gecen = 0;
let kalan = 0;
const kalanlar = [];

function test(ad, kosul, ayrinti = '') {
  if (kosul) {
    gecen++;
    console.log(`  GECTI  ${ad}`);
  } else {
    kalan++;
    kalanlar.push(`${ad} ${ayrinti}`);
    console.log(`  KALDI  ${ad}  ${ayrinti}`);
  }
}

// Cerezleri tarayici gibi tasiyan kucuk bir istemci
function istemciYap() {
  let cerez = '';
  return async function cagir(yol, secenekler = {}) {
    const basliklar = { ...(secenekler.headers || {}) };
    if (cerez) basliklar['Cookie'] = cerez;
    if (secenekler.json) {
      basliklar['Content-Type'] = 'application/json';
      secenekler.body = JSON.stringify(secenekler.json);
      secenekler.method = secenekler.method || 'POST';
    }
    const cevap = await fetch(TABAN + yol, { ...secenekler, headers: basliklar, redirect: 'manual' });
    const kur = cevap.headers.getSetCookie?.() || [];
    for (const c of kur) {
      const [ikili] = c.split(';');
      const [ad] = ikili.split('=');
      if (c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970')) {
        cerez = cerez.split('; ').filter((p) => !p.startsWith(ad + '=')).join('; ');
      } else {
        const digerleri = cerez.split('; ').filter((p) => p && !p.startsWith(ad + '='));
        cerez = [...digerleri, ikili].join('; ');
      }
    }
    let govde = null;
    const metin = await cevap.text();
    try { govde = JSON.parse(metin); } catch { govde = metin; }
    return { kod: cevap.status, govde };
  };
}

const dbOku = async (tablo, sorgu = '') => {
  const c = await fetch(`${SAHTE_DB}/rest/v1/${tablo}${sorgu}`);
  return c.json();
};

const SIFRE = 'MusteriSifresi2026!';
const EMOJI = 'yaprak';
let totpAnahtari = '';

console.log('\n================ KURULUM AKISI ================');
{
  const c = istemciYap();

  let r = await c('/api/admin/kurulum/durum');
  test('kurulum yapilmamis gorunuyor', r.kod === 200 && r.govde.kurulumTamam === false, JSON.stringify(r.govde));

  r = await c('/api/admin/kurulum/baslat', { json: { kurulumSifresi: 'yanlis-sifre-123' } });
  test('yanlis kurulum sifresi reddedilir', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/baslat', { json: { kurulumSifresi: KURULUM_SIFRESI } });
  test('dogru kurulum sifresi kabul edilir', r.kod === 200 && r.govde.basarili === true, `HTTP ${r.kod}`);
  test('dokuz emoji secenegi doner', Array.isArray(r.govde.emojiler) && r.govde.emojiler.length === 9);
  test('karekod uretildi', typeof r.govde.karekod === 'string' && r.govde.karekod.startsWith('data:image/png;base64,'));
  test('TOTP anahtari 32 karakter base32', /^[A-Z2-7]{32}$/.test(r.govde.totpAnahtari || ''));
  totpAnahtari = r.govde.totpAnahtari;
  const kapali = r.govde.totpAnahtariKapali;
  test('TOTP anahtari sifreli halde de gonderiliyor', typeof kapali === 'string' && kapali.split('.').length === 3);

  const kod = () => totpKodUret(totpAnahtari);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: KURULUM_SIFRESI, yeniSifre: 'kisa', yeniSifreTekrar: 'kisa', emoji: EMOJI, totpAnahtariKapali: kapali, dogrulamaKodu: kod() } });
  test('kisa sifre reddedilir', r.kod === 400, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: KURULUM_SIFRESI, yeniSifre: SIFRE, yeniSifreTekrar: 'baskaSifre123', emoji: EMOJI, totpAnahtariKapali: kapali, dogrulamaKodu: kod() } });
  test('birbirini tutmayan sifreler reddedilir', r.kod === 400, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: KURULUM_SIFRESI, yeniSifre: SIFRE, yeniSifreTekrar: SIFRE, emoji: 'olmayan-emoji', totpAnahtariKapali: kapali, dogrulamaKodu: kod() } });
  test('gecersiz emoji reddedilir', r.kod === 400, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: KURULUM_SIFRESI, yeniSifre: SIFRE, yeniSifreTekrar: SIFRE, emoji: EMOJI, totpAnahtariKapali: kapali, dogrulamaKodu: '000000' } });
  test('yanlis authenticator kodu reddedilir', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: 'yanlis', yeniSifre: SIFRE, yeniSifreTekrar: SIFRE, emoji: EMOJI, totpAnahtariKapali: kapali, dogrulamaKodu: kod() } });
  test('tamamla adiminda da kurulum sifresi sorulur', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/kurulum/tamamla', { json: { kurulumSifresi: KURULUM_SIFRESI, yeniSifre: SIFRE, yeniSifreTekrar: SIFRE, emoji: EMOJI, totpAnahtariKapali: kapali, dogrulamaKodu: kod() } });
  test('kurulum tamamlandi', r.kod === 200 && r.govde.basarili === true, JSON.stringify(r.govde));

  const satir = (await dbOku('admin_config', '?id=eq.1'))[0];
  test('sifre veritabaninda duz metin olarak durmuyor', satir.password_hash && !JSON.stringify(satir).includes(SIFRE));
  test('TOTP anahtari veritabaninda duz durmuyor', satir.totp_secret_enc && !satir.totp_secret_enc.includes(totpAnahtari));
  test('kurulum bayragi acildi', satir.setup_completed === true);

  r = await c('/api/admin/kurulum/baslat', { json: { kurulumSifresi: KURULUM_SIFRESI } });
  test('kurulum sifresi ikinci kez calismiyor', r.kod === 409, `HTTP ${r.kod}`);
}

console.log('\n================ UC KATMANLI GIRIS ================');
{
  const c = istemciYap();

  let r = await c('/api/admin/giris/durum');
  test('kurulum tamam, asama sifir', r.govde.kurulumTamam === true && r.govde.asama === 0, JSON.stringify(r.govde));

  r = await c('/api/admin/giris/adim1', { json: { sifre: 'YanlisSifre123' } });
  test('yanlis sifre reddedilir', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/giris/adim1', { json: { sifre: SIFRE } });
  test('1. katman: dogru sifre kabul edilir', r.kod === 200 && r.govde.asama === 1, `HTTP ${r.kod}`);
  test('emojiler karisik sirada geliyor', Array.isArray(r.govde.emojiler) && r.govde.emojiler.length === 9);

  r = await c('/api/admin/siparisler');
  test('1. katmanda panel verisi acilmiyor', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/giris/adim3', { json: { kod: totpKodUret(totpAnahtari) } });
  test('emoji atlanarak 3. katmana gecilemiyor', r.kod === 401, `HTTP ${r.kod}`);

  r = await c('/api/admin/giris/adim2', { json: { emoji: 'kahve' } });
  test('yanlis emoji reddedilir', r.kod === 401, `HTTP ${r.kod}`);
  test('yanlis emojide giris bastan basliyor', r.govde.asama === 0, JSON.stringify(r.govde));

  r = await c('/api/admin/giris/adim2', { json: { emoji: EMOJI } });
  test('oturum silindigi icin emoji tekrar denenemiyor', r.kod === 401, `HTTP ${r.kod}`);
}

console.log('\n================ TAM GIRIS VE PANEL ================');
const panel = istemciYap();
{
  let r = await panel('/api/admin/giris/adim1', { json: { sifre: SIFRE } });
  test('yeniden 1. katman gecildi', r.kod === 200 && r.govde.asama === 1);

  r = await panel('/api/admin/giris/adim2', { json: { emoji: EMOJI } });
  test('2. katman: dogru emoji kabul edildi', r.kod === 200 && r.govde.asama === 2, `HTTP ${r.kod}`);

  r = await panel('/api/admin/ayarlar/paytr');
  test('2. katmanda odeme ayarlari acilmiyor', r.kod === 401, `HTTP ${r.kod}`);

  r = await panel('/api/admin/giris/adim3', { json: { kod: '000000' } });
  test('yanlis authenticator kodu reddedilir', r.kod === 401, `HTTP ${r.kod}`);

  r = await panel('/api/admin/giris/adim3', { json: { kod: totpKodUret(totpAnahtari) } });
  test('3. katman: dogru kod kabul edildi', r.kod === 200 && r.govde.asama === 3, `HTTP ${r.kod}`);

  r = await panel('/api/admin/giris/durum');
  test('oturum tam yetkili gorunuyor', r.govde.asama === 3);

  r = await panel('/api/admin/siparisler');
  test('panel verisi artik aciliyor', r.kod === 200 && r.govde.basarili === true, `HTTP ${r.kod}`);
}

console.log('\n================ PAYTR AYARLARI ================');
const MERCHANT = { id: '654321', key: 'gizli_merchant_key_abc', salt: 'gizli_merchant_salt_xyz' };
{
  let r = await panel('/api/admin/ayarlar/paytr');
  test('ayarlar okunuyor', r.kod === 200 && r.govde.basarili === true);
  test('baslangicta anahtar kayitli degil', r.govde.ayarlar.merchantKeyKayitli === false);

  r = await panel('/api/admin/ayarlar/paytr', { json: { merchantId: '', aktif: false } });
  test('magaza no bos birakilamaz', r.kod === 400, `HTTP ${r.kod}`);

  r = await panel('/api/admin/ayarlar/paytr', { json: { merchantId: MERCHANT.id, maksTaksit: 13, aktif: false } });
  test('taksit sinirlari denetleniyor', r.kod === 400, `HTTP ${r.kod}`);

  r = await panel('/api/admin/ayarlar/paytr', { json: { merchantId: MERCHANT.id, aktif: true } });
  test('anahtarsiz odeme acilamiyor', r.kod === 400, `HTTP ${r.kod}`);

  r = await panel('/api/admin/ayarlar/paytr', {
    json: { merchantId: MERCHANT.id, merchantKey: MERCHANT.key, merchantSalt: MERCHANT.salt, testModu: true, taksitYok: false, maksTaksit: 6, paraBirimi: 'TL', zamanAsimi: 30, aktif: true },
  });
  test('PayTR bilgileri kaydedildi', r.kod === 200 && r.govde.basarili === true, JSON.stringify(r.govde));

  const satir = (await dbOku('payment_config', '?id=eq.1'))[0];
  test('merchant_key veritabaninda sifreli', satir.merchant_key_enc && !satir.merchant_key_enc.includes(MERCHANT.key));
  test('merchant_salt veritabaninda sifreli', satir.merchant_salt_enc && !satir.merchant_salt_enc.includes(MERCHANT.salt));
  test('merchant_id duz saklanabiliyor', satir.merchant_id === MERCHANT.id);
  test('kaydedilen taksit degeri dogru', satir.max_installment === 6);

  r = await panel('/api/admin/ayarlar/paytr');
  const metin = JSON.stringify(r.govde);
  test('anahtarlar panele geri gonderilmiyor', !metin.includes(MERCHANT.key) && !metin.includes(MERCHANT.salt), metin.slice(0, 120));
  test('anahtarin kayitli oldugu bildiriliyor', r.govde.ayarlar.merchantKeyKayitli === true && r.govde.ayarlar.merchantSaltKayitli === true);

  // Bos anahtarla kaydetmek mevcut degeri silmemeli
  r = await panel('/api/admin/ayarlar/paytr', { json: { merchantId: MERCHANT.id, merchantKey: '', merchantSalt: '', maksTaksit: 3, aktif: true } });
  const satir2 = (await dbOku('payment_config', '?id=eq.1'))[0];
  test('bos birakilan anahtar mevcut degeri ezmiyor', satir2.merchant_key_enc === satir.merchant_key_enc);
  test('diger alan guncellendi', satir2.max_installment === 3);
}

console.log('\n================ PAYTR BILDIRIM DOGRULAMASI ================');
{
  const oid = 'DEMTEST' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await fetch(`${SAHTE_DB}/rest/v1/paytr_transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_oid: oid, amount: 199, status: 'pending' }),
  });

  const hashYap = (o, durum, tutar) =>
    crypto.createHmac('sha256', MERCHANT.key).update(o + MERCHANT.salt + durum + tutar).digest('base64');

  const gonder = async (alanlar) => {
    const govde = new URLSearchParams(alanlar);
    const cevap = await fetch(TABAN + '/api/odeme/paytr/bildirim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: govde.toString(),
    });
    return { kod: cevap.status, metin: await cevap.text() };
  };

  let r = await gonder({ merchant_oid: oid, status: 'success', total_amount: '19900', hash: 'sahteHashDegeri' });
  test('sahte hash reddedilir ve OK basilmaz', r.kod === 400 && r.metin !== 'OK', `HTTP ${r.kod} ${r.metin}`);

  r = await gonder({ merchant_oid: oid, status: 'success', total_amount: '1', hash: hashYap(oid, 'success', '19900') });
  test('tutari degistirilmis bildirim reddedilir', r.kod === 400 && r.metin !== 'OK', `HTTP ${r.kod} ${r.metin}`);

  let satir = (await dbOku('paytr_transactions', `?merchant_oid=eq.${oid}`))[0];
  test('reddedilen bildirimler islemi degistirmedi', satir.status === 'pending', satir.status);

  r = await gonder({ merchant_oid: oid, status: 'success', total_amount: '19900', payment_type: 'card', installment_count: '3', currency: 'TL', test_mode: '1', hash: hashYap(oid, 'success', '19900') });
  test('gecerli bildirim kabul edilir ve OK basilir', r.kod === 200 && r.metin === 'OK', `HTTP ${r.kod} ${r.metin}`);

  satir = (await dbOku('paytr_transactions', `?merchant_oid=eq.${oid}`))[0];
  test('islem basarili olarak isaretlendi', satir.status === 'success', satir.status);
  test('tahsil edilen tutar TL olarak yazildi', satir.total_amount === 199, String(satir.total_amount));
  test('taksit sayisi kaydedildi', satir.installment_count === 3, String(satir.installment_count));

  r = await gonder({ merchant_oid: oid, status: 'success', total_amount: '19900', hash: hashYap(oid, 'success', '19900') });
  test('ayni bildirim tekrar gelince yine OK basilir', r.kod === 200 && r.metin === 'OK', `HTTP ${r.kod} ${r.metin}`);

  // Basarisiz odeme senaryosu
  const oid2 = 'DEMTEST' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await fetch(`${SAHTE_DB}/rest/v1/paytr_transactions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_oid: oid2, amount: 50, status: 'pending' }),
  });
  r = await gonder({ merchant_oid: oid2, status: 'failed', total_amount: '5000', failed_reason_code: '10', failed_reason_msg: 'Yetersiz bakiye', hash: hashYap(oid2, 'failed', '5000') });
  test('basarisiz odeme bildirimi de OK ile kapatilir', r.kod === 200 && r.metin === 'OK', `HTTP ${r.kod} ${r.metin}`);
  const satir2 = (await dbOku('paytr_transactions', `?merchant_oid=eq.${oid2}`))[0];
  test('basarisiz odeme isaretlendi', satir2.status === 'failed', satir2.status);
  test('hata sebebi kaydedildi', satir2.failed_reason_msg === 'Yetersiz bakiye', String(satir2.failed_reason_msg));
}

console.log('\n================ SIPARIS KAYDI ================');
{
  const jetonIste = async (govde) => {
    const c = await fetch(TABAN + '/api/odeme/paytr/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(govde),
    });
    let g = null;
    try { g = await c.json(); } catch { g = null; }
    return { kod: c.status, govde: g };
  };

  const gecerli = {
    email: 'musteri@ornek.com',
    ad: 'Ayse Yilmaz',
    telefon: '05001112233',
    adres: 'Ornek Mah. 1. Sok. No 2, Kadikoy / Istanbul',
    kargo: 150,
    sepet: [{ ad: 'Desotti Filter Kahve 1000g', fiyat: 1300, adet: 1 }],
  };

  // --- Dogrulama: eksik alanla siparis acilmamali ---
  let r = await jetonIste({ ...gecerli, sepet: [] });
  test('bos sepetle odeme baslatilamaz', r.kod === 400, `HTTP ${r.kod}`);

  r = await jetonIste({ ...gecerli, ad: '' });
  test('ad soyad olmadan odeme baslatilamaz', r.kod === 400, `HTTP ${r.kod}`);

  r = await jetonIste({ ...gecerli, telefon: '' });
  test('telefon olmadan odeme baslatilamaz', r.kod === 400, `HTTP ${r.kod}`);

  r = await jetonIste({ ...gecerli, adres: '' });
  test('adres olmadan odeme baslatilamaz', r.kod === 400, `HTTP ${r.kod}`);

  r = await jetonIste({ ...gecerli, email: 'gecersiz' });
  test('gecersiz e-posta ile odeme baslatilamaz', r.kod === 400, `HTTP ${r.kod}`);

  const oncekiSiparisler = await dbOku('orders');
  test('dogrulamada kalan istekler siparis olusturmadi', oncekiSiparisler.length === 0, `${oncekiSiparisler.length} satir`);

  // --- Gecerli istek: PayTR sahte anahtarla reddetse bile siparis satiri acilmali ---
  r = await jetonIste(gecerli);
  const siparisler = await dbOku('orders');
  test('gecerli istek siparis satiri olusturdu', siparisler.length === 1, `${siparisler.length} satir`);

  if (siparisler.length === 1) {
    const s = siparisler[0];
    test('musteri adi kaydedildi', s.customer_name === 'Ayse Yilmaz', String(s.customer_name));
    test('musteri e-postasi kaydedildi', s.customer_email === 'musteri@ornek.com', String(s.customer_email));
    test('telefon kaydedildi', s.customer_phone === '05001112233', String(s.customer_phone));
    test('adres kaydedildi', String(s.shipping_address).includes('Kadikoy'), String(s.shipping_address));
    // Tutar sunucuda hesaplanir: 1300 urun + 150 kargo = 1450
    test('tutar sunucuda hesaplandi (1300 + 150 kargo)', Number(s.total_amount) === 1450, String(s.total_amount));
    test('sepet icerigi kaydedildi', Array.isArray(s.items) && s.items[0]?.name === 'Desotti Filter Kahve 1000g', JSON.stringify(s.items));
    test('siparis merchant_oid ile baglandi', typeof s.merchant_oid === 'string' && s.merchant_oid.length > 0, String(s.merchant_oid));
    test('odeme saglayicisi paytr yazildi', s.payment_provider === 'paytr', String(s.payment_provider));
    test('PayTR reddedince siparis iptal isaretlendi', s.payment_status === 'failed' && s.status === 'cancelled', `${s.payment_status} / ${s.status}`);
  }

  // --- Bildirim geldiginde siparis odendi olarak isaretlenmeli ---
  const oid3 = 'DEMSIP' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await fetch(`${SAHTE_DB}/rest/v1/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_number: oid3, merchant_oid: oid3, customer_name: 'Mehmet Demir',
      customer_email: 'mehmet@ornek.com', customer_phone: '05009998877',
      shipping_address: 'Test adres', total_amount: 450, status: 'preparing',
      payment_status: 'pending', items: [{ name: 'Test Urun', price: 450, quantity: 1 }],
    }),
  });
  await fetch(`${SAHTE_DB}/rest/v1/paytr_transactions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_oid: oid3, order_number: oid3, amount: 450, status: 'pending' }),
  });

  const hash3 = crypto.createHmac('sha256', MERCHANT.key)
    .update(oid3 + MERCHANT.salt + 'success' + '45000').digest('base64');
  const c3 = await fetch(TABAN + '/api/odeme/paytr/bildirim', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ merchant_oid: oid3, status: 'success', total_amount: '45000', hash: hash3 }).toString(),
  });
  const m3 = await c3.text();
  test('siparisli bildirim OK basar', c3.status === 200 && m3 === 'OK', `HTTP ${c3.status} ${m3}`);

  const s3 = (await dbOku('orders', `?merchant_oid=eq.${oid3}`))[0];
  test('siparis odendi olarak isaretlendi', s3?.payment_status === 'paid', String(s3?.payment_status));
  test('siparis durumu hazirlaniyor kaldi', s3?.status === 'preparing', String(s3?.status));

  // --- Sahte bildirim siparisi odendi yapmamali ---
  const oid4 = 'DEMSIP' + crypto.randomBytes(3).toString('hex').toUpperCase();
  await fetch(`${SAHTE_DB}/rest/v1/orders`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order_number: oid4, merchant_oid: oid4, customer_email: 'x@y.com', total_amount: 100, status: 'preparing', payment_status: 'pending', items: [] }),
  });
  await fetch(`${SAHTE_DB}/rest/v1/paytr_transactions`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ merchant_oid: oid4, amount: 100, status: 'pending' }),
  });
  const c4 = await fetch(TABAN + '/api/odeme/paytr/bildirim', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ merchant_oid: oid4, status: 'success', total_amount: '10000', hash: 'tamamenSahteHash' }).toString(),
  });
  test('sahte bildirim OK basmaz', c4.status === 400, `HTTP ${c4.status}`);
  const s4 = (await dbOku('orders', `?merchant_oid=eq.${oid4}`))[0];
  test('sahte bildirim siparisi odendi yapmadi', s4?.payment_status === 'pending', String(s4?.payment_status));
}

console.log('\n================ CIKIS ================');
{
  let r = await panel('/api/admin/cikis', { method: 'POST' });
  test('cikis yapildi', r.kod === 200);
  r = await panel('/api/admin/siparisler');
  test('cikistan sonra panel verisi kapali', r.kod === 401, `HTTP ${r.kod}`);
  r = await panel('/api/admin/giris/durum');
  test('cikistan sonra asama sifir', r.govde.asama === 0, JSON.stringify(r.govde));
}

console.log('\n' + '='.repeat(52));
console.log(`UCTAN UCA: ${gecen} test gecti, ${kalan} test kaldi.`);
if (kalanlar.length) {
  console.log('\nKalanlar:');
  kalanlar.forEach((k) => console.log('  . ' + k));
}
console.log('='.repeat(52) + '\n');
process.exit(kalan === 0 ? 0 : 1);
