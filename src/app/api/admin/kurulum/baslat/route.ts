// src/app/api/admin/kurulum/baslat/route.ts
// Musteri, kendisine verilen uzun kurulum sifresini girer.
// Dogruysa Google Authenticator icin yeni bir anahtar ve karekod uretilir.
import { NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { adminYapilandirmaOku, denemeKaydet, kilitliMi } from '@/lib/adminDepo';
import { zamanGuvenliKarsilastir, sifrele } from '@/lib/guvenlik';
import { totpAnahtarUret, otpauthBaglantisi } from '@/lib/totp';
import { EMOJI_SECENEKLERI } from '@/lib/adminEmoji';
import { ipAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function POST(istek: Request) {
  const ip = ipAl(istek);
  try {
    if (await kilitliMi(ip)) {
      return NextResponse.json(
        { basarili: false, hata: 'Cok fazla hatali deneme yapildi. 15 dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const kurulumSifresi = process.env.ADMIN_SETUP_TOKEN;
    if (!kurulumSifresi) {
      return NextResponse.json(
        { basarili: false, hata: 'ADMIN_SETUP_TOKEN ortam degiskeni tanimli degil.' },
        { status: 500 }
      );
    }

    const yapilandirma = await adminYapilandirmaOku();
    if (yapilandirma.setup_completed) {
      return NextResponse.json(
        { basarili: false, hata: 'Kurulum daha once tamamlanmis. Giris ekranini kullanin.' },
        { status: 409 }
      );
    }

    const govde = await istek.json().catch(() => ({}));
    const girilen: string = govde?.kurulumSifresi || '';

    if (!zamanGuvenliKarsilastir(girilen, kurulumSifresi)) {
      await denemeKaydet(ip, 'kurulum', false);
      return NextResponse.json(
        { basarili: false, hata: 'Kurulum sifresi hatali.' },
        { status: 401 }
      );
    }

    await denemeKaydet(ip, 'kurulum', true);

    const totpAnahtari = totpAnahtarUret();
    const baglanti = otpauthBaglantisi(totpAnahtari, 'yonetici', 'DEM GIDA');
    const karekod = await QRCode.toDataURL(baglanti, { margin: 1, width: 240 });

    // Anahtari sifreli olarak istemciye geri veriyoruz. Tamamla adiminda geri gelir,
    // boylece sunucuda gecici bir kayit tutmaya gerek kalmaz ve duz anahtar
    // veritabaninda hicbir zaman yer almaz.
    return NextResponse.json({
      basarili: true,
      totpAnahtari,
      totpAnahtariKapali: sifrele(totpAnahtari),
      karekod,
      emojiler: EMOJI_SECENEKLERI,
    });
  } catch (hata) {
    return NextResponse.json(
      { basarili: false, hata: (hata as Error).message },
      { status: 500 }
    );
  }
}
