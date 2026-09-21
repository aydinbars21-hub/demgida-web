// src/app/api/admin/kurulum/durum/route.ts
import { NextResponse } from 'next/server';
import { adminYapilandirmaOku } from '@/lib/adminDepo';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const yapilandirma = await adminYapilandirmaOku();
    return NextResponse.json({
      basarili: true,
      kurulumTamam: yapilandirma.setup_completed === true,
    });
  } catch (hata) {
    return NextResponse.json(
      { basarili: false, hata: (hata as Error).message },
      { status: 500 }
    );
  }
}
