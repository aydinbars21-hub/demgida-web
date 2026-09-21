// src/app/api/orders/create/route.ts
// KAPATILDI. Herkese acikti ve odeme alinmadan payment_status 'paid' olan siparis olusturuyordu. Siparis artik yalnizca PayTR akisinda, api/odeme/paytr/token icinde olusur.
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
