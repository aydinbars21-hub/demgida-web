'use client';

// Kaydirinca beliren icerik. Mevcut AnimatedReveal'dan farki:
// kullanicinin "hareketi azalt" tercihini gercekten dinler ve o durumda
// hicbir animasyon kurmadan icerigi dogrudan gosterir.
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface Ozellikler {
  children: React.ReactNode;
  gecikme?: number;
  className?: string;
  /** Yukaridan asagi degil, yatay kayma istenirse */
  yon?: 'yukari' | 'sol' | 'sag';
}

export default function YeniBelir({
  children,
  gecikme = 0,
  className = '',
  yon = 'yukari',
}: Ozellikler) {
  const azalt = useReducedMotion();

  if (azalt) {
    return <div className={className}>{children}</div>;
  }

  const baslangic =
    yon === 'sol'
      ? { opacity: 0, x: 28 }
      : yon === 'sag'
      ? { opacity: 0, x: -28 }
      : { opacity: 0, y: 28 };

  return (
    <motion.div
      className={className}
      initial={baslangic}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay: gecikme, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
