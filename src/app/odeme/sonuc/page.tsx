// src/app/odeme/sonuc/page.tsx
'use client';

import React, { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function SonucContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  // PayTR 'durum' ve 'oid' ile doner, eski akis 'status' ve 'orderId' kullaniyordu.
  const status = searchParams.get('durum') || searchParams.get('status');
  const orderId = searchParams.get('oid') || searchParams.get('orderId');
  const message = searchParams.get('message');

  const isSuccess = status === 'success' || status === 'basarili';

  // Odeme tamamlandiysa sepet burada temizlenir, odeme oncesinde degil.
  useEffect(() => {
    if (isSuccess && clearCart) clearCart();
  }, [isSuccess, clearCart]);

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900 mb-2">Siparişiniz Alındı!</h2>
            <p className="text-neutral-600 text-sm mb-6">
              Ödemeniz alındı. Sipariş detayları e-posta adresinize gönderilecek.
            </p>
            {orderId && (
              <div className="bg-neutral-50 p-4 rounded-xl mb-6">
                <span className="text-xs text-neutral-500 block mb-1 uppercase tracking-wider">Sipariş Numarası</span>
                <span className="text-lg font-mono font-bold text-neutral-900">#{orderId}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900 mb-2">İşlem Başarısız</h2>
            <p className="text-neutral-600 text-sm mb-6">
              {message || 'Ödeme veya sipariş işlemi sırasında bir hata oluştu.'}
            </p>
          </>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-[#C49A6C] hover:bg-[#B3895B] text-white py-3 rounded-xl font-medium transition duration-200"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OdemeSonucPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>}>
      <SonucContent />
    </Suspense>
  );
}