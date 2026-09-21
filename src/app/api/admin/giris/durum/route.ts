// src/app/api/admin/giris/durum/route.ts
import { NextResponse } from 'next/server';
import { adminYapilandirmaOku, oturumOku } from '@/lib/adminDepo';
import { oturumJetonuAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const yapilandirma = await adminYapilandirmaOku();
    const oturum = await oturumOku(await oturumJetonuAl());
    return NextResponse.json({
      basarili: true,
      kurulumTamam: yapilandirma.setup_completed === true,
      asama: oturum?.stage ?? 0,
    });
  } catch (hata) {
    return NextResponse.json(
      { basarili: false, hata: (hata as Error).message, asama: 0, kurulumTamam: false },
      { status: 500 }
    );
  }
}
