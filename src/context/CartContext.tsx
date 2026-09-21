"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // İlk kaydetmeyi atlamak için. Aksi halde sayfa ilk açıldığında, kayıtlı
  // sepet daha okunmadan boş dizi localStorage'a yazılıyor ve o anda sekme
  // kapatılırsa müşterinin sepeti siliniyordu.
  const ilkCalisma = useRef(true);

  // localStorage'dan sepeti yükleme.
  // Not: localStorage sunucuda yok, bu yüzden okuma ancak tarayıcıda, yani
  // effect içinde yapılabilir. Lint kuralı burada kaçınılmaz olarak ihlal olur.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dem_cart");
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Sepet okunamadı:", e);
    }
  }, []);

  // Sepet değiştikçe kaydetme. İlk çalışma atlanır (yukarıdaki açıklama).
  useEffect(() => {
    if (ilkCalisma.current) {
      ilkCalisma.current = false;
      return;
    }
    try {
      localStorage.setItem("dem_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Sepet kaydedilemedi:", e);
    }
  }, [cart]);

  const addToCart = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("dem_cart");
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart, CartProvider içinde kullanılmalıdır.");
  return ctx;
}