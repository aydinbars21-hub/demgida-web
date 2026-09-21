// src/app/admin/kurulum/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface EmojiSecenegi {
  anahtar: string;
  simge: string;
  ad: string;
}

export default function KurulumSayfasi() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kurulumTamam, setKurulumTamam] = useState(false);

  const [adim, setAdim] = useState<0 | 1 | 2 | 3>(0);
  const [kurulumSifresi, setKurulumSifresi] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [sifreGoster, setSifreGoster] = useState(false);
  const [emojiler, setEmojiler] = useState<EmojiSecenegi[]>([]);
  const [secilenEmoji, setSecilenEmoji] = useState('');
  const [karekod, setKarekod] = useState('');
  const [totpAnahtari, setTotpAnahtari] = useState('');
  const [totpKapali, setTotpKapali] = useState('');
  const [dogrulamaKodu, setDogrulamaKodu] = useState('');

  const [hata, setHata] = useState('');
  const [islemde, setIslemde] = useState(false);
  const [bitti, setBitti] = useState(false);

  useEffect(() => {
    fetch('/api/admin/kurulum/durum')
      .then((r) => r.json())
      .then((d) => {
        setKurulumTamam(Boolean(d.kurulumTamam));
        if (!d.basarili && d.hata) setHata(d.hata);
      })
      .catch(() => setHata('Sunucuya ulasilamadi.'))
      .finally(() => setYukleniyor(false));
  }, []);

  const kurulumuBaslat = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setIslemde(true);
    try {
      const cevap = await fetch('/api/admin/kurulum/baslat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kurulumSifresi }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Kurulum baslatilamadi.');
        return;
      }
      setEmojiler(veri.emojiler || []);
      setKarekod(veri.karekod);
      setTotpAnahtari(veri.totpAnahtari);
      setTotpKapali(veri.totpAnahtariKapali);
      setAdim(1);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setIslemde(false);
    }
  };

  const sifreyiOnayla = (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    if (yeniSifre.length < 10) {
      setHata('Sifre en az 10 karakter olmali.');
      return;
    }
    if (yeniSifre !== yeniSifreTekrar) {
      setHata('Sifreler birbirini tutmuyor.');
      return;
    }
    setAdim(2);
  };

  const emojiyiOnayla = () => {
    setHata('');
    if (!secilenEmoji) {
      setHata('Bir simge secin.');
      return;
    }
    setAdim(3);
  };

  const kurulumuTamamla = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    setIslemde(true);
    try {
      const cevap = await fetch('/api/admin/kurulum/tamamla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kurulumSifresi,
          yeniSifre,
          yeniSifreTekrar,
          emoji: secilenEmoji,
          totpAnahtariKapali: totpKapali,
          dogrulamaKodu,
        }),
      });
      const veri = await cevap.json();
      if (!veri.basarili) {
        setHata(veri.hata || 'Kurulum tamamlanamadi.');
        return;
      }
      setBitti(true);
    } catch {
      setHata('Sunucuya ulasilamadi.');
    } finally {
      setIslemde(false);
    }
  };

  if (yukleniyor) {
    return (
      <div className="min-h-screen bg-[#1c1917] flex items-center justify-center">
        <p className="text-neutral-400 text-sm">Yukleniyor...</p>
      </div>
    );
  }

  if (kurulumTamam && !bitti) {
    return (
      <Kabuk baslik="Kurulum tamamlanmis">
        <p className="text-neutral-300 text-sm leading-relaxed">
          Bu panelin ilk kurulumu daha once yapilmis. Giris icin yonetim sayfasini kullanin.
        </p>
        <a
          href="/admin"
          className="mt-6 block text-center bg-[#C49A6C] hover:bg-[#B3895B] text-white py-3 rounded-xl font-medium transition"
        >
          Giris ekranina git
        </a>
      </Kabuk>
    );
  }

  if (bitti) {
    return (
      <Kabuk baslik="Kurulum tamamlandi">
        <p className="text-neutral-300 text-sm leading-relaxed">
          Sifreniz, simgeniz ve Google Authenticator kurulumunuz kaydedildi. Artik panele
          kendi bilgilerinizle girebilirsiniz. Kurulum sifresi bu andan itibaren gecersizdir.
        </p>
        <a
          href="/admin"
          className="mt-6 block text-center bg-[#C49A6C] hover:bg-[#B3895B] text-white py-3 rounded-xl font-medium transition"
        >
          Panele giris yap
        </a>
      </Kabuk>
    );
  }

  return (
    <Kabuk baslik="Yonetim paneli kurulumu" altBaslik={`Adim ${adim + 1} / 4`}>
      {adim === 0 && (
        <form onSubmit={kurulumuBaslat} className="space-y-4">
          <p className="text-neutral-400 text-xs leading-relaxed">
            Size teslim edilen kurulum sifresini girin. Bu sifre yalnizca ilk kurulum icindir,
            kurulum bitince calismaz.
          </p>
          <Etiket>Kurulum sifresi</Etiket>
          <input
            type="text"
            value={kurulumSifresi}
            onChange={(e) => setKurulumSifresi(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-[#1c1917] border border-neutral-700 text-white px-4 py-3 rounded-xl font-mono text-sm focus:outline-none focus:border-[#C49A6C]"
          />
          <HataKutusu metin={hata} />
          <Dugme islemde={islemde}>Devam et</Dugme>
        </form>
      )}

      {adim === 1 && (
        <form onSubmit={sifreyiOnayla} className="space-y-4">
          <p className="text-neutral-400 text-xs leading-relaxed">
            Panele girerken kullanacaginiz sifreyi belirleyin. En az 10 karakter olmali.
          </p>
          <Etiket>Yeni sifre</Etiket>
          <div className="relative">
            <input
              type={sifreGoster ? 'text' : 'password'}
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
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
          <Etiket>Yeni sifre tekrar</Etiket>
          <input
            type={sifreGoster ? 'text' : 'password'}
            value={yeniSifreTekrar}
            onChange={(e) => setYeniSifreTekrar(e.target.value)}
            className="w-full bg-[#1c1917] border border-neutral-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#C49A6C]"
          />
          <HataKutusu metin={hata} />
          <Dugme islemde={false}>Devam et</Dugme>
        </form>
      )}

      {adim === 2 && (
        <div className="space-y-4">
          <p className="text-neutral-400 text-xs leading-relaxed">
            Asagidaki dokuz simgeden birini secin. Her giriste sifreden sonra bu simgeyi
            isaretlemeniz istenecek. Simgelerin sirasi her seferinde degisir.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {emojiler.map((e) => (
              <button
                key={e.anahtar}
                type="button"
                onClick={() => setSecilenEmoji(e.anahtar)}
                aria-label={e.ad}
                className={`aspect-square rounded-xl text-3xl flex items-center justify-center border transition ${
                  secilenEmoji === e.anahtar
                    ? 'bg-[#C49A6C]/20 border-[#C49A6C]'
                    : 'bg-[#1c1917] border-neutral-700 hover:border-neutral-500'
                }`}
              >
                {e.simge}
              </button>
            ))}
          </div>
          <HataKutusu metin={hata} />
          <button
            type="button"
            onClick={emojiyiOnayla}
            className="w-full bg-[#C49A6C] hover:bg-[#B3895B] text-white py-3.5 rounded-xl font-medium transition"
          >
            Devam et
          </button>
        </div>
      )}

      {adim === 3 && (
        <form onSubmit={kurulumuTamamla} className="space-y-4">
          <p className="text-neutral-400 text-xs leading-relaxed">
            Telefonunuzda Google Authenticator uygulamasini acin, arti isaretine basip
            karekodu okutun. Sonra uygulamada gorunen 6 haneli kodu asagiya yazin.
          </p>

          {karekod && (
            <div className="bg-white p-3 rounded-xl flex justify-center">
              <Image src={karekod} alt="Authenticator karekodu" width={200} height={200} unoptimized />
            </div>
          )}

          <div className="bg-[#1c1917] border border-neutral-700 rounded-xl p-3">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 block mb-1">
              Karekod okunmuyorsa elle girilecek anahtar
            </span>
            <code className="text-[#C49A6C] text-xs break-all font-mono">{totpAnahtari}</code>
          </div>

          <Etiket>Uygulamadaki 6 haneli kod</Etiket>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={dogrulamaKodu}
            onChange={(e) => setDogrulamaKodu(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-[#1c1917] border border-neutral-700 text-white px-4 py-3 rounded-xl text-center text-2xl tracking-[0.4em] font-mono focus:outline-none focus:border-[#C49A6C]"
          />
          <HataKutusu metin={hata} />
          <Dugme islemde={islemde}>Kurulumu tamamla</Dugme>
        </form>
      )}
    </Kabuk>
  );
}

function Kabuk({
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
          <h1 className="text-xl font-serif font-bold text-[#fafaf9] tracking-wide">{baslik}</h1>
          {altBaslik && (
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-widest">{altBaslik}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function Etiket({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs uppercase text-neutral-400 font-semibold tracking-wider">
      {children}
    </label>
  );
}

function HataKutusu({ metin }: { metin: string }) {
  if (!metin) return null;
  return (
    <p className="text-red-400 text-xs bg-red-950/40 p-3 rounded-lg border border-red-900/50">
      {metin}
    </p>
  );
}

function Dugme({ islemde, children }: { islemde: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={islemde}
      className="w-full bg-[#C49A6C] hover:bg-[#B3895B] disabled:opacity-50 text-white py-3.5 rounded-xl font-medium transition"
    >
      {islemde ? 'Lutfen bekleyin...' : children}
    </button>
  );
}
