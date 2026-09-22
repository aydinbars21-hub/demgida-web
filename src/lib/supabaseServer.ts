// src/lib/supabaseServer.ts
// Sunucu tarafi Supabase istemcisi.
//
// Istemci dosya yuklenirken degil, ILK KULLANIMDA kurulur. Sebep:
// createClient adresi eksikse hemen istisna firlatiyor. Dosya yuklenirken
// kurulursa bu istisna derleme sirasinda patliyordu ve butun derleme
// "supabaseUrl is required" diyerek coküyordu; hangi ortam degiskeninin
// eksik oldugu anlasilmiyordu. Simdi derleme ortam degiskeni olmadan da
// gecer, eksiklik yalnizca ilgili rota cagrildiginda ve anlasilir bir
// mesajla ortaya cikar.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let istemci: SupabaseClient | null = null;

function istemciAl(): SupabaseClient {
  if (istemci) return istemci;

  const adres = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // service_role anahtari yalnizca sunucuda calisir, tarayiciya asla sizmaz.
  const anahtar =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!adres) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL ortam degiskeni tanimli degil.');
  }
  if (!anahtar) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY ortam degiskeni tanimli degil (NEXT_PUBLIC_SUPABASE_ANON_KEY de yok).'
    );
  }

  istemci = createClient(adres, anahtar, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return istemci;
}

/**
 * Cagri yerleri degismesin diye vekil kullaniliyor: supabaseServer.from(...)
 * yazimi aynen calisir, ama gercek istemci ilk erisimde kurulur.
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(_hedef, ozellik) {
    const gercek = istemciAl() as unknown as Record<string | symbol, unknown>;
    const deger = gercek[ozellik];
    return typeof deger === 'function' ? (deger as (...a: unknown[]) => unknown).bind(gercek) : deger;
  },
});
