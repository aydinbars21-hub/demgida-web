import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-bold mb-6 text-slate-900">Gizlilik ve Güvenlik Politikası</h1>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Kişisel Verilerin Korunması</h2>
          <p>
            Dem Gıda olarak müşterilerimizin kişisel bilgilerinin gizliliğine ve güvenliğine büyük önem veriyoruz. 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında sipariş ve teslimat süreçlerinin yürütülmesi amacıyla ad, soyad, adres, e-posta ve telefon bilgileri işlenmektedir.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ödeme Güvenliği ve SSL</h2>
          <p>
            Sitemiz 256-bit SSL güvenlik sertifikası ile korunmaktadır. Kredi kartı ve banka kartı ödemeleri BDDK lisanslı <strong>PayTR</strong> ödeme altyapısı üzerinden 3D Secure güvencesiyle gerçekleştirilir. Kredi kartı bilgileriniz sunucularımızda asla saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Çerez (Cookie) Kullanımı</h2>
          <p>
            Alışveriş deneyiminizi iyileştirmek ve sepet işlemlerinizi hatırlamak için sitemizde zorunlu çerezler kullanılmaktadır.
          </p>
        </section>
      </div>
    </div>
  );
}