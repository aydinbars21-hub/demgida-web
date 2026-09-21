import React from 'react';

export default function IletisimPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-neutral-700">
      <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-6">İletişim ve Şirket Bilgileri</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm leading-relaxed">
        <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 border-b pb-2">Resmi Şirket Bilgileri</h2>
          <p><strong>Şirket Unvanı:</strong> ERZİNCAN DEM GIDA İNŞAAT SANAYİ VE TİCARET LİMİTED ŞİRKETİ</p>
          <p><strong>Vergi Dairesi:</strong> Fevzipaşa Vergi Dairesi</p>
          <p><strong>Vergi Kimlik No:</strong> 3770988662</p>
          <p><strong>Destek E-posta:</strong> destek@demgida.com</p>
        </div>

        <div className="space-y-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-900 border-b pb-2">Merkez Adres & İletişim</h2>
          <p><strong>Açık Adres:</strong> Çarşı Mah. Kerkük Cad. No: 19 Merkez / Erzincan</p>
          <p><strong>Müşteri Destek Hattı:</strong> +90 533 030 53 24</p>
          <p><strong>Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00</p>
        </div>
      </div>
    </div>
  );
}