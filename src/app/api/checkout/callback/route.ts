// src/app/api/checkout/callback/route.ts
// KAPATILDI. Eski iyzico geri donus adresi. Odeme PayTR'ye tasindi.
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
