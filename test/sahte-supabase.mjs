// test/sahte-supabase.mjs
// Bellekte calisan kucuk bir PostgREST taklidi.
// Amaci: Supabase projesine erisim olmadan uc katmanli giris akisini
// ve PayTR ayar kaydini gercek HTTP uzerinden uctan uca test edebilmek.
import http from 'http';

const tablolar = {
  admin_config: [{ id: 1, password_hash: null, password_salt: null, emoji_key: null, totp_secret_enc: null, setup_completed: false, setup_done_at: null, updated_at: null }],
  payment_config: [{ id: 1, provider: 'paytr', merchant_id: null, merchant_key_enc: null, merchant_salt_enc: null, test_mode: true, no_installment: false, max_installment: 0, currency: 'TL', timeout_limit: 30, is_active: false, updated_at: null }],
  admin_sessions: [],
  admin_login_attempts: [],
  paytr_transactions: [],
  admin_audit_log: [],
  orders: [],
};

let sonrakiId = 1;

function suzgecUygula(satirlar, sorgu) {
  let sonuc = satirlar;
  for (const [alan, ham] of sorgu.entries()) {
    if (['select', 'order', 'limit', 'offset', 'on_conflict'].includes(alan)) continue;
    const [islec, ...kalan] = ham.split('.');
    const deger = kalan.join('.');
    sonuc = sonuc.filter((s) => {
      const v = s[alan];
      switch (islec) {
        case 'eq': return String(v) === deger || (deger === 'false' && v === false) || (deger === 'true' && v === true);
        case 'gte': return new Date(v) >= new Date(deger);
        case 'lt': return new Date(v) < new Date(deger);
        case 'is': return deger === 'null' ? v === null || v === undefined : String(v) === deger;
        default: return true;
      }
    });
  }
  return sonuc;
}

function govdeOku(istek) {
  return new Promise((coz) => {
    let veri = '';
    istek.on('data', (p) => (veri += p));
    istek.on('end', () => coz(veri));
  });
}

const sunucu = http.createServer(async (istek, cevap) => {
  const url = new URL(istek.url, 'http://localhost');
  const parcalar = url.pathname.split('/').filter(Boolean);
  if (parcalar[0] !== 'rest' || parcalar[1] !== 'v1') {
    cevap.writeHead(404).end('{}');
    return;
  }
  const tabloAdi = parcalar[2];
  if (!tablolar[tabloAdi]) tablolar[tabloAdi] = [];
  const tablo = tablolar[tabloAdi];
  const tercih = istek.headers['prefer'] || '';
  const govde = await govdeOku(istek);

  const yanit = (durum, veri, basliklar = {}) => {
    const govdeMetin = veri === null ? '' : JSON.stringify(veri);
    cevap.writeHead(durum, {
      'Content-Type': 'application/json; charset=utf-8',
      ...basliklar,
    });
    cevap.end(govdeMetin);
  };

  try {
    if (istek.method === 'GET') {
      const eslesen = suzgecUygula(tablo, url.searchParams);
      if (tercih.includes('count=exact')) {
        yanit(200, [], { 'Content-Range': `0-${Math.max(eslesen.length - 1, 0)}/${eslesen.length}` });
        return;
      }
      const tekli = (istek.headers['accept'] || '').includes('pgrst.object');
      if (tekli) {
        if (eslesen.length === 0) {
          // maybeSingle: bos sonuc icin 406 degil, bos govde beklenir
          yanit(200, null);
          return;
        }
        yanit(200, eslesen[0]);
        return;
      }
      yanit(200, eslesen);
      return;
    }

    if (istek.method === 'POST') {
      const gelen = JSON.parse(govde || '[]');
      const kayitlar = Array.isArray(gelen) ? gelen : [gelen];
      const yazilan = [];
      for (const kayit of kayitlar) {
        const cakismaAlani = url.searchParams.get('on_conflict');
        const birlestir = tercih.includes('merge-duplicates');
        let mevcut = null;
        if (birlestir && cakismaAlani) {
          mevcut = tablo.find((s) => String(s[cakismaAlani]) === String(kayit[cakismaAlani]));
        }
        if (mevcut) {
          Object.assign(mevcut, kayit);
          yazilan.push(mevcut);
        } else {
          const yeni = { id: kayit.id ?? sonrakiId++, created_at: new Date().toISOString(), ...kayit };
          tablo.push(yeni);
          yazilan.push(yeni);
        }
      }
      yanit(201, tercih.includes('return=representation') ? yazilan : []);
      return;
    }

    if (istek.method === 'PATCH') {
      const guncel = JSON.parse(govde || '{}');
      const eslesen = suzgecUygula(tablo, url.searchParams);
      eslesen.forEach((s) => Object.assign(s, guncel));
      yanit(200, tercih.includes('return=representation') ? eslesen : []);
      return;
    }

    if (istek.method === 'DELETE') {
      const eslesen = suzgecUygula(tablo, url.searchParams);
      for (const s of eslesen) {
        const i = tablo.indexOf(s);
        if (i >= 0) tablo.splice(i, 1);
      }
      yanit(204, null);
      return;
    }

    yanit(405, { message: 'desteklenmeyen metot' });
  } catch (hata) {
    yanit(500, { message: hata.message });
  }
});

const port = Number(process.argv[2] || 54330);
sunucu.listen(port, () => console.log(`sahte supabase ${port} portunda`));

// Test betiginin durumu okuyabilmesi icin basit bir kapi
sunucu.on('request', () => {});
process.on('SIGTERM', () => sunucu.close());
