// src/app/admin/page.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  total_amount: number;
  status: 'preparing' | 'shipped' | 'completed' | 'cancelled';
  payment_status: 'paid' | 'pending' | 'failed';
  tracking_number?: string;
  created_at: string;
  items: OrderItem[];
}

interface EmojiSecenegi {
  anahtar: string;
  simge: string;
  ad: string;
}

interface PaytrAyarlari {
  merchantId: string;
  merchantKeyKayitli: boolean;
  merchantSaltKayitli: boolean;
  testModu: boolean;
  taksitYok: boolean;
  maksTaksit: number;
  paraBirimi: string;
  zamanAsimi: number;
  aktif: boolean;
  guncellenme: string | null;
}

export default function AdminPage() {
  const [hazir, setHazir] = useState(false);
  const [kurulumTamam, setKurulumTamam] = useState(true);
  const [asama, setAsama] = useState(0);

  useEffect(() => {
    let iptal = false;
    (async () => {
      try {
        const cevap = await fetch('/api/admin/giris/durum');
        const veri = await cevap.json();
        if (iptal) return;
        setKurulumTamam(Boolean(veri.kurulumTamam));
        setAsama(Number(veri.asama) || 0);
      } catch {
        if (!iptal) setKurulumTamam(false);
      } finally {
        if (!iptal) setHazir(true);
      }
    })();
    return () => {
      iptal = true;
    };
  }, []);

  if (!hazir) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Yukleniyor...</p>
      </div>
    );
  }

  if (!kurulumTamam) {
    return (
      <GirisKabugu baslik="DEM GIDA YONETIM" altBaslik="Ilk kurulum gerekli">
        <p className="text-neutral-300 text-sm leading-relaxed">
          Panel henuz kurulmadi. Size teslim edilen kurulum sifresiyle sifrenizi, simgenizi ve
          Google Authenticator baglantinizi olusturun.
        </p>
        <a
          href="/admin/kurulum"
          className="mt-6 block text-center bg-[#C49A6C] hover:bg-[#B3895B] text-white py-3 rounded-xl font-medium transition"
        >
          Kuruluma git
        </a>
      </GirisKabugu>
    );
  }

  if (asama < 3) {
    return <GirisAkisi asama={asama} asamaDegisti={setAsama} />;
  }

  return <Panel cikisYapildi={() => setAsama(0)} />;
}

// ============================================================
// 3 katmanli giris
// ============================================================

