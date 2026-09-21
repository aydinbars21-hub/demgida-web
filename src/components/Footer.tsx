import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#2B170E] text-[#FAEDCD] pt-12 pb-8 border-t border-[#2B170E]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Şirket Bilgisi */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#D4A373] text-[#2B170E] flex items-center justify-center font-bold text-lg">
                D
              </span>
              <span className="font-extrabold text-xl font-serif text-[#FAEDCD]">DEM GIDA</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              ERZİNCAN DEM GIDA İNŞAAT SANAYİ VE TİCARET LİMİTED ŞİRKETİ
            </p>
            <p className="text-xs text-stone-400">
              <strong>Adres:</strong> Çarşı Mah. Kerkük Cad. No: 19 Merkez/Erzincan
            </p>
            <p className="text-xs text-stone-400">
              <strong>E-posta:</strong> destek@demgida.com
            </p>
          </div>

          {/* Kategoriler */}
          <div>
            <h3 className="font-semibold text-sm text-[#D4A373] mb-3">Kategoriler</h3>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><Link href="/kategori/kahveler" className="hover:text-[#D4A373] transition">Kahveler</Link></li>
              <li><Link href="/kategori/suruplar" className="hover:text-[#D4A373] transition">Şuruplar</Link></li>
              <li><Link href="/kategori/sut-urunleri" className="hover:text-[#D4A373] transition">Süt Ürünleri</Link></li>
              <li><Link href="/kategori/dogal-urunler" className="hover:text-[#D4A373] transition">Doğal Ürünler</Link></li>
            </ul>
          </div>

          {/* Yasal & Kurumsal */}
          <div>
            <h3 className="font-semibold text-sm text-[#D4A373] mb-3">Yasal & Kurumsal</h3>
            <ul className="space-y-2 text-xs text-stone-300">
              <li><Link href="/iletisim" className="hover:text-[#D4A373] transition">İletişim / Şirket Bilgileri</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-[#D4A373] transition">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/iptal-ve-iade-kosullari" className="hover:text-[#D4A373] transition">İptal ve İade Koşulları</Link></li>
              <li><Link href="/gizlilik-ve-guvenlik" className="hover:text-[#D4A373] transition">Gizlilik ve Güvenlik (KVKK)</Link></li>
              <li><Link href="/teslimat-ve-kargo" className="hover:text-[#D4A373] transition">Teslimat ve Kargo Bilgileri</Link></li>
            </ul>
          </div>

          {/* Güvenli Ödeme */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-[#D4A373] mb-3">Güvenli Alışveriş</h3>
            <p className="text-xs text-stone-300">
              Ödemeleriniz 256-bit SSL ve <strong>PayTR</strong> güvencesi altındadır.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-stone-400">
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-white">VISA</span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-white">Mastercard</span>
              <span className="px-2 py-1 bg-white/10 rounded font-semibold text-white">PayTR</span>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">
            © {new Date().getFullYear()} Dem Gıda İnş. San. ve Tic. Ltd. Şti. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-stone-400">
            Vergi Dairesi: Fevzipaşa | Vergi No: 3770988662
          </p>
        </div>

      </div>
    </footer>
  );
}