/**
 * ============================================================================
 *  Dina Becik — DATA UJI SKENARIO SERI (FIXTURE T6)
 * ============================================================================
 *  Tujuan: menyediakan data sintetis yang menghasilkan SERI di puncak
 *  Weighted Borda, sehingga aturan "seri dimenangkan ranking Sesepuh"
 *  (Panduan bagian 6.3, catatan teknis bagian 7) dapat diuji dan didemokan.
 *
 *  Skenario:
 *    - Sesepuh dan Orang Tua memberi urutan yang sama: A > B > C > D > E > F.
 *    - WO membalik urutan: B di ranking 1 dan A di ranking terakhir.
 *    - Akibatnya A dan B sama-sama mengumpulkan 31 poin (SERI).
 *    - Karena seri, ranking Sesepuh menentukan: A (ranking 1) menang atas
 *      B (ranking 2).
 *
 *  File ini SINTETIS dan tidak berasal dari Tabel 7.1/7.2/7.3.
 *  Kode A–F dan tanggal hanya label identitas agar mudah dibaca; tanggal
 *  tidak memengaruhi perhitungan Borda. Jangan mencampurnya dengan
 *  `dataAcuan.js` (file itu dikunci 50 unit test).
 * ============================================================================
 */

/** Identitas acara uji. */
export const ACARA_UJI_SERI = Object.freeze({
  id: 'acara-uji-seri-t6',
  nama_acara: 'Acara Uji Seri (T6)',
  jenis: 'pernikahan',
  status: 'Voting',
  dibuat_oleh: 'sesepuh',
});

/**
 * Kandidat pada skenario seri. `tanggal` hanya label; urutan poin ditentukan
 * oleh ranking per DM di bawah.
 */
export const KANDIDAT_UJI_SERI = Object.freeze([
  { kode: 'A', tanggal: '2027-06-12' },
  { kode: 'B', tanggal: '2027-06-20' },
  { kode: 'C', tanggal: '2027-07-10' },
  { kode: 'D', tanggal: '2027-07-23' },
  { kode: 'E', tanggal: '2027-08-07' },
  { kode: 'F', tanggal: '2027-08-21' },
]);

/**
 * Ranking per decision maker untuk skenario seri (n = 6).
 * Sesepuh dan Orang Tua identik; WO membalik B ke atas dan A ke bawah.
 */
export const RANKING_SERI_PER_DM = Object.freeze({
  sesepuh: Object.freeze({ A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }),
  orangtua: Object.freeze({ A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 }),
  wo: Object.freeze({ A: 6, B: 1, C: 2, D: 3, E: 4, F: 5 }),
});

/**
 * Angka acuan hasil Weighted Borda untuk skenario seri.
 * Dihitung dengan bobot jabatan Sesepuh 3, Orang Tua 2, WO 1
 * dan poinBorda = n - ranking + 1 (n = 6).
 */
export const ACUAN_SERI_BORDA = Object.freeze([
  { kode: 'A', poinSesepuh: 18, poinOrtu: 12, poinWo: 1, totalPoin: 31, rankingFinal: 1 },
  { kode: 'B', poinSesepuh: 15, poinOrtu: 10, poinWo: 6, totalPoin: 31, rankingFinal: 2 },
  { kode: 'C', poinSesepuh: 12, poinOrtu: 8, poinWo: 5, totalPoin: 25, rankingFinal: 3 },
  { kode: 'D', poinSesepuh: 9, poinOrtu: 6, poinWo: 4, totalPoin: 19, rankingFinal: 4 },
  { kode: 'E', poinSesepuh: 6, poinOrtu: 4, poinWo: 3, totalPoin: 13, rankingFinal: 5 },
  { kode: 'F', poinSesepuh: 3, poinOrtu: 2, poinWo: 2, totalPoin: 7, rankingFinal: 6 },
]);

/** Pasangan kandidat yang benar-benar seri pada skenario ini. */
export const PASANGAN_SERI = Object.freeze({
  kandidat: Object.freeze(['A', 'B']),
  totalPoin: 31,
});

/** Pemenang setelah aturan seri: ranking Sesepuh lebih tinggi. */
export const PEMENANG_UJI_SERI = Object.freeze({
  kode: 'A',
  totalPoin: 31,
  alasan: 'Seri 31-31 dengan B; A lebih tinggi di ranking Sesepuh (1 vs 2).',
});

/** Kandidat yang kalah karena aturan seri, walaupun unggul di WO. */
export const KALAH_KARENA_SERI = Object.freeze({
  kode: 'B',
  totalPoin: 31,
  rankingWo: 1,
});
