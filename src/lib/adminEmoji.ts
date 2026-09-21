// src/lib/adminEmoji.ts
// Ikinci guvenlik katmani icin kullanilan dokuz secenek.
// Emojinin kendisi degil, anahtari saklanir. Konumlar her giriste karistirilir,
// boylece omuz ustunden konuma bakarak ogrenmek ise yaramaz.

export interface EmojiSecenegi {
  anahtar: string;
  simge: string;
  ad: string;
}

export const EMOJI_SECENEKLERI: EmojiSecenegi[] = [
  { anahtar: 'kahve',   simge: '☕',      ad: 'Kahve' },
  { anahtar: 'anahtar', simge: '🔑', ad: 'Anahtar' },
  { anahtar: 'yildiz',  simge: '⭐',      ad: 'Yildiz' },
  { anahtar: 'yaprak',  simge: '🌿', ad: 'Yaprak' },
  { anahtar: 'kilit',   simge: '🔒', ad: 'Kilit' },
  { anahtar: 'ates',    simge: '🔥', ad: 'Ates' },
  { anahtar: 'cekirdek',simge: '🌰', ad: 'Cekirdek' },
  { anahtar: 'kalp',    simge: '❤️', ad: 'Kalp' },
  { anahtar: 'zil',     simge: '🔔', ad: 'Zil' },
];

export function emojiGecerliMi(anahtar: string): boolean {
  return EMOJI_SECENEKLERI.some((e) => e.anahtar === anahtar);
}

/** Fisher-Yates ile kopya uzerinde karistirir, kaynak dizi bozulmaz. */
export function emojileriKaristir(): EmojiSecenegi[] {
  const kopya = [...EMOJI_SECENEKLERI];
  for (let i = kopya.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopya[i], kopya[j]] = [kopya[j], kopya[i]];
  }
  return kopya;
}
