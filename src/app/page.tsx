// src/app/page.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import AnimatedReveal from '@/components/AnimatedReveal';
import { products } from '@/data/products';
import { ArrowRight, Truck, ShieldCheck, Sparkles, Coffee } from 'lucide-react';

export default function HomePage() {
  const featuredCoffees = products.filter((p) => p.category === 'kahveler');
  const featuredSyrups = products.filter((p) => p.category === 'suruplar').slice(0, 4);

  return (
    <div className="min-h-screen bg-brand-neutral">
      {/* Hero Banner */}
      <Hero />

      {/* Öne Çıkan Kahveler Bölümü */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40">
        <AnimatedReveal width="100%">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-premium-widest text-brand-accent">
                Premium Seçki
              </span>
              <h2 className="text-4xl lg:text-6xl font-serif font-medium text-brand-navy tracking-premium-tight">
                Kahve Koleksiyonu
              </h2>
            </div>
            <Link
              href="/kategori/kahveler"
              className="group mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-premium-widest text-brand-navy hover:text-brand-accent transition-colors flex items-center gap-3 bg-white px-8 py-4 rounded-full border border-brand-navy/10 shadow-sm hover:shadow-xl hover:-translate-y-1"
            >
              TÜMÜNÜ KEŞFET <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </AnimatedReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredCoffees.map((product, index) => (
            <AnimatedReveal key={product.id} delay={0.1 * index} width="100%">
              <ProductCard product={product} />
            </AnimatedReveal>
          ))}
        </div>
      </section>

      {/* Gurme Şuruplar Bölümü */}
      <section className="bg-brand-navy py-24 lg:py-40 relative overflow-hidden">
        {/* Dekoratif Arka Plan */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-brand-accent rounded-full blur-[120px]" />
          <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-brand-accent rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <AnimatedReveal width="100%">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-premium-widest text-brand-accent">
                  Aroma & Lezzet
                </span>
                <h2 className="text-4xl lg:text-6xl font-serif font-medium text-brand-neutral tracking-premium-tight">
                  Gurme Şuruplar
                </h2>
              </div>
              <Link
                href="/kategori/suruplar"
                className="group mt-4 md:mt-0 text-[10px] font-bold uppercase tracking-premium-widest text-brand-neutral hover:text-brand-accent transition-colors flex items-center gap-3 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl hover:bg-white/10"
              >
                TÜMÜNÜ GÖR <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </AnimatedReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredSyrups.map((product, index) => (
              <AnimatedReveal key={product.id} delay={0.1 * index} width="100%">
                <ProductCard product={product} />
              </AnimatedReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Storytelling & Craftsmanship (Çiftlikten Fincana) */}
      <section className="bg-brand-neutral py-24 lg:py-36 border-b border-brand-navy/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            <div className="lg:col-span-6 space-y-8">
              <AnimatedReveal width="100%">
                <span className="text-[11px] font-bold uppercase tracking-premium-widest text-brand-accent">
                  Zanaat & Köken
                </span>
                <h2 className="text-4xl lg:text-5xl font-serif font-medium text-brand-navy tracking-premium-tight mt-3 leading-tight">
                  Yüksek Rakımlardan Gelen <br />
                  <span className="italic">Kusursuz Seçkiler.</span>
                </h2>
              </AnimatedReveal>

              <AnimatedReveal width="100%" delay={0.2}>
                <p className="text-base text-brand-muted font-normal leading-relaxed">
                  Kahve bir içecekten öte, toprağın, iklimin ve ustalıkla yapılan kavrumun bir sanatıdır. Antioquia’nın 1.650 metre dik yamaçlarından Munzur yaylalarının bin yıllık tereyağı geleneklerine kadar, her ürünümüz izlenebilir ve saf kökenlidir.
                </p>
              </AnimatedReveal>

              <AnimatedReveal width="100%" delay={0.3}>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-6 rounded-2xl bg-white border border-brand-navy/5 shadow-sm">
                    <span className="text-3xl font-serif font-medium text-brand-navy block mb-1">1.650m+</span>
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">Optimum Rakım Hasadı</span>
                  </div>
                  <div className="p-6 rounded-2xl bg-white border border-brand-navy/5 shadow-sm">
                    <span className="text-3xl font-serif font-medium text-brand-navy block mb-1">%100</span>
                    <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">İzlenebilir Köken</span>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

            <div className="lg:col-span-6 relative">
              <AnimatedReveal width="100%" delay={0.3}>
                <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
                  <Image
                    src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=900&auto=format&fit=crop"
                    alt="Kahve Çekirdeği Hasadı ve Zanaat"
                    width={900}
                    height={675}
                    sizes="(max-width: 1024px) 92vw, 540px"
                    className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/80 via-transparent to-transparent flex items-end p-8">
                    <div>
                      <p className="text-brand-accent text-xs font-bold uppercase tracking-premium-widest">Sürdürülebilir Tarım</p>
                      <h4 className="text-white text-xl font-serif font-medium mt-1">Doğaya Saygılı, Butik Üretim</h4>
                    </div>
                  </div>
                </div>
              </AnimatedReveal>
            </div>

          </div>
        </div>
      </section>

      {/* Güven Bandı */}
      <section className="bg-white border-y border-brand-navy/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedReveal delay={0.1}>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy mb-2">
                  <Truck size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-tight">Hızlı Teslimat</h4>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">24 Saatte Kargoda</p>
              </div>
            </AnimatedReveal>
            <AnimatedReveal delay={0.2}>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy mb-2">
                  <ShieldCheck size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-tight">Güvenli Ödeme</h4>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">%100 PayTR Güvencesi</p>
              </div>
            </AnimatedReveal>
            <AnimatedReveal delay={0.3}>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy mb-2">
                  <Sparkles size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-tight">Doğal Ürünler</h4>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Katkısız ve Taze</p>
              </div>
            </AnimatedReveal>
            <AnimatedReveal delay={0.4}>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-navy/5 flex items-center justify-center text-brand-navy mb-2">
                  <Coffee size={24} />
                </div>
                <h4 className="text-sm font-black text-brand-navy uppercase tracking-tight">Nitelikli Kahve</h4>
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Özel Kavrum</p>
              </div>
            </AnimatedReveal>
          </div>
        </div>
      </section>
    </div>
  );
}
