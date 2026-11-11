/**
 * ============================================================================
 *  Dina Becik — DATA ACUAN (FIXTURE)
 * ============================================================================
 *  Sumber: Panduan Proyek Dina Becik, Tabel 7.1 (bagian 7).
 *  Data dummy dengan tanggal dan weton ASLI kalender tahun 2027.
 *
 *  File ini dipakai oleh:
 *    - unit test (mengunci angka Tabel 7.2 & 7.3)
 *    - frontend sebagai data tiruan sebelum Firestore tersambung
 *
 *  JANGAN mengubah nilai di sini. Jika berubah, test akan gagal.
 * ============================================================================
 */

import { BOBOT_AWAL } from '../shared/constants.js';

/** Identitas acara contoh. */
export const ACARA_CONTOH = Object.freeze({
  id: 'acara-demo-2027',
  nama_acara: 'Hajatan Pernikahan Dina Becik',
  jenis: 'pernikahan',
  neptu_pria: 15, // Kamis Pon  (8 + 7)
  neptu_wanita: 9, // Senin Legi  (4 + 5)
  status: 'Penilaian',
  dibuat_oleh: 'sesepuh',
});

/**
 * Data kandidat Tabel 7.1.
 * `weton` dan `neptuWetonH` akan diverifikasi oleh unit test terhadap
 * fungsi hitungWeton() — jadi tidak boleh dikarang.
 */
export const KANDIDAT_TABEL_71 = Object.freeze([
  { kode: 'A', tanggal: '2027-06-12', hari: 'Sabtu', pasaran: 'Kliwon', neptuWetonH: 17, skorWeton: 4, biaya: 38, gedung: 4, cuaca: 4, tamu: 5 },
  { kode: 'B', tanggal: '2027-06-20', hari: 'Minggu', pasaran: 'Pon', neptuWetonH: 12, skorWeton: 4, biaya: 35, gedung: 3, cuaca: 4, tamu: 4 },
  { kode: 'C', tanggal: '2027-07-10', hari: 'Sabtu', pasaran: 'Pon', neptuWetonH: 16, skorWeton: 1, biaya: 42, gedung: 5, cuaca: 5, tamu: 5 },
  { kode: 'D', tanggal: '2027-07-23', hari: 'Jumat', pasaran: 'Legi', neptuWetonH: 11, skorWeton: 1, biaya: 30, gedung: 2, cuaca: 5, tamu: 3 },
  { kode: 'E', tanggal: '2027-08-07', hari: 'Sabtu', pasaran: 'Legi', neptuWetonH: 14, skorWeton: 5, biaya: 40, gedung: 4, cuaca: 5, tamu: 5 },
  { kode: 'F', tanggal: '2027-08-21', hari: 'Sabtu', pasaran: 'Kliwon', neptuWetonH: 17, skorWeton: 4, biaya: 44, gedung: 5, cuaca: 5, tamu: 4 },
]);

/** Kandidat dalam bentuk yang dipakai hitungWP(): key = key kriteria. */
export const KANDIDAT_UNTUK_WP = Object.freeze(
  KANDIDAT_TABEL_71.map((k) => ({
    kode: k.kode,
    weton: k.skorWeton,
    biaya: k.biaya,
    gedung: k.gedung,
    cuaca: k.cuaca,
    tamu: k.tamu,
  }))
);

/** Bobot bawaan ketiga DM (persen), dari Panduan bagian 5. */
export const BOBOT_DEMO = BOBOT_AWAL;

/* ---------------------------------------------------------------------------
 *  ANGKA ACUAN — Tabel 7.2
 *  Hasil WP tiap decision maker (S dan ranking).
 *  Test WAJIB mencocokkan sampai 4 desimal.
 * ------------------------------------------------------------------------- */

export const ACUAN_TABEL_72 = Object.freeze({
  sesepuh: Object.freeze({
    A: { s: 2.5308, ranking: 3 },
    B: { s: 2.3373, ranking: 4 },
    C: { s: 1.5387, ranking: 5 },
    D: { s: 1.2523, ranking: 6 },
    E: { s: 2.8466, ranking: 1 },
    F: { s: 2.5502, ranking: 2 },
  }),
  orangtua: Object.freeze({
    A: { s: 0.7289, ranking: 2 },
    B: { s: 0.6795, ranking: 4 },
    C: { s: 0.6044, ranking: 5 },
    D: { s: 0.5216, ranking: 6 },
    E: { s: 0.757, ranking: 1 },
    F: { s: 0.6924, ranking: 3 },
  }),
  wo: Object.freeze({
    A: { s: 1.5144, ranking: 3 },
    B: { s: 1.3462, ranking: 5 },
    C: { s: 1.4609, ranking: 4 },
    D: { s: 1.0503, ranking: 6 },
    E: { s: 1.6027, ranking: 2 },
    F: { s: 1.6079, ranking: 1 },
  }),
});

/* ---------------------------------------------------------------------------
 *  ANGKA ACUAN — Tabel 7.3
 *  Konsensus Weighted Borda (n = 6).
 * ------------------------------------------------------------------------- */

export const ACUAN_TABEL_73 = Object.freeze([
  { kode: 'E', tanggal: '2027-08-07', sesepuh: { ranking: 1, poin: 18 }, orangtua: { ranking: 1, poin: 12 }, wo: { ranking: 2, poin: 5 }, totalPoin: 35, rankingFinal: 1 },
  { kode: 'F', tanggal: '2027-08-21', sesepuh: { ranking: 2, poin: 15 }, orangtua: { ranking: 3, poin: 8 }, wo: { ranking: 1, poin: 6 }, totalPoin: 29, rankingFinal: 2 },
  { kode: 'A', tanggal: '2027-06-12', sesepuh: { ranking: 3, poin: 12 }, orangtua: { ranking: 2, poin: 10 }, wo: { ranking: 3, poin: 4 }, totalPoin: 26, rankingFinal: 3 },
  { kode: 'B', tanggal: '2027-06-20', sesepuh: { ranking: 4, poin: 9 }, orangtua: { ranking: 4, poin: 6 }, wo: { ranking: 5, poin: 2 }, totalPoin: 17, rankingFinal: 4 },
  { kode: 'C', tanggal: '2027-07-10', sesepuh: { ranking: 5, poin: 6 }, orangtua: { ranking: 5, poin: 4 }, wo: { ranking: 4, poin: 3 }, totalPoin: 13, rankingFinal: 5 },
  { kode: 'D', tanggal: '2027-07-23', sesepuh: { ranking: 6, poin: 3 }, orangtua: { ranking: 6, poin: 2 }, wo: { ranking: 6, poin: 1 }, totalPoin: 6, rankingFinal: 6 },
]);

/** Pemenang menurut panduan. */
export const PEMENANG_ACUAN = Object.freeze({
  kode: 'E',
  tanggal: '2027-08-07',
  label: 'Sabtu Legi',
  totalPoin: 35,
  biaya: 40,
});

/** Ranking per DM siap pakai untuk hitungBorda(). */
export const RANKING_PER_DM_ACUAN = Object.freeze({
  sesepuh: Object.freeze({ A: 3, B: 4, C: 5, D: 6, E: 1, F: 2 }),
  orangtua: Object.freeze({ A: 2, B: 4, C: 5, D: 6, E: 1, F: 3 }),
  wo: Object.freeze({ A: 3, B: 5, C: 4, D: 6, E: 2, F: 1 }),
});
