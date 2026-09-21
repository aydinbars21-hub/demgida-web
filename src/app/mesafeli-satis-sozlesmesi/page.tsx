import React from 'react';

export default function DistanceSellingContractPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Mesafeli Satış Sözleşmesi</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">1. TARAFLAR</h2>
          <p><strong>SATICI:</strong> Dem Gıda Sanayi ve Ticaret</p>
          <p><strong>E-posta:</strong> info@demgida.com | <strong>Web:</strong> demgida.com</p>
          <p className="mt-2"><strong>ALICI:</strong> demgida.com üzerinden sipariş oluşturan müşteri.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">2. KONU</h2>
          <p>
            İşbu sözleşmenin konusu, ALICI’nın SATICI’ya ait demgida.com internet sitesinden elektronik ortamda siparişini yaptığı ürünlerin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">3. ÜRÜN VE TESLİMAT</h2>
          <p>
            Satın alınan ürünlerin cinsi, miktarı, satış bedeli ve ödeme şekli sipariş özetinde belirtildiği gibidir. Ürünler ALICI’nın belirttiği adrese anlaşmalı kargo firması aracılığıyla gönderilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">4. CAYMA HAKKI VE İSTİSNALAR</h2>
          <p>
            6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği’nin 15. maddesi uyarınca; çabuk bozulabilen, son kullanma tarihi geçme ihtimali olan veya ambalajı açıldıktan sonra sağlık ve hijyen açısından uygun olmayan gıda ve süt ürünlerinde cayma hakkı kullanılamaz. Ambalajı açılmamış, bozulmamış ve hasarsız ürünler için teslimat tarihinden itibaren 14 gün içinde cayma hakkı mevcuttur.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">5. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
          <p>
            İşbu sözleşmenin uygulanmasında Sanayi ve Ticaret Bakanlığınca ilan edilen değere kadar Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
          </p>
        </section>
      </div>
    </div>
  );
}
