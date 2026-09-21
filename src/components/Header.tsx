'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const { cart, totalItems, totalPrice, isCartOpen, setIsCartOpen, removeFromCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Kahveler', href: '/kategori/kahveler' },
    { name: 'Şuruplar', href: '/kategori/suruplar' },
    { name: 'Süt Ürünleri', href: '/kategori/sut-urunleri' },
    { name: 'Doğal Ürünler', href: '/kategori/dogal-urunler' },
  ];

  // /yeni ornek tasarim sayfasi kendi ust menusunu kullanir, bu yuzden orada
  // bu serit gizlenir. Sepet cekmecesi gizlenmez, calismaya devam eder.
  const yeniTasarimSayfasi = Boolean(pathname?.startsWith('/yeni'));

  return (
    <>
      {/* Ana Header */}
      {!yeniTasarimSayfasi && (
      <header className="sticky top-0 z-40 bg-brand-neutral/80 backdrop-blur-xl border-b border-brand-navy/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Mobil Menü Butonu */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-brand-navy hover:bg-brand-navy/5 transition"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-11 h-11 rounded-2xl bg-brand-navy text-brand-accent flex items-center justify-center font-bold text-xl shadow-lg group-hover:scale-105 transition-transform duration-300">
                  D
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-2xl tracking-tighter text-brand-navy leading-none">DEM</span>
                  <span className="text-[10px] tracking-[0.2em] text-brand-muted font-bold uppercase mt-1">Gıda & Kahve</span>
                </div>
              </Link>
            </div>

            {/* Masaüstü Menü */}
            <nav className="hidden lg:flex items-center gap-10 font-bold text-brand-navy/70 text-[11px] uppercase tracking-premium-widest">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-all duration-300 relative group ${
                      isActive ? 'text-brand-navy' : 'hover:text-brand-navy'
                    }`}
                  >
                    {link.name}
                    <span className={`absolute -bottom-1.5 left-0 w-full h-0.5 bg-brand-accent transition-transform duration-500 origin-left ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Sağ Taraf: Sepet Butonu */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 rounded-2xl bg-brand-navy text-brand-neutral hover:bg-brand-dark transition-all shadow-lg hover:shadow-brand-navy/20 active:scale-95"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-accent text-brand-navy font-black text-[10px] w-6 h-6 rounded-full flex items-center justify-center shadow-md ring-4 ring-brand-neutral/80">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobil Menü Listesi */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-brand-neutral border-b border-brand-navy/5 px-4 pt-2 pb-8 space-y-1 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-colors ${
                  pathname === link.href
                    ? 'bg-brand-navy text-brand-neutral'
                    : 'text-brand-navy hover:bg-brand-navy/5'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </header>
      )}

      {/* Sepet Çekmecesi (Drawer) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Arka Plan Karartması */}
          <div
            className="absolute inset-0 bg-brand-navy/40 backdrop-blur-md transition-opacity duration-500"
            onClick={() => setIsCartOpen(false)}
          />
          
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-brand-neutral shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
              
              {/* Üst Başlık */}
              <div className="px-6 py-8">
                <div className="flex items-center justify-between border-b border-brand-navy/5 pb-6">
                  <h2 className="text-xl font-black text-brand-navy flex items-center gap-3">
                    <ShoppingBag size={24} className="text-brand-accent" /> Sepetiniz
                    <span className="text-sm font-bold text-brand-muted ml-2">({totalItems} Ürün)</span>
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-2 rounded-xl text-brand-muted hover:text-brand-navy hover:bg-brand-navy/5 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="mt-8 space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-brand-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag size={32} className="text-brand-muted" />
                      </div>
                      <p className="text-brand-muted font-medium">Sepetiniz henüz boş.</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-4 text-brand-accent font-bold text-sm hover:underline"
                      >
                        Alışverişe Başla
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="group flex items-center gap-4 bg-white p-4 rounded-2xl border border-brand-navy/5 shadow-sm hover:shadow-md transition-all">
                        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-brand-neutral border border-brand-navy/5">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-brand-navy truncate uppercase tracking-tight">{item.name}</h4>
                          <p className="text-[11px] font-semibold text-brand-muted mt-1 uppercase tracking-wider">{item.variant || item.category}</p>
                          <div className="flex justify-between items-end mt-3">
                            <div className="flex items-center gap-3 bg-brand-neutral rounded-lg px-2 py-1">
                              <span className="text-[10px] font-bold text-brand-navy/60">ADET:</span>
                              <span className="text-xs font-black text-brand-navy">{item.quantity}</span>
                            </div>
                            <span className="font-black text-brand-navy tracking-tighter">{(item.price * item.quantity).toFixed(2)} TL</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 transition-all rounded-lg"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Alt Toplam & Ödeme Butonu */}
              {cart.length > 0 && (
                <div className="mt-auto p-6 bg-white border-t border-brand-navy/5 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-brand-muted uppercase tracking-wider">
                      <span>Ara Toplam</span>
                      <span>{totalPrice.toFixed(2)} TL</span>
                    </div>
                    <div className="flex justify-between text-xl font-black text-brand-navy">
                      <span>Toplam</span>
                      <span className="tracking-tighter">{totalPrice.toFixed(2)} TL</span>
                    </div>
                  </div>
                  <Link
                    href="/odeme"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full bg-brand-navy hover:bg-brand-dark text-brand-neutral font-black py-4 px-6 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-navy/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    ÖDEME ADIMINA GEÇ
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}
