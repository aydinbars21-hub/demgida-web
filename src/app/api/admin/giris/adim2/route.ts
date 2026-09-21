// src/app/api/admin/giris/adim2/route.ts
// Ikinci katman: dokuz secenek arasindan dogru emoji.
import { NextResponse } from 'next/server';
import {
  adminYapilandirmaOku,
  denemeKaydet,
  kilitliMi,
  oturumAsamaYukselt,
  oturumOku,
  oturumSil,
} from '@/lib/adminDepo';
import { zamanGuvenliKarsilastir } from '@/lib/guvenlik';
import { ipAl, oturumJetonuAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function POST(istek: Request) {
  const ip = ipAl(istek);
  try {
    if (await kilitliMi(ip)) {
      return NextResponse.json(
        { basarili: false, hata: 'Cok fazla hatali deneme. 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const jeton = await oturumJetonuAl();
    const oturum = await oturumOku(jeton);
    if (!oturum || oturum.stage < 1) {
      return NextResponse.json(
        { basarili: false, hata: 'Once sifre adimini tamamlayin.', asama: 0 },
        { status: 401 }
      );
    }

    const govde = await istek.json().catch(() => ({}));
    const emoji: string = govde?.emoji || '';

    const yapilandirma = await adminYapilandirmaOku();
    const dogru = zamanGuvenliKarsilastir(emoji, yapilandirma.emoji_key || '');

    if (!dogru) {
      await denemeKaydet(ip, 'emoji', false);
      // Emoji yanlissa oturum bastan kurulur, sifre yeniden istenir.
      if (jeton) await oturumSil(jeton);
      return NextResponse.json(
        { basarili: false, hata: 'Secilen simge hatali. Giris bastan baslatildi.', asama: 0 },
        { status: 401 }
      );
    }

    await denemeKaydet(ip, 'emoji', true);
    await oturumAsamaYukselt(jeton as string, 2);

    return NextResponse.json({ basarili: true, asama: 2 });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
