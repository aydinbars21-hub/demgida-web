import React from 'react';

export default function ShippingInfoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Teslimat ve Kargo Bilgileri</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Sipariş Hazırlık ve Teslim Süresi</h2>
          <p>
            Hafta içi saat 15:00’e kadar verilen siparişler aynı gün veya en geç 1-2 iş günü içerisinde özenle paketlenerek anlaşmalı kargo firmasına teslim edilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Özel Ambalaj ve Soğuk Muhafaza</h2>
          <p>
            Süt ve şarküteri ürünlerimiz tazeliklerini ve soğuk zincirlerini korumak amacıyla özel yalıtımlı ambalaj ve buz aküleri ile sevk edilmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Kargo Takibi</h2>
          <p>
            Siparişiniz kargoya verildiğinde tarafınıza e-posta/SMS yoluyla kargo takip numarası iletilir.
          </p>
        </section>
      </div>
    </div>
  );
}