function GirisAkisi({
  asama,
  asamaDegisti,
}: {
  asama: number;
  asamaDegisti: (yeni: number) => void;
}) {
  const [sifre, setSifre] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [emojiler, setEmojiler] = useState<EmojiSecenegi[]>([]);
  const [kod, setKod] = useState('');
  const [hata, setHata] = useState('');
  const [islemde, setIslemde] = useState(false);

  const sifreGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setIslemde(true);
    try {
      const cevap = await fetch('/api/admin/giris/adim1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sifre }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Giris yapilamadi.');
        return;
      }
      setEmojiler(veri.emojiler || []);
      setSifre('');
      asamaDegisti(1);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setIslemde(false);
    }
  };

  const emojiGonder = async (anahtar: string) => {
    setHata('');
    setIslemde(true);
    try {
      const cevap = await fetch('/api/admin/giris/adim2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji: anahtar }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Simge dogrulanamadi.');
        asamaDegisti(Number(veri.asama) || 0);
        return;
      }
      asamaDegisti(2);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setIslemde(false);
    }
  };

  const kodGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setIslemde(true);
    try {
      const cevap = await fetch('/api/admin/giris/adim3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kod }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Kod dogrulanamadi.');
        return;
      }
      setKod('');
      asamaDegisti(3);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setIslemde(false);
    }
  };

  if (asama === 0) {
    return (
      <GirisKabugu baslik="DEM GIDA YONETIM" altBaslik="1. adim / 3 . Sifre">
        <form onSubmit={sifreGonder} className="space-y-4">
          <label className="block text-xs uppercase text-neutral-400 font-semibold tracking-wider">
            Yonetici sifresi
          </label>
          <div className="relative">
            <input
              type={sifreGoster ? 'text' : 'password'}
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              autoFocus
              className="w-full bg-[#1c1917] border border-neutral-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#C49A6C]"
            />
            <button
              type="button"
              onClick={() => setSifreGoster(!sifreGoster)}
              className="absolute right-3 top-3.5 text-neutral-400 hover:text-neutral-200 text-xs"
            >
              {sifreGoster ? 'Gizle' : 'Goster'}
            </button>
          </div>
          <Hata metin={hata} />
          <button
            type="submit"
            disabled={islemde}
            className="w-full bg-[#C49A6C] hover:bg-[#B3895B] disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition"
          >
            {islemde ? 'Kontrol ediliyor...' : 'Devam et'}
          </button>
        </form>
      </GirisKabugu>
    );
  }

  if (asama === 1) {
    return (
      <GirisKabugu baslik="DEM GIDA YONETIM" altBaslik="2. adim / 3 . Simge">
        <p className="text-neutral-400 text-xs leading-relaxed mb-4">
          Kurulumda sectiginiz simgeye dokunun.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {emojiler.map((e) => (
            <button
              key={e.anahtar}
              type="button"
              disabled={islemde}
              onClick={() => emojiGonder(e.anahtar)}
              aria-label={e.ad}
              className="aspect-square rounded-xl text-3xl flex items-center justify-center bg-[#1c1917] border border-neutral-700 hover:border-[#C49A6C] disabled:opacity-50 transition"
            >
              {e.simge}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Hata metin={hata} />
        </div>
      </GirisKabugu>
    );
  }

  return (
    <GirisKabugu baslik="DEM GIDA YONETIM" altBaslik="3. adim / 3 . Authenticator">
      <form onSubmit={kodGonder} className="space-y-4">
        <p className="text-neutral-400 text-xs leading-relaxed">
          Google Authenticator uygulamasindaki 6 haneli kodu girin.
        </p>
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={kod}
          autoFocus
          onChange={(e) => setKod(e.target.value.replace(/\D/g, ''))}
          className="w-full bg-[#1c1917] border border-neutral-700 text-white px-4 py-3 rounded-xl text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:border-[#C49A6C]"
        />
        <Hata metin={hata} />
        <button
          type="submit"
          disabled={islemde}
          className="w-full bg-[#C49A6C] hover:bg-[#B3895B] disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition"
        >
          {islemde ? 'Kontrol ediliyor...' : 'Panele gir'}
        </button>
      </form>
    </GirisKabugu>
  );
}

// ============================================================
// Panel
// ============================================================

function Panel({ cikisYapildi }: { cikisYapildi: () => void }) {
  const [sekme, setSekme] = useState<'siparisler' | 'odeme'>('siparisler');

  const cikisYap = async () => {
    await fetch('/api/admin/cikis', { method: 'POST' });
    cikisYapildi();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-neutral-900">
      <header className="bg-white border-b border-neutral-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#3b2314] rounded-lg flex items-center justify-center font-serif font-bold text-white">
            D
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">DEM GIDA &amp; KAHVE</h1>
            <p className="text-xs text-neutral-500">Yonetim paneli</p>
          </div>
        </div>
        <button
          onClick={cikisYap}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg font-medium transition"
        >
          Cikis yap
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-6 flex gap-2">
        {[
          { anahtar: 'siparisler' as const, etiket: 'Siparisler' },
          { anahtar: 'odeme' as const, etiket: 'Odeme ayarlari' },
        ].map((s) => (
          <button
            key={s.anahtar}
            onClick={() => setSekme(s.anahtar)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              sekme === s.anahtar
                ? 'bg-[#3b2314] text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {s.etiket}
          </button>
        ))}
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {sekme === 'siparisler' ? <SiparislerSekmesi /> : <OdemeSekmesi />}
      </main>
    </div>
  );
}

function SiparislerSekmesi() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState('');
  const [filtre, setFiltre] = useState('all');
  const [secili, setSecili] = useState<Order | null>(null);
  const [takipKodu, setTakipKodu] = useState('');
  const [guncelleniyor, setGuncelleniyor] = useState(false);

  const siparisleriCek = useCallback(async () => {
    try {
      const cevap = await fetch('/api/admin/siparisler');
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Siparisler okunamadi.');
        setOrders([]);
        return;
      }
      setHata('');
      setOrders(veri.siparisler || []);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setLoading(false);
    }
  }, []);

  const yenile = () => {
    setLoading(true);
    siparisleriCek();
  };

  useEffect(() => {
    (async () => {
      await siparisleriCek();
    })();
  }, [siparisleriCek]);

  const durumGuncelle = async (
    siparisNo: string,
    yeniDurum: Order['status'],
    takip?: string
  ) => {
    setGuncelleniyor(true);
    try {
      const cevap = await fetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: siparisNo,
          status: yeniDurum,
          trackingNumber: takip,
        }),
      });
      const veri = await cevap.json();
      if (!veri.success) {
        setHata(veri.error || 'Guncelleme basarisiz.');
        return;
      }
      setOrders((once) =>
        once.map((o) =>
          o.order_number === siparisNo
            ? { ...o, status: yeniDurum, tracking_number: takip ?? o.tracking_number }
            : o
        )
      );
      setSecili((o) =>
        o && o.order_number === siparisNo
          ? { ...o, status: yeniDurum, tracking_number: takip ?? o.tracking_number }
          : o
      );
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setGuncelleniyor(false);
    }
  };

  const ciro = orders.reduce(
    (t, o) => t + (o.payment_status === 'paid' ? Number(o.total_amount) : 0),
    0
  );
  const bekleyen = orders.filter((o) => o.status === 'preparing').length;
  const listelenen = filtre === 'all' ? orders : orders.filter((o) => o.status === filtre);

  return (
    <>
      {hata && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-4 rounded-xl">
          {hata}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kart baslik="Toplam siparis" deger={`${orders.length} adet`} renk="text-neutral-900" />
        <Kart baslik="Hazirlanan" deger={`${bekleyen} siparis`} renk="text-amber-600" />
        <Kart
          baslik="Tahsil edilen"
          deger={`${ciro.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`}
          renk="text-emerald-600"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Tumu' },
          { key: 'preparing', label: 'Hazirlaniyor' },
          { key: 'shipped', label: 'Kargoya verildi' },
          { key: 'completed', label: 'Tamamlandi' },
          { key: 'cancelled', label: 'Iptal' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFiltre(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
              filtre === t.key
                ? 'bg-[#3b2314] text-white shadow-sm'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={yenile}
          className="px-4 py-2 rounded-xl text-xs font-medium bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition"
        >
          Yenile
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-sm">Siparisler yukleniyor...</div>
        ) : listelenen.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 text-sm">
            Bu filtreye uygun siparis yok.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Siparis no</th>
                  <th className="py-3 px-4">Musteri</th>
                  <th className="py-3 px-4">Tutar</th>
                  <th className="py-3 px-4">Odeme</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Tarih</th>
                  <th className="py-3 px-4 text-right">Islem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {listelenen.map((o) => (
                  <tr key={o.order_number} className="hover:bg-neutral-50/50 transition">
                    <td className="py-4 px-4 font-mono font-semibold text-neutral-900">
                      {o.order_number}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-neutral-900">{o.customer_name}</div>
                      <div className="text-xs text-neutral-400">{o.customer_phone}</div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-neutral-900">
                      {Number(o.total_amount).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      TL
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          o.payment_status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : o.payment_status === 'failed'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {o.payment_status === 'paid'
                          ? 'Odendi'
                          : o.payment_status === 'failed'
                          ? 'Basarisiz'
                          : 'Bekliyor'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <DurumRozeti durum={o.status} />
                    </td>
                    <td className="py-4 px-4 text-xs text-neutral-500">
                      {new Date(o.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setSecili(o);
                          setTakipKodu(o.tracking_number || '');
                        }}
                        className="bg-[#faf8f5] hover:bg-[#efece6] border border-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {secili && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <h3 className="font-bold text-neutral-900 font-mono text-base">
                  {secili.order_number}
                </h3>
                <span className="text-xs text-neutral-500">Siparis detayi</span>
              </div>
              <button
                onClick={() => setSecili(null)}
                className="text-neutral-400 hover:text-neutral-700 text-lg p-1"
              >
                Kapat
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#fcfaf7] p-4 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Musteri
                  </span>
                  <p className="font-medium text-neutral-900 text-sm mt-1">{secili.customer_name}</p>
                  <p className="text-xs text-neutral-600">{secili.customer_email}</p>
                  <p className="text-xs text-neutral-600">{secili.customer_phone}</p>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                    Teslimat adresi
                  </span>
                  <p className="text-xs text-neutral-700 mt-1 leading-relaxed">
                    {secili.shipping_address}
                  </p>
                </div>
              </div>

              {Array.isArray(secili.items) && secili.items.length > 0 && (
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                    Urunler
                  </span>
                  <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Urun</th>
                          <th className="py-2.5 px-3 text-center">Adet</th>
                          <th className="py-2.5 px-3 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {secili.items.map((it, i) => (
                          <tr key={i}>
                            <td className="py-2.5 px-3 font-medium text-neutral-900">{it.name}</td>
                            <td className="py-2.5 px-3 text-center">{it.quantity}</td>
                            <td className="py-2.5 px-3 text-right font-medium">
                              {(Number(it.price) * it.quantity).toFixed(2)} TL
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                  Kargo takip kodu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={takipKodu}
                    onChange={(e) => setTakipKodu(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#C49A6C]"
                  />
                  <button
                    onClick={() => durumGuncelle(secili.order_number, secili.status, takipKodu)}
                    disabled={guncelleniyor}
                    className="bg-neutral-800 hover:bg-neutral-900 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-medium"
                  >
                    Kaydet
                  </button>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
                  Durumu guncelle
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(
                    [
                      ['preparing', 'Hazirlaniyor'],
                      ['shipped', 'Kargoya verildi'],
                      ['completed', 'Tamamlandi'],
                      ['cancelled', 'Iptal'],
                    ] as [Order['status'], string][]
                  ).map(([deger, etiket]) => (
                    <button
                      key={deger}
                      onClick={() => durumGuncelle(secili.order_number, deger, takipKodu)}
                      disabled={guncelleniyor}
                      className={`py-2 px-3 rounded-lg text-xs font-medium border transition disabled:opacity-50 ${
                        secili.status === deger
                          ? 'bg-[#3b2314] border-[#3b2314] text-white'
                          : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                      }`}
                    >
                      {etiket}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OdemeSekmesi() {
  const [ayar, setAyar] = useState<PaytrAyarlari | null>(null);
  const [merchantId, setMerchantId] = useState('');
  const [merchantKey, setMerchantKey] = useState('');
  const [merchantSalt, setMerchantSalt] = useState('');
  const [testModu, setTestModu] = useState(true);
  const [taksitYok, setTaksitYok] = useState(false);
  const [maksTaksit, setMaksTaksit] = useState(0);
  const [aktif, setAktif] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [bilgi, setBilgi] = useState('');

  const ayarlariCek = useCallback(async () => {
    try {
      const cevap = await fetch('/api/admin/ayarlar/paytr');
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Ayarlar okunamadi.');
        return;
      }
      const a: PaytrAyarlari = veri.ayarlar;
      setAyar(a);
      setMerchantId(a.merchantId);
      setTestModu(a.testModu);
      setTaksitYok(a.taksitYok);
      setMaksTaksit(a.maksTaksit);
      setAktif(a.aktif);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await ayarlariCek();
    })();
  }, [ayarlariCek]);

  const kaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setBilgi('');
    setKaydediliyor(true);
    try {
      const cevap = await fetch('/api/admin/ayarlar/paytr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId,
          merchantKey,
          merchantSalt,
          testModu,
          taksitYok,
          maksTaksit: Number(maksTaksit),
          paraBirimi: 'TL',
          zamanAsimi: 30,
          aktif,
        }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Kaydedilemedi.');
        return;
      }
      setMerchantKey('');
      setMerchantSalt('');
      setBilgi('Ayarlar kaydedildi.');
      ayarlariCek();
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setKaydediliyor(false);
    }
  };

  if (yukleniyor) {
    return <div className="p-12 text-center text-neutral-400 text-sm">Ayarlar yukleniyor...</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 max-w-2xl">
      <h2 className="font-serif font-bold text-lg mb-1">PayTR magaza bilgileri</h2>
      <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
        Bu bilgileri PayTR magaza panelinizden alabilirsiniz. Kaydettiginiz anahtarlar sifreli
        saklanir ve bir daha ekranda gosterilmez.
      </p>

      <form onSubmit={kaydet} className="space-y-5">
        <Alan etiket="Magaza no (merchant_id)">
          <input
            type="text"
            value={merchantId}
            onChange={(e) => setMerchantId(e.target.value)}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#C49A6C]"
          />
        </Alan>

        <Alan
          etiket="Magaza parolasi (merchant_key)"
          ipucu={ayar?.merchantKeyKayitli ? 'Kayitli. Degistirmek icin yeni degeri yazin.' : 'Henuz girilmedi.'}
        >
          <input
            type="password"
            value={merchantKey}
            onChange={(e) => setMerchantKey(e.target.value)}
            placeholder={ayar?.merchantKeyKayitli ? 'Degistirmek icin yazin' : ''}
            autoComplete="new-password"
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#C49A6C]"
          />
        </Alan>

        <Alan
          etiket="Magaza gizli anahtari (merchant_salt)"
          ipucu={ayar?.merchantSaltKayitli ? 'Kayitli. Degistirmek icin yeni degeri yazin.' : 'Henuz girilmedi.'}
        >
          <input
            type="password"
            value={merchantSalt}
            onChange={(e) => setMerchantSalt(e.target.value)}
            placeholder={ayar?.merchantSaltKayitli ? 'Degistirmek icin yazin' : ''}
            autoComplete="new-password"
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-mono focus:outline-none focus:border-[#C49A6C]"
          />
        </Alan>

        <Alan etiket="Azami taksit (0 ile 12 arasi, 0 sinirsiz demektir)">
          <input
            type="number"
            min={0}
            max={12}
            value={maksTaksit}
            onChange={(e) => setMaksTaksit(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-[#C49A6C]"
          />
        </Alan>

        <div className="space-y-3 pt-2">
          <Anahtar etiket="Test modu (gercek para cekilmez)" deger={testModu} degisti={setTestModu} />
          <Anahtar etiket="Taksit secenegi gosterilmesin" deger={taksitYok} degisti={setTaksitYok} />
          <Anahtar etiket="PayTR ile odeme acik" deger={aktif} degisti={setAktif} />
        </div>

        {hata && (
          <p className="text-red-700 text-xs bg-red-50 p-3 rounded-lg border border-red-200">{hata}</p>
        )}
        {bilgi && (
          <p className="text-emerald-700 text-xs bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            {bilgi}
          </p>
        )}

        <button
          type="submit"
          disabled={kaydediliyor}
          className="w-full bg-[#3b2314] hover:bg-[#2a190e] disabled:opacity-50 text-white py-3 rounded-xl font-medium transition"
        >
          {kaydediliyor ? 'Kaydediliyor...' : 'Ayarlari kaydet'}
        </button>

        {ayar?.guncellenme && (
          <p className="text-[11px] text-neutral-400 text-center">
            Son guncelleme: {new Date(ayar.guncellenme).toLocaleString('tr-TR')}
          </p>
        )}
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 block mb-2">
          PayTR bildirim adresi
        </span>
        <p className="text-xs text-neutral-600 leading-relaxed mb-2">
          PayTR magaza panelinde Ayarlar bolumundeki bildirim adresi alanina asagidaki adresi yazin.
        </p>
        <code className="block bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-xs font-mono break-all">
          https://www.demgida.com/api/odeme/paytr/bildirim
        </code>
      </div>
    </div>
  );
}

// ============================================================
// Kucuk parcalar
// ============================================================

function GirisKabugu({
  baslik,
  altBaslik,
  children,
}: {
  baslik: string;
  altBaslik?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#1c1917] flex items-center justify-center p-4">
      <div className="bg-[#292524] p-8 rounded-2xl w-full max-w-md border border-neutral-800 shadow-2xl">
        <div className="text-center mb-7">
          <h1 className="text-2xl font-serif font-bold text-[#fafaf9] tracking-wide">{baslik}</h1>
          {altBaslik && (
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-widest">{altBaslik}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Hata({ metin }: { metin: string }) {
  if (!metin) return null;
  return (
    <p className="text-red-400 text-xs bg-red-950/40 p-3 rounded-lg border border-red-900/50">
      {metin}
    </p>
  );
}

function Kart({ baslik, deger, renk }: { baslik: string; deger: string; renk: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-sm">
      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {baslik}
      </span>
      <p className={`text-2xl font-bold mt-2 ${renk}`}>{deger}</p>
    </div>
  );
}

function DurumRozeti({ durum }: { durum: Order['status'] }) {
  const harita: Record<Order['status'], [string, string]> = {
    preparing: ['bg-amber-100 text-amber-800', 'Hazirlaniyor'],
    shipped: ['bg-blue-100 text-blue-800', 'Kargoya verildi'],
    completed: ['bg-emerald-100 text-emerald-800', 'Tamamlandi'],
    cancelled: ['bg-neutral-100 text-neutral-700', 'Iptal edildi'],
  };
  const [sinif, etiket] = harita[durum] || harita.preparing;
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${sinif}`}>
      {etiket}
    </span>
  );
}

function Alan({
  etiket,
  ipucu,
  children,
}: {
  etiket: string;
  ipucu?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
        {etiket}
      </label>
      {children}
      {ipucu && <p className="text-[11px] text-neutral-400 mt-1">{ipucu}</p>}
    </div>
  );
}

function Anahtar({
  etiket,
  deger,
  degisti,
}: {
  etiket: string;
  deger: boolean;
  degisti: (yeni: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm text-neutral-700">{etiket}</span>
      <button
        type="button"
        role="switch"
        aria-checked={deger}
        onClick={() => degisti(!deger)}
        className={`relative w-11 h-6 rounded-full transition shrink-0 ${
          deger ? 'bg-emerald-500' : 'bg-neutral-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
            deger ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </label>
  );
}
