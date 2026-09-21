// src/app/yeni/page.tsx
// ORNEK TASARIM. Canli ana sayfa (/) degismedi, bu ayri bir adres.
// Cizgi: Apple. Notr zemin, tek vurgu rengi, kil payi cizgiler, bol hava,
// iri ve siki harf aralikli basliklar, olculu hareket.
// Icerik, bolum sirasi ve butun rakamlar mevcut ana sayfadan aynen korundu.
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArrowRight, Truck, ShieldCheck, Leaf, Coffee } from 'lucide-react';
import { products } from '@/data/products';
import YeniBaslik from '@/components/yeni/YeniBaslik';
import YeniHero from '@/components/yeni/YeniHero';
import YeniBelir from '@/components/yeni/YeniBelir';
import YeniUrunKarti from '@/components/yeni/YeniUrunKarti';
import YeniAltBilgi from '@/components/yeni/YeniAltBilgi';

export const metadata: Metadata = {
  title: 'Dem Gıda | Yeni tasarım önizleme',
  description: 'Dem Gıda ana sayfasının yeni tasarım önerisi.',
  robots: { index: false, follow: false },
};

const HIKAYE_GORSELI =
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=1100&auto=format&fit=crop';

const RAKAMLAR = [
  { deger: '500+', etiket: 'Mutlu müşteri' },
  { deger: '24s', etiket: 'Hızlı teslimat' },
  { deger: '%100', etiket: 'Doğal garanti' },
];

const GUVENCELER = [
  { Simge: Truck, baslik: 'Hızlı teslimat', alt: '24 saatte kargoda' },
  { Simge: ShieldCheck, baslik: 'Güvenli ödeme', alt: '%100 PayTR güvencesi' },
  { Simge: Leaf, baslik: 'Doğal ürünler', alt: 'Katkısız ve taze' },
  { Simge: Coffee, baslik: 'Nitelikli kahve', alt: 'Özel kavrum' },
];

