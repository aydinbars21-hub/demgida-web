// src/app/api/admin/siparisler/route.ts
// Siparis listesi artik tarayicidan degil, korumali sunucu rotasindan gelir.
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { yetkiKapisi } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const engel = await yetkiKapisi();
  if (engel) return engel;

  try {
    const { data, error } = await supabaseServer
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ basarili: false, hata: error.message }, { status: 500 });
    }

    return NextResponse.json({ basarili: true, siparisler: data || [] });
  } catch (hata) {
    return NextResponse.json({ basarili: false, hata: (hata as Error).message }, { status: 500 });
  }
}
