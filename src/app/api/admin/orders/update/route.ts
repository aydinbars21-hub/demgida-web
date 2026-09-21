// src/app/api/admin/orders/update/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { yetkiKapisi, ipAl } from '@/lib/adminKoruma';
import { gunlukYaz } from '@/lib/adminDepo';

export const dynamic = 'force-dynamic';

const GECERLI_DURUMLAR = ['preparing', 'shipped', 'completed', 'cancelled'];

export async function POST(req: Request) {
  // Bu rota daha once herkese acikti. Artik uc katmani gecmis oturum sart.
  const engel = await yetkiKapisi();
  if (engel) return engel;

  try {
    const body = await req.json();
    const { orderId, status, trackingNumber } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Siparis numarasi gerekli.' }, { status: 400 });
    }

    if (status && !GECERLI_DURUMLAR.includes(status)) {
      return NextResponse.json({ success: false, error: 'Gecersiz siparis durumu.' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updateData.status = status;
    if (trackingNumber !== undefined) updateData.tracking_number = String(trackingNumber).slice(0, 100);

    const { data, error } = await supabaseServer
      .from('orders')
      .update(updateData)
      .eq('order_number', orderId)
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    await gunlukYaz('siparis_guncellendi', { orderId, status, trackingNumber }, ipAl(req));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
