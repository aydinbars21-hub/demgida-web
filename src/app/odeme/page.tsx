// src/app/odeme/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart, type CartItem } from '@/context/CartContext';

export default function OdemePage() {
  const { cart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    tcNo: '', // istege bagli, PayTR zorunlu tutmuyor
    city: '',
    district: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const iframeAlani = useRef<HTMLDivElement | null>(null);

  // Sepet bosken eskiden uydurma bir urun (864 TL) gosteriliyor ve o tutar
  // uzerinden odeme yapilabiliyordu. Artik bos sepet bos kabul edilir.
  const sepetBos = !cart || cart.length === 0;

  const subtotal = sepetBos
    ? 0
    : cart.reduce((acc: number, item: CartItem) => acc + Number(item.price || 0) * (item.quantity || 1), 0);

  // Kargo Ücreti Kuralı: 1000 TL ve üzeri ücretsiz, altı 150 TL
  const SHIPPING_FEE = 150;
  const FREE_SHIPPING_THRESHOLD = 1000;
  const shippingCost = sepetBos || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  // Toplam Tutar (Ara Toplam + Kargo)
  const grandTotal = subtotal + shippingCost;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (sepetBos) {
        throw new Error('Sepetiniz bos. Once urun ekleyin.');
      }
      const orderItems = cart;

      // PayTR iFrame API. Tutar sunucuda yeniden hesaplanir, buradan gonderilen
      // toplam guvenilmez kabul edilir.
      const response = await fetch('/api/odeme/paytr/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          ad: formData.fullName,
          telefon: formData.phone,
          adres: `${formData.address}, ${formData.district} / ${formData.city}`,
          kargo: shippingCost,
          sepet: orderItems.map((u: { name?: string; price?: number; quantity?: number }) => ({
            ad: u.name,
            fiyat: Number(u.price || 0),
            adet: Number(u.quantity || 1),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.basarili || !data.iframeUrl) {
        throw new Error(data.hata || 'Odeme baslatilamadi.');
      }

      // Sepet burada temizlenmez. Odeme gercekten tamamlandiginda
      // sonuc sayfasinda temizlenir.
      setIframeUrl(data.iframeUrl);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Odeme islenirken bir hata olustu.');
    } finally {
      setLoading(false);
    }
  };

  // PayTR cercevesini sayfa yuksekligine uyarlayan resmi betik.
  useEffect(() => {
    if (!iframeUrl) return;
    const betik = document.createElement('script');
    betik.src = 'https://www.paytr.com/js/iframeResizer.min.js';
    betik.async = true;
    betik.onload = () => {
      const g = window as unknown as { iFrameResize?: (a: unknown, b: string) => void };
      if (typeof g.iFrameResize === 'function') {
        g.iFrameResize({}, '#paytriframe');
      }
    };
    document.body.appendChild(betik);
    iframeAlani.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return () => {
      betik.remove();
    };
  }, [iframeUrl]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sol Kolon: Teslimat ve odeme bilgileri formu */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Teslimat & Ödeme Bilgileri</h2>
            <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200">
              PayTR guvenli odeme
            </span>
          </div>
          <p className="text-neutral-500 text-sm mb-6">
            Güvenli ödeme için lütfen bilgilerinizi eksiksiz doldurun.
          </p>

          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                <path strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {iframeUrl ? (
            <div ref={iframeAlani}>
              <p className="text-neutral-500 text-sm mb-4">
                Kart bilgilerinizi asagidaki guvenli PayTR ekranina girin. Bu bilgiler bizim
                sunucumuza hic ugramaz.
              </p>
              <iframe
                src={iframeUrl}
                id="paytriframe"
                title="PayTR guvenli odeme"
                frameBorder="0"
                scrolling="no"
                style={{ width: '100%', minHeight: '620px' }}
              />
              <button
                type="button"
                onClick={() => setIframeUrl(null)}
                className="mt-4 text-xs text-neutral-500 underline"
              >
                Bilgileri duzenlemek icin geri don
              </button>
            </div>
          ) : (
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Ad Soyad *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Ad Soyad"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  E-Posta Adresi *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ornek@domain.com"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  Telefon Numarası *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05xxxxxxxxx"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                TC Kimlik Numarası <span className="text-[10px] text-neutral-400 lowercase">(istege bagli)</span>
              </label>
              <input
                type="text"
                name="tcNo"
                maxLength={11}
                value={formData.tcNo}
                onChange={handleChange}
                placeholder="11 haneli TC Kimlik No"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  İl / Şehir *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="İl"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                  İlçe *
                </label>
                <input
                  type="text"
                  name="district"
                  required
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="İlçe"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Açık Adres *
              </label>
              <textarea
                name="address"
                required
                rows={3}
                value={formData.address}
                onChange={handleChange}
                placeholder="Mahalle, Cadde, Sokak, Daire No..."
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#8C6D53]"
              />
            </div>

            <button
              type="submit"
              disabled={loading || sepetBos}
              className="w-full mt-6 bg-[#C49A6C] hover:bg-[#B3895B] text-white py-4 rounded-xl font-medium transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sepetBos
                ? 'Sepetiniz boş'
                : loading
                ? 'Güvenli ödeme ekranı hazırlanıyor...'
                : 'Güvenli ödemeye geç'}
            </button>
          </form>
          )}
        </div>

        {/* Sağ Kolon: Sipariş Özeti */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 sticky top-6">
            <h3 className="text-xl font-serif font-bold text-neutral-900 mb-6">
              Sipariş Özeti ({cart?.length || 0})
            </h3>

            {!sepetBos ? (
              cart.map((item: CartItem, idx: number) => (
                <div key={idx} className="flex items-center gap-4 py-4 border-b border-neutral-100">
                  <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-neutral-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-neutral-500">Adet: {item.quantity || 1}</p>
                  </div>
                  <span className="font-semibold text-sm text-neutral-900">
                    {(Number(item.price) * (item.quantity || 1)).toFixed(2)} TL
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center border-b border-neutral-100">
                <p className="text-sm text-neutral-600 mb-4">Sepetiniz boş.</p>
                <Link
                  href="/"
                  className="inline-block text-sm font-medium text-neutral-900 underline underline-offset-4"
                >
                  Ürünlere göz atın
                </Link>
              </div>
            )}

            <div className="space-y-3 py-4 border-b border-neutral-100 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Ara Toplam:</span>
                <span className="font-medium text-neutral-900">{subtotal.toFixed(2)} TL</span>
              </div>
              <div className="flex justify-between text-neutral-600 items-center">
                <span>Kargo Ücreti:</span>
                {shippingCost === 0 ? (
                  <span className="font-medium text-emerald-600">Ücretsiz (1000 TL ve Üzeri)</span>
                ) : (
                  <span className="font-medium text-neutral-900">{shippingCost.toFixed(2)} TL</span>
                )}
              </div>
              {subtotal < FREE_SHIPPING_THRESHOLD && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  {(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} TL daha ürün ekleyin, kargo bedava olsun!
                </p>
              )}
            </div>

            <div className="flex justify-between items-center py-4">
              <span className="text-base font-semibold text-neutral-900">Toplam Ödenecek:</span>
              <span className="text-xl font-bold text-neutral-900">{grandTotal.toFixed(2)} TL</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-4">
              <span>256-bit SSL Koruma</span>
              <span>PayTR güvencesi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}