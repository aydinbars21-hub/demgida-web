// src/app/api/admin/giris/adim3/route.ts
// Ucuncu katman: Google Authenticator kodu.
import { NextResponse } from 'next/server';
import {
  adminYapilandirmaOku,
  denemeKaydet,
  gunlukYaz,
  kilitliMi,
  oturumAsamaYukselt,
  oturumOku,
} from '@/lib/adminDepo';
import { coz } from '@/lib/guvenlik';
import { totpDogrula } from '@/lib/totp';
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
    if (!oturum || oturum.stage < 2) {
      return NextResponse.json(
        { basarili: false, hata: 'Once sifre ve simge adimlarini tamamlayin.', asama: oturum?.stage ?? 0 },
        { status: 401 }
      );
    }

    const govde = await istek.json().catch(() => ({}));
    const kod: string = govde?.kod || '';

    const yapilandirma = await adminYapilandirmaOku();
    if (!yapilandirma.totp_secret_enc) {
      return NextResponse.json(
        { basarili: false, hata: 'Authenticator anahtari bulunamadi.' },
        { status: 500 }
      );
    }

    let anahtar: string;
    try {
      anahtar = coz(yapilandirma.totp_secret_enc);
    } catch {
      return NextResponse.json(
        { basarili: false, hata: 'Authenticator anahtari cozulemedi. Sifreleme anahtarini kontrol edin.' },
        { status: 500 }
      );
    }

    if (!totpDogrula(anahtar, kod)) {
      await denemeKaydet(ip, 'totp', false);
      return NextResponse.json({ basarili: false, hata: 'Kod dogrulanamadi.' }, { status: 401 });
    }

    await denemeKaydet(ip, 'totp', true);
    await oturumAsamaYukselt(jeton as string, 3);
    await gunlukYaz('giris_basarili', null, ip);

    return NextResponse.json({ basarili: true, asama: 3 });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
