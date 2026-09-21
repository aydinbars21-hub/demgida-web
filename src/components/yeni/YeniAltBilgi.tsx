// Ornek sayfanin alt bilgisi.
// Not: canli sitede alt bilgi hic gorunmuyor (Footer.tsx yazilmis ama hicbir
// sayfa onu cagirmiyor), bu yuzden mesafeli satis sozlesmesi ve iade kosullari
// sayfalarina hicbir yerden baglanti verilmiyor. Burada o eksik kapatildi.
// Sirket bilgileri iletisim sayfasindaki resmi kayitlardan alindi.
import React from 'react';
import Link from 'next/link';

const KATEGORILER = [
  { ad: 'Kahveler', adres: '/kategori/kahveler' },
  { ad: 'Şuruplar', adres: '/kategori/suruplar' },
  { ad: 'Süt ürünleri', adres: '/kategori/sut-urunleri' },
  { ad: 'Doğal ürünler', adres: '/kategori/dogal-urunler' },
];

const YASAL = [
  { ad: 'Mesafeli satış sözleşmesi', adres: '/mesafeli-satis-sozlesmesi' },
  { ad: 'İptal ve iade koşulları', adres: '/iptal-ve-iade-kosullari' },
  { ad: 'Gizlilik ve güvenlik', adres: '/gizlilik-ve-guvenlik' },
  { ad: 'Teslimat ve kargo', adres: '/teslimat-ve-kargo' },
  { ad: 'İletişim', adres: '/iletisim' },
];

export default function YeniAltBilgi() {
  return (
    <footer style={{ borderTop: '1px solid var(--y-cizgi)' }}>
      <div className="mx-auto max-w-[1120px] px-6 py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p
              className="text-[15px] font-semibold"
              style={{ color: 'var(--y-murekkep)', letterSpacing: '-0.02em' }}
            >
              Dem Gıda
            </p>
            <p className="mt-3 max-w-[38ch] text-[13px] leading-relaxed" style={{ color: 'var(--y-ikincil)' }}>
              Erzincan Dem Gıda İnşaat Sanayi ve Ticaret Limited Şirketi
              <br />
              Çarşı Mah. Kerkük Cad. No: 19 Merkez / Erzincan
            </p>
            <p className="mt-3 text-[13px]" style={{ color: 'var(--y-ikincil)' }}>
              <a href="mailto:destek@demgida.com" className="transition-opacity hover:opacity-60">
                destek@demgida.com
              </a>
              <span aria-hidden="true" className="px-2 opacity-40">
                |
              </span>
              <a href="tel:+905330305324" className="transition-opacity hover:opacity-60">
                +90 533 030 53 24
              </a>
            </p>
          </div>

          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--y-murekkep)' }}>
              Ürünler
            </p>
            <ul className="mt-4 space-y-2.5">
              {KATEGORILER.map((k) => (
                <li key={k.adres}>
                  <Link
                    href={k.adres}
                    className="text-[13px] transition-opacity duration-200 hover:opacity-60"
                    style={{ color: 'var(--y-ikincil)' }}
                  >
                    {k.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[13px] font-medium" style={{ color: 'var(--y-murekkep)' }}>
              Kurumsal
            </p>
            <ul className="mt-4 space-y-2.5">
              {YASAL.map((y) => (
                <li key={y.adres}>
                  <Link
                    href={y.adres}
                    className="text-[13px] transition-opacity duration-200 hover:opacity-60"
                    style={{ color: 'var(--y-ikincil)' }}
                  >
                    {y.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-14 flex flex-col gap-3 pt-8 text-[12.5px] sm:flex-row sm:items-center sm:justify-between"
          style={{ borderTop: '1px solid var(--y-cizgi)', color: 'var(--y-ikincil)' }}
        >
          <p>© {new Date().getFullYear()} Dem Gıda. Tüm hakları saklıdır.</p>
          <p>Ödemeler 256-bit SSL ve PayTR güvencesiyle alınır.</p>
        </div>
      </div>
    </footer>
  );
}
