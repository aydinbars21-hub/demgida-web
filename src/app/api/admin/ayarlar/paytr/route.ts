// src/app/api/admin/ayarlar/paytr/route.ts
// PayTR magaza bilgilerinin panelden okunmasi ve kaydedilmesi.
// Her iki islem de uc katmani gecmis oturum ister.
import { NextResponse } from 'next/server';
import {
  gunlukYaz,
  odemeYapilandirmaOku,
  odemeYapilandirmaYaz,
} from '@/lib/adminDepo';
import { ipAl, yetkiKapisi } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const engel = await yetkiKapisi();
  if (engel) return engel;

  try {
    const ayar = await odemeYapilandirmaOku();
    return NextResponse.json({
      basarili: true,
      ayarlar: {
        merchantId: ayar.merchant_id || '',
        // Gizli alanlar panele hicbir zaman duz olarak gonderilmez.
        merchantKeyKayitli: Boolean(ayar.merchant_key_enc),
        merchantSaltKayitli: Boolean(ayar.merchant_salt_enc),
        testModu: ayar.test_mode,
        taksitYok: ayar.no_installment,
        maksTaksit: ayar.max_installment,
        paraBirimi: ayar.currency,
        zamanAsimi: ayar.timeout_limit,
        aktif: ayar.is_active,
        guncellenme: ayar.updated_at,
      },
    });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}

export async function POST(istek: Request) {
  const engel = await yetkiKapisi();
  if (engel) return engel;

  try {
    const govde = await istek.json().catch(() => ({}));
    const {
      merchantId = '',
      merchantKey = '',
      merchantSalt = '',
      testModu = true,
      taksitYok = false,
      maksTaksit = 0,
      paraBirimi = 'TL',
      zamanAsimi = 30,
      aktif = false,
    } = govde || {};

    if (!String(merchantId).trim()) {
      return NextResponse.json(
        { basarili: false, hata: 'Magaza no (merchant_id) zorunlu.' },
        { status: 400 }
      );
    }

    const taksit = Number(maksTaksit);
    if (!Number.isInteger(taksit) || taksit < 0 || taksit > 12) {
      return NextResponse.json(
        { basarili: false, hata: 'Azami taksit 0 ile 12 arasinda olmali.' },
        { status: 400 }
      );
    }

    const gecerliParaBirimleri = ['TL', 'EUR', 'USD', 'GBP', 'RUB'];
    if (!gecerliParaBirimleri.includes(paraBirimi)) {
      return NextResponse.json(
        { basarili: false, hata: 'Para birimi gecersiz.' },
        { status: 400 }
      );
    }

    // Aktif edilecekse anahtarlarin ya yeni girilmis ya da kayitli olmasi gerekir.
    const mevcut = await odemeYapilandirmaOku();
    const anahtarVar = Boolean(merchantKey) || Boolean(mevcut.merchant_key_enc);
    const tuzVar = Boolean(merchantSalt) || Boolean(mevcut.merchant_salt_enc);
    if (aktif && (!anahtarVar || !tuzVar)) {
      return NextResponse.json(
        { basarili: false, hata: 'Odemeyi acmak icin merchant_key ve merchant_salt girilmeli.' },
        { status: 400 }
      );
    }

    await odemeYapilandirmaYaz({
      merchant_id: String(merchantId).trim(),
      merchant_key: merchantKey ? String(merchantKey).trim() : undefined,
      merchant_salt: merchantSalt ? String(merchantSalt).trim() : undefined,
      test_mode: Boolean(testModu),
      no_installment: Boolean(taksitYok),
      max_installment: taksit,
      currency: paraBirimi,
      timeout_limit: Number(zamanAsimi) || 30,
      is_active: Boolean(aktif),
    });

    await gunlukYaz(
      'paytr_ayarlari_guncellendi',
      { merchantId, testModu, aktif, anahtarDegisti: Boolean(merchantKey) },
      ipAl(istek)
    );

    return NextResponse.json({ basarili: true });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
