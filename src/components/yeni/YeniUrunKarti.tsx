'use client';

// Sade urun karti. Eski surumdeki parilti rozeti, uzerine gelince cikan
// "Incele" katmani, tadim notu etiketleri ve "FIYAT" mikro etiketi kaldirildi.
// Urun fotografi kirpilmiyor: paket gorselleri object-contain ile tam gorunuyor.
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/data/products';

export default function YeniUrunKarti({
  product,
  ters = false,
}: {
  product: Product;
  ters?: boolean;
}) {
  const { addToCart } = useCart();

  const sepeteEkle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });
  };

  const murekkep = ters ? 'var(--y-ters-murekkep)' : 'var(--y-murekkep)';
  const ikincil = ters ? 'var(--y-ters-ikincil)' : 'var(--y-ikincil)';
  const cizgi = ters ? 'var(--y-ters-cizgi)' : 'var(--y-cizgi)';
  const yuzey = ters ? 'rgba(248,250,252,0.05)' : 'var(--y-yuzey)';
  // Urun paket fotograflarinin kendi zemini beyaz. Karta gri bir zemin verince
  // fotografin beyaz dikdortgeni disari tasip dikis yapiyor. Fotograf alanini
  // beyaz birakinca urun tek parca bir beyaz karo icinde duruyor.
  const gorselZemin = '#ffffff';

  return (
    <div
      className="group flex h-full flex-col transition-all duration-300 hover:-translate-y-1"
      style={{
        borderRadius: 'var(--y-r-orta)',
        backgroundColor: yuzey,
        border: `1px solid ${cizgi}`,
      }}
    >
      <Link
        href={`/urun/${product.slug || product.id}`}
        className="block overflow-hidden"
        style={{
          borderTopLeftRadius: 'var(--y-r-orta)',
          borderTopRightRadius: 'var(--y-r-orta)',
          backgroundColor: gorselZemin,
        }}
      >
        <div className="relative aspect-square w-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
            className="object-contain p-7 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 pt-4">
        {product.origin ? (
          <p className="mb-1.5 text-[12px] leading-tight" style={{ color: ikincil }}>
            {product.origin}
          </p>
        ) : null}

        <Link href={`/urun/${product.slug || product.id}`} className="block">
          <h3
            className="text-[15px] font-medium leading-snug"
            style={{ color: murekkep, letterSpacing: '-0.012em' }}
          >
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-[12.5px]" style={{ color: ikincil }}>
          {product.weight}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3 pt-4" style={{ borderTop: `1px solid ${cizgi}` }}>
          <span
            className="text-[16px] font-medium tabular-nums"
            style={{ color: murekkep, letterSpacing: '-0.02em' }}
          >
            ₺{product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </span>

          <button
            type="button"
            onClick={sepeteEkle}
            className="px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.97]"
            style={{
              borderRadius: 'var(--y-r-kucuk)',
              backgroundColor: ters ? 'var(--y-ters-murekkep)' : 'var(--y-murekkep)',
              color: ters ? 'var(--y-ters-zemin)' : 'var(--y-zemin)',
            }}
          >
            Sepete ekle
          </button>
        </div>
      </div>
    </div>
  );
}
