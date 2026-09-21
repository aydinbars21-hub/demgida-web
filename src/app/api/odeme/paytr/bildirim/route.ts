// src/app/api/odeme/paytr/bildirim/route.ts
// PayTR iFrame API 2. adim: bildirim (callback) adresi.
// PayTR bu adrese sunucudan POST atar. Cevap olarak yalnizca "OK" basilmalidir,
// aksi halde PayTR bildirimi tekrar tekrar gonderir.
import { supabaseServer } from '@/lib/supabaseServer';
import { paytrKimligiAl } from '@/lib/adminDepo';
import { bildirimHashDogrula } from '@/lib/paytr';
import { siparisEpostasiGonder } from '@/lib/siparisEpostasi';

export const dynamic = 'force-dynamic';

function ok() {
  return new Response('OK', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

export async function POST(istek: Request) {
  try {
    const form = await istek.formData();
    const al = (ad: string) => String(form.get(ad) ?? '');

    const bildirim = {
      merchant_oid: al('merchant_oid'),
      status: al('status'),
      total_amount: al('total_amount'),
      hash: al('hash'),
    };

    if (!bildirim.merchant_oid || !bildirim.hash) {
      return new Response('PAYTR notification failed: eksik alan', { status: 400 });
    }

    const kimlik = await paytrKimligiAl();
    if (!kimlik) {
      // Ayarlar okunamiyorsa OK basmiyoruz ki PayTR tekrar denesin.
      return new Response('PAYTR notification failed: ayarlar yok', { status: 503 });
    }

    // Hash dogrulanmazsa sahte bildirimle bedava siparis gecilebilir.
    if (!bildirimHashDogrula(kimlik, bildirim)) {
      return new Response('PAYTR notification failed: bad hash', { status: 400 });
    }

    const { data: mevcut } = await supabaseServer
      .from('paytr_transactions')
      .select('id, status')
      .eq('merchant_oid', bildirim.merchant_oid)
      .maybeSingle();

    // Ayni bildirim ikinci kez gelirse islem tekrarlanmaz, sadece OK basilir.
    if (mevcut && mevcut.status !== 'pending') {
      return ok();
    }

    const basarili = bildirim.status === 'success';
    const toplam = Number(bildirim.total_amount) / 100;

    await supabaseServer
      .from('paytr_transactions')
      .update({
        status: basarili ? 'success' : 'failed',
        payment_type: al('payment_type') || null,
        payment_amount: al('payment_amount') ? Number(al('payment_amount')) / 100 : null,
        total_amount: Number.isFinite(toplam) ? toplam : null,
        installment_count: al('installment_count') ? Number(al('installment_count')) : null,
        currency: al('currency') || null,
        test_mode: al('test_mode') === '1',
        failed_reason_code: al('failed_reason_code') || null,
        failed_reason_msg: al('failed_reason_msg') || null,
        callback_raw: Object.fromEntries(form.entries()) as never,
        notified_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_oid', bildirim.merchant_oid);

    // Siparis satiri odeme durumuna gore isaretlenir ve geri okunur.
    // Geri okuma, onay e-postasi icin musteri bilgilerini almak uzere yapilir.
    const { data: siparis } = await supabaseServer
      .from('orders')
      .update({
        payment_status: basarili ? 'paid' : 'failed',
        status: basarili ? 'preparing' : 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_oid', bildirim.merchant_oid)
      .select(
        'order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, items'
      )
      .maybeSingle();

    // Onay e-postasi yalnizca odeme gercekten gectiginde gider.
    // Gonderilemezse akis bozulmaz, PayTR'ye yine OK basariz: para tahsil
    // edilmistir, bildirimi tekrar tekrar aldirmanin faydasi yoktur.
    if (basarili && siparis?.customer_email) {
      const satirlar = Array.isArray(siparis.items)
        ? (siparis.items as { name?: string; price?: number; quantity?: number }[]).map((s) => ({
            name: String(s?.name ?? 'Urun'),
            price: Number(s?.price ?? 0),
            quantity: Number(s?.quantity ?? 1),
          }))
        : [];

      const sonuc = await siparisEpostasiGonder({
        siparisNo: siparis.order_number,
        musteriAdi: siparis.customer_name || 'Musteri',
        musteriEposta: siparis.customer_email,
        musteriTelefon: siparis.customer_phone || '',
        adres: siparis.shipping_address || '',
        satirlar,
        toplam: Number(siparis.total_amount ?? toplam),
      });

      if (!sonuc.basarili) {
        console.error('Siparis e-postasi gonderilemedi:', sonuc.hata);
      }
    }

    return ok();
  } catch {
    // Hata durumunda OK basmiyoruz, PayTR bir dakika sonra tekrar deneyecek.
    return new Response('PAYTR notification failed: sunucu hatasi', { status: 500 });
  }
}

// PayTR yalnizca POST gonderir. Tarayicidan acildiginda anlasilir bir mesaj donsun.
export async function GET() {
  return new Response('Bu adres PayTR bildirimleri icindir.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
