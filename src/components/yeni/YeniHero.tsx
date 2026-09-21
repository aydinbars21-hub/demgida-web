'use client';

// Apple cizgisinde hero: iri ve siki harf aralikli baslik, tek vurgu rengi,
// bol hava. Eski surumdeki italik yazi, parilti lekesi, el cizimi kivrim ve
// rozet kaldirildi. Rakamlar hero'nun icinde degil, hemen altindaki seritte.
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

const HERO_GORSELI =
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop';

// Yumusatma egrisi dortlu demet olarak yazilir; dizi olarak birakilirsa
// framer-motion'un tip tanimi kabul etmiyor.
const EGRI: [number, number, number, number] = [0.16, 1, 0.3, 1];

const KAP_VARYANTLARI: Variants = {
  gizli: { opacity: 0 },
  gorunur: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const OGE_VARYANTLARI: Variants = {
  gizli: { opacity: 0, y: 20 },
  gorunur: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EGRI } },
};

export default function YeniHero() {
  const azalt = useReducedMotion();

  const kap = azalt
    ? {}
    : { initial: 'gizli', animate: 'gorunur', variants: KAP_VARYANTLARI };

  const oge = azalt ? {} : { variants: OGE_VARYANTLARI };

  return (
    <section className="px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
      <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <motion.div className="lg:col-span-7" {...kap}>
          <motion.h1
            {...oge}
            className="y-baslik-buyuk text-[2.6rem] sm:text-5xl lg:text-[4.1rem]"
            style={{ color: 'var(--y-murekkep)' }}
          >
            Doğadan Sofranıza
            <br />
            En Saf Deminde Lezzet.
          </motion.h1>

          <motion.p
            {...oge}
            className="mt-7 max-w-[46ch] text-[17px] leading-relaxed lg:text-lg"
            style={{ color: 'var(--y-ikincil)' }}
          >
            Özenle seçilmiş yöresel kahveler, katkısız gurme şuruplar ve Anadolu’nun bereketli
            topraklarından geleneksel lezzetler Dem Gıda kalitesiyle kapınızda.
          </motion.p>

          <motion.div {...oge} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/kategori/kahveler"
              className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[15px] font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                borderRadius: 'var(--y-r-kucuk)',
                backgroundColor: 'var(--y-murekkep)',
                color: 'var(--y-zemin)',
              }}
            >
              Kahveleri keşfet
              <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/kategori/dogal-urunler"
              className="inline-flex items-center justify-center px-7 py-3.5 text-[15px] font-medium transition-all duration-200 active:scale-[0.98]"
              style={{
                borderRadius: 'var(--y-r-kucuk)',
                border: '1px solid var(--y-cizgi-guclu)',
                color: 'var(--y-murekkep)',
              }}
            >
              Doğal ürünler
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={azalt ? undefined : { opacity: 0, scale: 0.985 }}
          animate={azalt ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative overflow-hidden"
            style={{ borderRadius: 'var(--y-r-buyuk)', boxShadow: 'var(--y-golge)' }}
          >
            {/* Stok gorsel, musterinin talebiyle korundu.
                priority: bu gorsel sayfanin en buyuk ogesi, LCP'yi o belirliyor. */}
            <Image
              src={HERO_GORSELI}
              alt="Fincanda taze demlenmiş kahve"
              width={1200}
              height={1500}
              priority
              sizes="(max-width: 1024px) 92vw, 440px"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
