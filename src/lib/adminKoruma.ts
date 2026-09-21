// src/lib/adminKoruma.ts
// API rotalarinda kullanilan ortak yetki kontrolu.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { OTURUM_CEREZI, oturumOku, type Oturum } from '@/lib/adminDepo';

/** Istek sahibinin IP adresi. Vercel arkasinda x-forwarded-for gelir. */
export function ipAl(istek: Request): string {
  const yonlendirilen = istek.headers.get('x-forwarded-for');
  if (yonlendirilen) return yonlendirilen.split(',')[0].trim();
  return istek.headers.get('x-real-ip') || '0.0.0.0';
}

export async function oturumJetonuAl(): Promise<string | undefined> {
  const cerezler = await cookies();
  return cerezler.get(OTURUM_CEREZI)?.value;
}

/** Uc katmani da gecmis oturumu dondurur, yoksa null. */
export async function tamYetkiliOturum(): Promise<Oturum | null> {
  const jeton = await oturumJetonuAl();
  const oturum = await oturumOku(jeton);
  if (!oturum || oturum.stage < 3) return null;
  return oturum;
}

/** Yetki yoksa hazir 401 cevabi, varsa null dondurur. */
export async function yetkiKapisi(): Promise<NextResponse | null> {
  try {
    const oturum = await tamYetkiliOturum();
    if (!oturum) {
      return NextResponse.json(
        { basarili: false, hata: 'Yetkisiz istek. Lutfen tekrar giris yapin.' },
        { status: 401 }
      );
    }
    return null;
  } catch (hata) {
    return NextResponse.json(
      { basarili: false, hata: (hata as Error).message },
      { status: 500 }
    );
  }
}

/** Cerez ayarlarinin tek yerden yonetimi. */
export function cerezSecenekleri(maxAgeSaniye: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSaniye,
  };
}
