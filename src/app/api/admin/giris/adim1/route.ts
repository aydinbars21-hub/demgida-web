// src/app/api/admin/giris/adim1/route.ts
// Birinci katman: yonetici sifresi.
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  adminYapilandirmaOku,
  denemeKaydet,
  kilitliMi,
  oturumOlustur,
  OTURUM_CEREZI,
  OTURUM_SURESI_SANIYE,
} from '@/lib/adminDepo';
import { parolaDogrula } from '@/lib/guvenlik';
import { emojileriKaristir } from '@/lib/adminEmoji';
import { ipAl, cerezSecenekleri } from '@/lib/adminKoruma';

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

    const yapilandirma = await adminYapilandirmaOku();
    if (!yapilandirma.setup_completed) {
      return NextResponse.json(
        { basarili: false, hata: 'Panel henuz kurulmadi.', kurulumGerekli: true },
        { status: 409 }
      );
    }

    const govde = await istek.json().catch(() => ({}));
    const sifre: string = govde?.sifre || '';

    const dogru = parolaDogrula(
      sifre,
      yapilandirma.password_hash || '',
      yapilandirma.password_salt || ''
    );

    if (!dogru) {
      await denemeKaydet(ip, 'sifre', false);
      return NextResponse.json({ basarili: false, hata: 'Sifre hatali.' }, { status: 401 });
    }

    await denemeKaydet(ip, 'sifre', true);

    const jeton = await oturumOlustur(ip, istek.headers.get('user-agent') || '');
    const cerezler = await cookies();
    cerezler.set(OTURUM_CEREZI, jeton, cerezSecenekleri(OTURUM_SURESI_SANIYE));

    // Emojiler her giriste karisik sirada gonderilir.
    return NextResponse.json({ basarili: true, asama: 1, emojiler: emojileriKaristir() });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
