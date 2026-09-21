import React from 'react';

export default function CancellationReturnPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">İptal ve İade Koşulları</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Sipariş İptali</h2>
          <p>
            Siparişiniz kargoya verilmeden önce bizimle iletişime geçerek iptal talebinde bulunabilirsiniz. Kargoya teslim edilmiş siparişlerde iptal işlemi gerçekleştirilememekte olup ürün teslim alındıktan sonra iade süreci işletilir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Gıda Ürünlerinde İade Şartları</h2>
          <p>
            Satışa sunulan kahve, şurup, peynir ve tereyağı gibi gıda ürünlerinde hijyen ve soğuk zincir/saklama koşulları gereği, ambalajı açılmış veya koruyucu güvenlik bandı yırtılmış ürünlerin iadesi kabul edilmemektedir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Hasarlı ve Kusurlu Ürünler</h2>
          <p>
            Kargo teslimatı sırasında pakette ezilme, kırılma veya sızıntı tespit ederseniz kargo görevlisine <strong>Hasar Tespit Tutanağı</strong> tutturarak ürünü teslim almayınız. Kusurlu veya kargoda hasar gören ürünler koşulsuz olarak yenisiyle değiştirilir veya ücret iadesi yapılır.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Geri Ödeme Süreci</h2>
          <p>
            İadesi onaylanan siparişlerin ücreti, ödeme yönteminize bağlı olarak 3-7 iş günü içerisinde PayTR altyapısı üzerinden kartınıza yansıtılır.
          </p>
        </section>
      </div>
    </div>
  );
}