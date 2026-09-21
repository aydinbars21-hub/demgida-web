// src/app/api/admin/kurulum/tamamla/route.ts
// Sifre, emoji ve Authenticator kodu birlikte kaydedilir.
import { NextResponse } from 'next/server';
import {
  adminYapilandirmaOku,
  adminYapilandirmaYaz,
  denemeKaydet,
  gunlukYaz,
  kilitliMi,
} from '@/lib/adminDepo';
import { parolaOzetle, zamanGuvenliKarsilastir, coz } from '@/lib/guvenlik';
import { totpDogrula } from '@/lib/totp';
import { emojiGecerliMi } from '@/lib/adminEmoji';
import { ipAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

const ASGARI_SIFRE = 10;

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

    const mevcut = await adminYapilandirmaOku();
    if (mevcut.setup_completed) {
      return NextResponse.json(
        { basarili: false, hata: 'Kurulum daha once tamamlanmis.' },
        { status: 409 }
      );
    }

    const govde = await istek.json().catch(() => ({}));
    const {
      kurulumSifresi: girilenKurulum = '',
      yeniSifre = '',
      yeniSifreTekrar = '',
      emoji = '',
      totpAnahtariKapali = '',
      dogrulamaKodu = '',
    } = govde || {};

    if (!zamanGuvenliKarsilastir(girilenKurulum, kurulumSifresi)) {
      await denemeKaydet(ip, 'kurulum', false);
      return NextResponse.json({ basarili: false, hata: 'Kurulum sifresi hatali.' }, { status: 401 });
    }

    if (typeof yeniSifre !== 'string' || yeniSifre.length < ASGARI_SIFRE) {
      return NextResponse.json(
        { basarili: false, hata: `Sifre en az ${ASGARI_SIFRE} karakter olmali.` },
        { status: 400 }
      );
    }
    if (yeniSifre !== yeniSifreTekrar) {
      return NextResponse.json({ basarili: false, hata: 'Sifreler birbirini tutmuyor.' }, { status: 400 });
    }
    if (!emojiGecerliMi(emoji)) {
      return NextResponse.json({ basarili: false, hata: 'Gecerli bir emoji secin.' }, { status: 400 });
    }

    let totpAnahtari: string;
    try {
      totpAnahtari = coz(totpAnahtariKapali);
    } catch {
      return NextResponse.json(
        { basarili: false, hata: 'Authenticator anahtari okunamadi. Kurulumu bastan baslatin.' },
        { status: 400 }
      );
    }

    if (!totpDogrula(totpAnahtari, dogrulamaKodu)) {
      await denemeKaydet(ip, 'kurulum', false);
      return NextResponse.json(
        { basarili: false, hata: 'Authenticator kodu dogrulanamadi. Uygulamadaki guncel kodu girin.' },
        { status: 401 }
      );
    }

    const { hash, salt } = parolaOzetle(yeniSifre);
    await adminYapilandirmaYaz({
      password_hash: hash,
      password_salt: salt,
      emoji_key: emoji,
      totp_secret_enc: totpAnahtariKapali,
    });

    await denemeKaydet(ip, 'kurulum', true);
    await gunlukYaz('kurulum_tamamlandi', { emoji }, ip);

    return NextResponse.json({ basarili: true });
  } catch (hata) {
    return NextResponse.json(
      { basarili: false, hata: (hata as Error).message },
      { status: 500 }
    );
  }
}
