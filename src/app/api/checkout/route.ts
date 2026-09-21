// src/app/api/checkout/route.ts
// KAPATILDI. Eski iyzico akisi. Odeme PayTR'ye tasindi, hicbir sayfa bu rotayi cagirmiyor.
// Dosya git gecmisinde duruyor; onay verilirse tamamen silinebilir.
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function kapali() {
  return NextResponse.json(
    { success: false, error: 'Bu rota kullanimdan kaldirildi.' },
    { status: 410 }
  );
}

export async function GET() {
  return kapali();
}

export async function POST() {
  return kapali();
}