export default function YeniAnaSayfa() {
  const kahveler = products.filter((u) => u.category === 'kahveler').slice(0, 6);
  const suruplar = products.filter((u) => u.category === 'suruplar').slice(0, 4);

  return (
    <div className="yeni-kok min-h-[100dvh]">
      <YeniBaslik />

      <YeniHero />

      {/* Rakamlar. Hero'nun icinde degil, hemen altinda kendi seridinde. */}
      <section
        className="px-6"
        style={{ borderTop: '1px solid var(--y-cizgi)', borderBottom: '1px solid var(--y-cizgi)' }}
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-3">
          {RAKAMLAR.map((r, i) => (
            <div
              key={r.etiket}
              className="py-8 text-center sm:py-10"
              style={i > 0 ? { borderLeft: '1px solid var(--y-cizgi)' } : undefined}
            >
              <p
                className="y-baslik text-2xl sm:text-3xl"
                style={{ color: 'var(--y-murekkep)' }}
              >
                {r.deger}
              </p>
              <p className="mt-1.5 text-[12.5px] sm:text-[13px]" style={{ color: 'var(--y-ikincil)' }}>
                {r.etiket}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Kahve koleksiyonu */}
      <section className="px-6 py-20 lg:py-28">
        <div className="mx-auto max-w-[1120px]">
          <YeniBelir>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2
                className="y-baslik text-[2rem] sm:text-4xl lg:text-[2.75rem]"
                style={{ color: 'var(--y-murekkep)' }}
              >
                Kahve koleksiyonu
              </h2>
              <Link
                href="/kategori/kahveler"
                className="group inline-flex items-center gap-1.5 text-[14px] font-medium transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--y-vurgu)' }}
              >
                Tümünü gör
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </YeniBelir>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {kahveler.map((urun, i) => (
              <YeniBelir key={urun.id} gecikme={Math.min(i, 3) * 0.06}>
                <YeniUrunKarti product={urun} />
              </YeniBelir>
            ))}
          </div>
        </div>
      </section>

      {/* Gurme suruplar. Tek bilincli koyu blok, parilti ve gradyan sus yok. */}
      <section
        className="px-6 py-20 lg:py-28"
        style={{ backgroundColor: 'var(--y-ters-zemin)' }}
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <YeniBelir>
              <h2
                className="y-baslik text-[2rem] sm:text-4xl"
                style={{ color: 'var(--y-ters-murekkep)' }}
              >
                Gurme şuruplar
              </h2>
              <p
                className="mt-5 max-w-[34ch] text-[15px] leading-relaxed"
                style={{ color: 'var(--y-ters-ikincil)' }}
              >
                Katkısız, yoğun aromalı şuruplar. Kahvenizin yanında ya da tek başına.
              </p>
              <Link
                href="/kategori/suruplar"
                className="group mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium transition-opacity duration-200 hover:opacity-70"
                style={{ color: 'var(--y-ters-murekkep)' }}
              >
                Tümünü gör
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </YeniBelir>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {suruplar.map((urun, i) => (
                <YeniBelir key={urun.id} gecikme={Math.min(i, 3) * 0.06}>
                  <YeniUrunKarti product={urun} ters />
                </YeniBelir>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Zanaat ve koken */}
      <section className="px-6 py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <YeniBelir>
              <h2
                className="y-baslik text-[2rem] sm:text-4xl lg:text-[2.6rem]"
                style={{ color: 'var(--y-murekkep)' }}
              >
                Yüksek rakımlardan gelen
                <br />
                kusursuz seçkiler.
              </h2>
            </YeniBelir>

            <YeniBelir gecikme={0.08}>
              <p
                className="mt-6 max-w-[52ch] text-[15.5px] leading-relaxed"
                style={{ color: 'var(--y-ikincil)' }}
              >
                Kahve bir içecekten öte, toprağın, iklimin ve ustalıkla yapılan kavrumun bir
                sanatıdır. Antioquia’nın 1.650 metre dik yamaçlarından Munzur yaylalarının bin
                yıllık tereyağı geleneklerine kadar, her ürünümüz izlenebilir ve saf kökenlidir.
              </p>
            </YeniBelir>

            <YeniBelir gecikme={0.14}>
              <div className="mt-9 grid grid-cols-2 gap-8">
                <div style={{ borderTop: '1px solid var(--y-cizgi-guclu)' }} className="pt-4">
                  <p className="y-baslik text-2xl" style={{ color: 'var(--y-murekkep)' }}>
                    1.650m+
                  </p>
                  <p className="mt-1 text-[12.5px]" style={{ color: 'var(--y-ikincil)' }}>
                    Optimum rakım hasadı
                  </p>
                </div>
                <div style={{ borderTop: '1px solid var(--y-cizgi-guclu)' }} className="pt-4">
                  <p className="y-baslik text-2xl" style={{ color: 'var(--y-murekkep)' }}>
                    %100
                  </p>
                  <p className="mt-1 text-[12.5px]" style={{ color: 'var(--y-ikincil)' }}>
                    İzlenebilir köken
                  </p>
                </div>
              </div>
            </YeniBelir>
          </div>

          <div className="lg:col-span-6">
            <YeniBelir yon="sol" gecikme={0.1}>
              <div
                className="overflow-hidden"
                style={{ borderRadius: 'var(--y-r-buyuk)', boxShadow: 'var(--y-golge)' }}
              >
                <Image
                  src={HIKAYE_GORSELI}
                  alt="Kavrulmuş kahve çekirdekleri"
                  width={1100}
                  height={825}
                  sizes="(max-width: 1024px) 92vw, 520px"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </YeniBelir>
          </div>
        </div>
      </section>

      {/* Guvence seridi */}
      <section
        className="px-6 py-14"
        style={{ borderTop: '1px solid var(--y-cizgi)', backgroundColor: 'var(--y-yuzey-2)' }}
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4">
          {GUVENCELER.map(({ Simge, baslik, alt }, i) => (
            <YeniBelir key={baslik} gecikme={Math.min(i, 3) * 0.05}>
              <div className="flex items-start gap-3">
                <Simge
                  size={19}
                  strokeWidth={1.6}
                  className="mt-0.5 shrink-0"
                  style={{ color: 'var(--y-vurgu)' }}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-[14px] font-medium" style={{ color: 'var(--y-murekkep)' }}>
                    {baslik}
                  </p>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: 'var(--y-ikincil)' }}>
                    {alt}
                  </p>
                </div>
              </div>
            </YeniBelir>
          ))}
        </div>
      </section>

      <YeniAltBilgi />
    </div>
  );
}
