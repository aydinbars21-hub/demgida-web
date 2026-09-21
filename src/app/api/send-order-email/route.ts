// src/app/api/send-order-email/route.ts
// KAPATILDI. Herkese acikti; disaridan cagirilip magazanin Resend hesabi uzerinden e-posta gonderilebiliyordu. E-posta artik src/lib/siparisEpostasi.ts uzerinden, yalnizca sunucu tarafinda gonderilir.
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
