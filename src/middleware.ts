// src/middleware.ts
import { NextResponse } from 'next/server';

// Istek nesnesine ihtiyac yok: bu ara katman yalnizca cikis basliklarini ekliyor.
export function middleware() {
  const response = NextResponse.next();

  // Kurumsal Güvenlik Başlıkları (Security Headers)
  response.headers.set('X-Frame-Options', 'DENY'); // Sitenin başka siteler içinde iframe ile açılmasını (Clickjacking) engeller
  response.headers.set('X-Content-Type-Options', 'nosniff'); // MIME türü taklidini engeller
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};