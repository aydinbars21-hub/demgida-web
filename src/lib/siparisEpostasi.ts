// src/lib/siparisEpostasi.ts
// Siparis onay e-postasi. Eskiden herkese acik bir API rotasiydi, yani disaridan
// cagirip magazanin Resend hesabi uzerinden e-posta gonderilebiliyordu.
// Artik yalnizca sunucu tarafindan, odeme PayTR tarafindan onaylandiktan sonra calisir.
import { Resend } from 'resend';

export interface EpostaSatiri {
  name: string;
  price: number;
  quantity: number;
}

export interface SiparisEpostasiGirdi {
  siparisNo: string;
  musteriAdi: string;
  musteriEposta: string;
  musteriTelefon: string;
  adres: string;
  satirlar: EpostaSatiri[];
  toplam: number;
}

function paraBicimle(deger: number): string {
  return Number(deger).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** HTML'e gomulen her kullanici verisi once kacislanir. */
function kacisla(deger: unknown): string {
  return String(deger ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function govdeUret(g: SiparisEpostasiGirdi): string {
  const satirlarHtml = g.satirlar
    .map(
      (s) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 8px; font-size: 14px; color: #1f2937;">${kacisla(s.name)}</td>
          <td style="padding: 12px 8px; font-size: 14px; text-align: center; color: #4b5563;">${kacisla(s.quantity)}</td>
          <td style="padding: 12px 8px; font-size: 14px; text-align: right; color: #1f2937; font-weight: 500;">
            ${paraBicimle(s.price * s.quantity)} TL
          </td>
        </tr>`
    )
    .join('');

  return `
      <div style="font-family: -apple-system, 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <div style="background-color: #1a1a1a; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 600; letter-spacing: 1px;">DEM GIDA &amp; KAHVE</h1>
        </div>

        <div style="padding: 28px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0; margin-bottom: 12px;">Odemeniz alindi</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            Merhaba <strong>${kacisla(g.musteriAdi)}</strong>, odemeniz onaylandi ve siparisiniz hazirlanmaya basladi.
          </p>

          <div style="background-color: #f9fafb; padding: 14px 18px; border-radius: 6px; margin-bottom: 24px; font-size: 13px; color: #374151;">
            <p style="margin: 4px 0;"><strong>Siparis kodu:</strong> ${kacisla(g.siparisNo)}</p>
            <p style="margin: 4px 0;"><strong>Teslimat adresi:</strong> ${kacisla(g.adres)}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
                <th style="padding: 8px; font-size: 12px; text-transform: uppercase; color: #6b7280;">Urun</th>
                <th style="padding: 8px; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: center;">Adet</th>
                <th style="padding: 8px; font-size: 12px; text-transform: uppercase; color: #6b7280; text-align: right;">Tutar</th>
              </tr>
            </thead>
            <tbody>${satirlarHtml}</tbody>
          </table>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 16px; text-align: right;">
            <p style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">
              Toplam tutar: ${paraBicimle(g.toplam)} TL
            </p>
          </div>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">Dem Gida &amp; Kahve. Bizi tercih ettiginiz icin tesekkur ederiz.</p>
        </div>
      </div>`;
}

/**
 * Musteriye ve magaza sahibine siparis bildirimi gonderir.
 * Hicbir zaman istisna firlatmaz: e-posta gonderilemezse odeme akisi bozulmamali,
 * cunku para zaten tahsil edilmis olur. Sonuc nesnesi dondurur.
 */
export async function siparisEpostasiGonder(
  g: SiparisEpostasiGirdi
): Promise<{ basarili: boolean; hata?: string }> {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) {
    return { basarili: false, hata: 'RESEND_API_KEY tanimli degil.' };
  }

  // Dogrulanmis kendi alan adimiz. Tanimli degilse Resend'in paylasimli test
  // adresine duseriz; o adres yalnizca test icindir, canlida spam'e duser.
  const gonderen = process.env.SIPARIS_EPOSTA_GONDEREN || 'Dem Gida <onboarding@resend.dev>';
  const yonetici = process.env.ADMIN_NOTIFICATION_EMAIL;

  try {
    const resend = new Resend(anahtar);
    const govde = govdeUret(g);

    const isler: Promise<unknown>[] = [
      resend.emails.send({
        from: gonderen,
        to: g.musteriEposta,
        subject: `Siparisiniz alindi - ${g.siparisNo}`,
        html: govde,
      }),
    ];

    if (yonetici) {
      isler.push(
        resend.emails.send({
          from: gonderen,
          to: yonetici,
          subject: `[YENI SIPARIS] ${g.siparisNo} - ${g.musteriAdi}`,
          html: `
        <div style="font-family: -apple-system, sans-serif; padding: 16px;">
          <h3 style="color: #111827;">Yeni siparis olusturuldu</h3>
          <p><strong>Musteri:</strong> ${kacisla(g.musteriAdi)} (${kacisla(g.musteriEposta)} / ${kacisla(g.musteriTelefon)})</p>
          <p><strong>Tutar:</strong> ${paraBicimle(g.toplam)} TL</p>
          <p><strong>Adres:</strong> ${kacisla(g.adres)}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 16px 0;" />
          ${govde}
        </div>`,
        })
      );
    }

    await Promise.all(isler);
    return { basarili: true };
  } catch (hata) {
    return { basarili: false, hata: (hata as Error).message };
  }
}
