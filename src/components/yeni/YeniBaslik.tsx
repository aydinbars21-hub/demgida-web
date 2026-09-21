'use client';

// Ornek sayfanin ust menusu. Ince, yarı saydam, kucuk punto, buyuk harf yok.
// Eski menudeki 80 piksel yukseklik, kalin buyuk harfli baglantilar ve kutu
// logo yerine sakin bir serit. Menu ogeleri ve adresler aynen korundu.
import React from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const BAGLANTILAR = [
  { ad: 'Kahveler', adres: '/kategori/kahveler' },
  { ad: 'Şuruplar', adres: '/kategori/suruplar' },
  { ad: 'Süt ürünleri', adres: '/kategori/sut-urunleri' },
  { ad: 'Doğal ürünler', adres: '/kategori/dogal-urunler' },
];

export default function YeniBaslik() {
  const { totalItems, setIsCartOpen } = useCart();

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-xl"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--y-zemin) 78%, transparent)',
        borderBottom: '1px solid var(--y-cizgi)',
      }}
    >
      <div className="mx-auto flex h-[52px] max-w-[1120px] items-center justify-between gap-6 px-6">
        <Link
          href="/yeni"
          className="text-[15px] font-semibold"
          style={{ color: 'var(--y-murekkep)', letterSpacing: '-0.02em' }}
        >
          Dem Gıda
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {BAGLANTILAR.map((b) => (
            <Link
              key={b.adres}
              href={b.adres}
              className="text-[13px] transition-opacity duration-200 hover:opacity-60"
              style={{ color: 'var(--y-murekkep)' }}
            >
              {b.ad}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          aria-label={`Sepet, ${totalItems} ürün`}
          className="relative flex h-9 w-9 items-center justify-center transition-opacity duration-200 hover:opacity-60"
          style={{ color: 'var(--y-murekkep)' }}
        >
          <ShoppingBag size={18} strokeWidth={1.75} />
          {totalItems > 0 ? (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[17px] min-w-[17px] items-center justify-center px-1 text-[10px] font-semibold tabular-nums"
              style={{
                borderRadius: '999px',
                backgroundColor: 'var(--y-vurgu)',
                color: '#ffffff',
              }}
            >
              {totalItems}
            </span>
          ) : null}
        </button>
      </div>
    </header>
  );
}
