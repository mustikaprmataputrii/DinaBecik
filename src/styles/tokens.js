/**
 * ============================================================================
 *  Dina Becik — DESIGN TOKEN
 * ============================================================================
 *  PEMILIK FILE: Sri (Frontend & Desain)
 *
 *  ATURAN: JANGAN menulis warna hardcoded (#8B5E3C) di komponen.
 *  Selalu import dari sini. Kalau palet berubah, cukup ubah file ini.
 *
 *  Nuansa Jawa modern: sogan (cokelat), emas, krem, motif batik tipis.
 *  Tampilan tetap bersih supaya angka mudah dibaca. (Panduan bagian 10)
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 * WARNA
 * ------------------------------------------------------------------------- */

export const WARNA = Object.freeze({
  // --- Palet utama: sogan (cokelat), emas, krem ---
  sogan: {
    50: '#FBF6F0',
    100: '#F5EADF',
    200: '#E8D3BE',
    300: '#D6B694',
    400: '#BE9169',
    500: '#A5703F', // sogan utama
    600: '#8B5E3C',
    700: '#6F4A2F',
    800: '#523722',
    900: '#3A2718',
  },
  emas: {
    50: '#FEF9EC',
    100: '#FCF0CC',
    200: '#F8E09B',
    300: '#F2CB63',
    400: '#E9B23A',
    500: '#D99A1E', // emas utama
    600: '#B87C13',
    700: '#925E11',
    800: '#784C15',
    900: '#653F16',
  },
  krem: {
    50: '#FFFDFA',
    100: '#FDF9F3',
    200: '#F9F2E7',
    300: '#F2E8D8',
    400: '#E9DAC5',
  },

  // --- Netral (untuk teks & garis) ---
  netral: {
    0: '#FFFFFF',
    50: '#FAFAF9',
    100: '#F4F3F1',
    200: '#E7E5E1',
    300: '#D3D0CA',
    400: '#A8A29A',
    500: '#7C766D',
    600: '#5C574F',
    700: '#403C36',
    800: '#2A2723',
    900: '#1A1815',
  },

  // --- Warna status (semantik) ---
  status: {
    draft: '#7C766D', // abu — persiapan
    penilaian: '#2F6FA8', // biru — tindakan DM
    voting: '#B87C13', // emas — konsensus
    selesai: '#2E7D4F', // hijau — hasil
    bahaya: '#B3261E', // merah — error / ditolak
    sukses: '#2E7D4F',
    peringatan: '#B26A00',
  },

  // --- Warna ranking (untuk grafik & badge) ---
  ranking: {
    pertama: '#D99A1E', // emas — pemenang
    kedua: '#A8A29A', // perak
    ketiga: '#A5703F', // perunggu (sogan)
    lainnya: '#D3D0CA',
  },
});

/* ---------------------------------------------------------------------------
 * TIPOGRAFI
 * ------------------------------------------------------------------------- */

export const FONT = Object.freeze({
  /** Font judul — berkarakter, tetap modern. */
  judul: "'Playfair Display', 'Georgia', serif",
  /** Font isi — mudah dibaca, terutama untuk angka. */
  isi: "'Inter', 'Segoe UI', system-ui, sans-serif",
  /** Font angka — WAJIB monospace/tabular agar kolom angka rata. */
  angka: "'JetBrains Mono', 'Consolas', monospace",
});

export const UKURAN_FONT = Object.freeze({
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
});

export const BERAT_FONT = Object.freeze({
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
});

/* ---------------------------------------------------------------------------
 * SPASI (skala 4px)
 * ------------------------------------------------------------------------- */

export const SPASI = Object.freeze({
  0: '0',
  1: '0.25rem', // 4
  2: '0.5rem', // 8
  3: '0.75rem', // 12
  4: '1rem', // 16
  5: '1.25rem', // 20
  6: '1.5rem', // 24
  8: '2rem', // 32
  10: '2.5rem', // 40
  12: '3rem', // 48
  16: '4rem', // 64
});

/* ---------------------------------------------------------------------------
 * RADIUS & BAYANGAN
 * ------------------------------------------------------------------------- */

export const RADIUS = Object.freeze({
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  penuh: '9999px',
});

export const BAYANGAN = Object.freeze({
  sm: '0 1px 2px rgba(58, 39, 24, 0.06)',
  md: '0 2px 8px rgba(58, 39, 24, 0.08)',
  lg: '0 4px 16px rgba(58, 39, 24, 0.10)',
  xl: '0 8px 32px rgba(58, 39, 24, 0.12)',
});

/* ---------------------------------------------------------------------------
 * MOTIF BATIK
 * ------------------------------------------------------------------------- */

/**
 * Motif batik tipis sebagai hiasan latar.
 * Dipakai sangat halus (opacity 0.03–0.06) agar angka tetap terbaca.
 */
export const MOTIF_BATIK = Object.freeze({
  /** Pola kawung sederhana — SVG data URI. */
  kawung:
    "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238B5E3C' stroke-width='0.6' opacity='0.5'%3E%3Ccircle cx='10' cy='10' r='7'/%3E%3Ccircle cx='30' cy='10' r='7'/%3E%3Ccircle cx='10' cy='30' r='7'/%3E%3Ccircle cx='30' cy='30' r='7'/%3E%3C/g%3E%3C/svg%3E\")",
  /** Pola parang sederhana. */
  parang:
    "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='%23D99A1E' stroke-width='0.8' opacity='0.35' fill='none'%3E%3Cpath d='M0 30 Q15 10 30 30 T60 30'/%3E%3Cpath d='M0 45 Q15 25 30 45 T60 45'/%3E%3C/g%3E%3C/svg%3E\")",
  /** Opacity yang disarankan untuk latar halaman. */
  opacityLatar: 0.04,
});

/* ---------------------------------------------------------------------------
 * TEMA (siap dipakai sebagai CSS variable)
 * ------------------------------------------------------------------------- */

/** Konversi token menjadi CSS custom properties. */
export function keCssVariables() {
  return {
    '--warna-sogan': WARNA.sogan[500],
    '--warna-sogan-tua': WARNA.sogan[700],
    '--warna-sogan-muda': WARNA.sogan[100],
    '--warna-emas': WARNA.emas[500],
    '--warna-emas-muda': WARNA.emas[100],
    '--warna-krem': WARNA.krem[200],
    '--warna-latar': WARNA.krem[100],
    '--warna-teks': WARNA.netral[800],
    '--warna-teks-lemah': WARNA.netral[500],
    '--warna-garis': WARNA.netral[200],
    '--warna-status-draft': WARNA.status.draft,
    '--warna-status-penilaian': WARNA.status.penilaian,
    '--warna-status-voting': WARNA.status.voting,
    '--warna-status-selesai': WARNA.status.selesai,
    '--warna-bahaya': WARNA.status.bahaya,
    '--font-judul': FONT.judul,
    '--font-isi': FONT.isi,
    '--font-angka': FONT.angka,
    '--radius-md': RADIUS.md,
    '--radius-lg': RADIUS.lg,
    '--bayangan-md': BAYANGAN.md,
  };
}
