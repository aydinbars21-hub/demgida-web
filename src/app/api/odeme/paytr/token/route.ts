// src/app/api/odeme/paytr/token/route.ts
// PayTR iFrame API 1. adim: odeme jetonu uretir ve iframe adresini dondurur.
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { paytrKimligiAl, odemeYapilandirmaOku } from '@/lib/adminDepo';
import { merchantOidUret, odemeJetonuAl, type SepetSatiri } from '@/lib/paytr';
import { ipAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

interface GelenSatir {
  name?: string;
  ad?: string;
  price?: number | string;
  fiyat?: number | string;
  quantity?: number | string;
  adet?: number | string;
}

export async function POST(istek: Request) {
  try {
    const kimlik = await paytrKimligiAl();
    if (!kimlik) {
      return NextResponse.json(
        {
          basarili: false,
          hata: 'PayTR ayarlari eksik ya da kapali. Yonetim panelinden magaza bilgilerini girin.',
        },
        { status: 503 }
      );
    }

    const ayar = await odemeYapilandirmaOku();
    const govde = await istek.json().catch(() => ({}));

    const email: string = (govde?.email || '').trim();
    const ad: string = (govde?.ad || govde?.customerName || '').trim();
    const telefon: string = (govde?.telefon || govde?.phone || '').trim();
    const adres: string = (govde?.adres || govde?.address || '').trim();
    const sepetHam: GelenSatir[] = Array.isArray(govde?.sepet)
      ? govde.sepet
      : Array.isArray(govde?.items)
      ? govde.items
      : [];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ basarili: false, hata: 'Gecerli bir e-posta girin.' }, { status: 400 });
    }
    if (sepetHam.length === 0) {
      return NextResponse.json({ basarili: false, hata: 'Sepet bos.' }, { status: 400 });
    }
    // Ad, telefon ve adres olmadan siparis kargoya verilemez, bu yuzden zorunlu.
    if (!ad) {
      return NextResponse.json({ basarili: false, hata: 'Ad soyad zorunlu.' }, { status: 400 });
    }
    if (!telefon) {
      return NextResponse.json({ basarili: false, hata: 'Telefon numarasi zorunlu.' }, { status: 400 });
    }
    if (!adres) {
      return NextResponse.json({ basarili: false, hata: 'Teslimat adresi zorunlu.' }, { status: 400 });
    }

    const sepet: SepetSatiri[] = sepetHam.map((s) => ({
      ad: String(s.ad ?? s.name ?? 'Urun'),
      fiyat: Number(s.fiyat ?? s.price ?? 0),
      adet: Math.max(1, Math.floor(Number(s.adet ?? s.quantity ?? 1))),
    }));

    if (sepet.some((s) => !Number.isFinite(s.fiyat) || s.fiyat <= 0)) {
      return NextResponse.json({ basarili: false, hata: 'Sepette gecersiz fiyat var.' }, { status: 400 });
    }

    // Tutar her zaman sunucuda hesaplanir, istemciden gelen toplam kabul edilmez.
    const kargo = Number(govde?.kargo ?? govde?.shipping ?? 0) || 0;
    const tutar = Number(
      (sepet.reduce((t, s) => t + s.fiyat * s.adet, 0) + kargo).toFixed(2)
    );

    if (tutar <= 0) {
      return NextResponse.json({ basarili: false, hata: 'Odeme tutari gecersiz.' }, { status: 400 });
    }

    const merchantOid = merchantOidUret('DEM');
    const siparisNo = merchantOid;
    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.demgida.com').replace(/\/$/, '');

    // Siparis kaydi odeme baslamadan once acilir. Eskiden hic acilmiyordu:
    // odeme basariyla gecse bile magazanin elinde kime ne gonderecegini
    // gosteren tek bir satir olmuyordu. Durum 'pending', bildirim gelince 'paid' olur.
    const { error: siparisHatasi } = await supabaseServer.from('orders').insert({
      order_number: siparisNo,
      customer_name: ad,
      customer_email: email,
      customer_phone: telefon,
      shipping_address: adres,
      total_amount: tutar,
      status: 'preparing',
      payment_status: 'pending',
      payment_method: 'credit_card',
      payment_provider: 'paytr',
      merchant_oid: merchantOid,
      items: sepet.map((s) => ({ name: s.ad, price: s.fiyat, quantity: s.adet })),
    });

    if (siparisHatasi) {
      // Siparis yazilamiyorsa odemeyi hic baslatmiyoruz. Para cekilip kaydin
      // kaybolmasindansa musteriye hata gostermek yeglenir.
      return NextResponse.json(
        { basarili: false, hata: `Siparis kaydedilemedi: ${siparisHatasi.message}` },
        { status: 500 }
      );
    }

    // Islem kaydi da acilir, bildirim geldiginde bu satir guncellenir.
    await supabaseServer.from('paytr_transactions').insert({
      merchant_oid: merchantOid,
      order_number: siparisNo,
      amount: tutar,
      status: 'pending',
      currency: ayar.currency,
      test_mode: ayar.test_mode,
    });

    const sonuc = await odemeJetonuAl(kimlik, {
      merchantOid,
      email,
      tutar,
      kullaniciIp: ipAl(istek),
      kullaniciAd: ad || 'Musteri',
      kullaniciAdres: adres || 'Belirtilmedi',
      kullaniciTelefon: telefon || '0000000000',
      sepet,
      basariliUrl: `${siteUrl}/odeme/sonuc?durum=basarili&oid=${merchantOid}`,
      basarisizUrl: `${siteUrl}/odeme/sonuc?durum=basarisiz&oid=${merchantOid}`,
      testModu: ayar.test_mode,
      taksitYok: ayar.no_installment,
      maksTaksit: ayar.max_installment,
      paraBirimi: ayar.currency,
      zamanAsimiDakika: ayar.timeout_limit,
      dil: 'tr',
    });

    if (!sonuc.basarili) {
      await supabaseServer
        .from('paytr_transactions')
        .update({ status: 'failed', failed_reason_msg: sonuc.hata, updated_at: new Date().toISOString() })
        .eq('merchant_oid', merchantOid);

      // Odeme hic baslamadigi icin siparis de iptal isaretlenir, panelde
      // "hazirlaniyor" diye asili kalmasin.
      await supabaseServer
        .from('orders')
        .update({ status: 'cancelled', payment_status: 'failed', updated_at: new Date().toISOString() })
        .eq('merchant_oid', merchantOid);

      return NextResponse.json({ basarili: false, hata: sonuc.hata }, { status: 502 });
    }

    return NextResponse.json({
      basarili: true,
      merchantOid,
      token: sonuc.token,
      iframeUrl: sonuc.iframeUrl,
      tutar,
    });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
