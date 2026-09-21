// src/app/api/admin/cikis/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { oturumSil, OTURUM_CEREZI } from '@/lib/adminDepo';
import { oturumJetonuAl } from '@/lib/adminKoruma';

export const dynamic = 'force-dynamic';

export async function POST() {
  const jeton = await oturumJetonuAl();
  if (jeton) await oturumSil(jeton);
  const cerezler = await cookies();
  cerezler.delete(OTURUM_CEREZI);
  return NextResponse.json({ basarili: true });
}
