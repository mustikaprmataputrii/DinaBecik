/**
 * ============================================================================
 *  Dina Becik — MODUL WETON & NEPTU
 * ============================================================================
 *  Fungsi untuk menghitung weton (hari + pasaran) dan skor C1 dari tanggal.
 *  Acuan: Panduan Proyek bagian 6.1.
 *
 *  CATATAN PENTING (hasil verifikasi):
 *  Rumus skor C1 di panduan menulis "neptu hari-H", tetapi angka acuan pada
 *  Tabel 7.1 hanya dapat direproduksi jika yang dipakai adalah
 *  NEPTU WETON hari-H (neptu hari + neptu pasaran). Sudah diuji: memakai
 *  neptu hari saja membuat 4 dari 6 baris Tabel 7.1 salah.
 *  Karena itu field `neptuWetonH` yang dipakai, bukan `neptuHari`.
 * ============================================================================
 */

import {
  NEPTU_HARI,
  NEPTU_PASARAN,
  URUTAN_PASARAN,
  TANGGAL_ACUAN,
  skorWetonDariSisa,
} from './constants.js';

const HARI_NAMA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/* ---------------------------------------------------------------------------
 * Normalisasi & utilitas tanggal
 * ------------------------------------------------------------------------- */

/**
 * Ubah input tanggal menjadi objek Date pada tengah malam UTC.
 * Menerima: string 'YYYY-MM-DD', objek Date, atau timestamp number.
 * Memakai UTC agar tidak bergeser oleh zona waktu lokal.
 * @param {string|Date|number} tanggal
 * @returns {Date}
 */
export function toUTCDate(tanggal) {
  if (tanggal instanceof Date) {
    return new Date(Date.UTC(tanggal.getUTCFullYear(), tanggal.getUTCMonth(), tanggal.getUTCDate()));
  }
  if (typeof tanggal === 'number') {
    const d = new Date(tanggal);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
  if (typeof tanggal === 'string') {
    const cocok = tanggal.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!cocok) throw new Error(`Format tanggal tidak dikenal: ${tanggal}. Gunakan YYYY-MM-DD.`);
    const [, y, m, d] = cocok;
    return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  }
  throw new Error('Tanggal harus berupa string YYYY-MM-DD, Date, atau timestamp.');
}

/** Selisih hari antara dua tanggal (UTC). */
export function selisihHari(tanggal, acuan = TANGGAL_ACUAN.tanggal) {
  const a = toUTCDate(tanggal).getTime();
  const b = toUTCDate(acuan).getTime();
  return Math.round((a - b) / MS_PER_DAY);
}

/* ---------------------------------------------------------------------------
 * Inti: weton
 * ------------------------------------------------------------------------- */

/**
 * Hitung weton (hari + pasaran) dari sebuah tanggal.
 *
 * Cara mencari pasaran (Panduan 6.1):
 *   1. Hitung selisih hari antara tanggal acara dan 1 Januari 1970.
 *   2. Ambil sisa bagi 5.
 *   3. Sisa 0=Wage, 1=Kliwon, 2=Legi, 3=Pahing, 4=Pon.
 *
 * @param {string|Date|number} tanggal
 * @returns {{tanggal: string, hari: string, pasaran: string, neptuHari: number,
 *            neptuPasaran: number, neptuWeton: number}}
 */
export function hitungWeton(tanggal) {
  const d = toUTCDate(tanggal);

  const hari = HARI_NAMA[d.getUTCDay()];
  const sisa = ((selisihHari(d) % 5) + 5) % 5; // selalu positif
  const pasaran = URUTAN_PASARAN[sisa];

  const neptuHari = NEPTU_HARI[hari];
  const neptuPasaran = NEPTU_PASARAN[pasaran];

  return {
    tanggal: d.toISOString().slice(0, 10),
    hari,
    pasaran,
    neptuHari,
    neptuPasaran,
    neptuWeton: neptuHari + neptuPasaran,
  };
}

/**
 * Hitung sisa bagi 5 untuk kriteria C1.
 *   sisa = (neptu_pria + neptu_wanita + neptu_weton_hari_H) mod 5
 *
 * @param {number} neptuPria   neptu weton mempelai pria
 * @param {number} neptuWanita neptu weton mempelai wanita
 * @param {number} neptuWetonH neptu weton tanggal hajatan (hari + pasaran)
 * @returns {number} sisa 0..4
 */
export function hitungSisaWeton(neptuPria, neptuWanita, neptuWetonH) {
  const total = Number(neptuPria) + Number(neptuWanita) + Number(neptuWetonH);
  if (!Number.isFinite(total)) throw new Error('Neptu harus berupa angka.');
  return ((total % 5) + 5) % 5;
}

/**
 * Hitung skor kriteria C1 (1-5) untuk satu tanggal kandidat.
 *
 * @param {string|Date|number} tanggal
 * @param {number} neptuPria
 * @param {number} neptuWanita
 * @returns {{hari: string, pasaran: string, neptuWeton: number, sisa: number, skor: number}}
 */
export function hitungSkorWeton(tanggal, neptuPria, neptuWanita) {
  const w = hitungWeton(tanggal);
  const sisa = hitungSisaWeton(neptuPria, neptuWanita, w.neptuWeton);
  return {
    hari: w.hari,
    pasaran: w.pasaran,
    neptuWeton: w.neptuWeton,
    sisa,
    skor: skorWetonDariSisa(sisa),
  };
}

/**
 * Lengkapi satu objek kandidat dengan hasil hitung weton.
 * Dipakai saat membuat/mengubah kandidat: skor C1 tidak pernah diinput manual.
 *
 * @param {object} kandidat objek kandidat (harus punya `tanggal`)
 * @param {number} neptuPria
 * @param {number} neptuWanita
 * @returns {object} salinan kandidat + hari, pasaran, neptuWetonH, sisaWeton, skorWeton
 */
export function lengkapiKandidatWeton(kandidat, neptuPria, neptuWanita) {
  const hasil = hitungSkorWeton(kandidat.tanggal, neptuPria, neptuWanita);
  return {
    ...kandidat,
    hari: hasil.hari,
    pasaran: hasil.pasaran,
    neptuWetonH: hasil.neptuWeton,
    sisaWeton: hasil.sisa,
    skorWeton: hasil.skor,
  };
}

/** Label tampilan, contoh: "Sabtu Legi". */
export function labelWeton(tanggal) {
  const w = hitungWeton(tanggal);
  return `${w.hari} ${w.pasaran}`;
}
