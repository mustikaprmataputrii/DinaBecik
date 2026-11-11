/**
 * ============================================================================
 *  Dina Becik — WEIGHTED PRODUCT (WP)
 * ============================================================================
 *  Penilaian individual tiap decision maker.
 *  Acuan: Panduan Proyek bagian 6.2.
 *
 *  Rumus:
 *      Si = Π ( xij ^ pj )
 *      Vi = Si / Σ S
 *
 *  dengan pj = +wj untuk kriteria benefit, dan pj = -wj untuk kriteria cost.
 *  wj adalah bobot DM dalam bentuk desimal (jumlah = 1).
 *
 *  SAW DILARANG. Jangan mengganti fungsi ini dengan penjumlahan terbobot.
 * ============================================================================
 */

import { KRITERIA, URUTAN_KRITERIA, TOTAL_BOBOT_WAJIB, TOLERANSI_BOBOT, PRESISI_INTERNAL } from './constants.js';

/* ---------------------------------------------------------------------------
 * Validasi & normalisasi bobot
 * ------------------------------------------------------------------------- */

/**
 * Ubah bobot persen menjadi desimal, dan validasi totalnya 100%.
 *
 * @param {Object<string, number>} bobotPersen contoh: { weton: 40, biaya: 10, ... }
 * @returns {Object<string, number>} bobot desimal, jumlah = 1
 * @throws {Error} jika ada kriteria yang hilang atau total bukan 100%
 */
export function normalisasiBobot(bobotPersen) {
  const hasil = {};
  let total = 0;

  for (const key of URUTAN_KRITERIA) {
    const nilai = Number(bobotPersen?.[key]);
    if (!Number.isFinite(nilai) || nilai < 0) {
      throw new Error(`Bobot kriteria "${key}" tidak valid: ${bobotPersen?.[key]}`);
    }
    hasil[key] = nilai;
    total += nilai;
  }

  if (Math.abs(total - TOTAL_BOBOT_WAJIB) > TOLERANSI_BOBOT) {
    throw new Error(
      `Total bobot harus ${TOTAL_BOBOT_WAJIB}%, saat ini ${round(total, 2)}%. Simpan ditolak.`
    );
  }

  // konversi persen -> desimal
  for (const key of URUTAN_KRITERIA) {
    hasil[key] = hasil[key] / 100;
  }
  return hasil;
}

/**
 * Validasi bobot tanpa mengubah bentuk. Dipakai halaman "Atur Bobot".
 * @param {Object<string, number>} bobotPersen
 * @returns {{valid: boolean, total: number, pesan: string|null}}
 */
export function validasiBobot(bobotPersen) {
  let total = 0;
  for (const key of URUTAN_KRITERIA) {
    const nilai = Number(bobotPersen?.[key] ?? 0);
    if (!Number.isFinite(nilai) || nilai < 0) {
      return { valid: false, total, pesan: `Bobot kriteria "${key}" tidak valid.` };
    }
    total += nilai;
  }
  const bulat = round(total, 2);
  if (Math.abs(bulat - TOTAL_BOBOT_WAJIB) > TOLERANSI_BOBOT) {
    return {
      valid: false,
      total: bulat,
      pesan: `Total bobot ${bulat}%. Harus tepat ${TOTAL_BOBOT_WAJIB}%.`,
    };
  }
  return { valid: true, total: bulat, pesan: null };
}

/* ---------------------------------------------------------------------------
 * Inti: Weighted Product
 * ------------------------------------------------------------------------- */

/**
 * Ambil vektor nilai kriteria dari satu kandidat, sesuai urutan KRITERIA.
 * @param {object} kandidat
 * @returns {number[]}
 */
export function vektorNilai(kandidat) {
  return KRITERIA.map((k) => {
    const nilai = Number(kandidat?.[k.key]);
    if (!Number.isFinite(nilai) || nilai <= 0) {
      throw new Error(
        `Nilai kriteria "${k.key}" pada kandidat ${kandidat?.kode ?? '?'} tidak valid: ${kandidat?.[k.key]}. ` +
          'WP membutuhkan nilai > 0 karena memakai pangkat.'
      );
    }
    return nilai;
  });
}

/**
 * Hitung nilai preferensi S untuk satu kandidat.
 * @param {number[]} nilai vektor nilai kriteria
 * @param {number[]} bobotDesimal vektor bobot desimal
 * @param {string[]} tipe vektor tipe ('benefit'|'cost')
 * @returns {number}
 */
export function hitungS(nilai, bobotDesimal, tipe) {
  let s = 1;
  for (let j = 0; j < nilai.length; j++) {
    const pangkat = tipe[j] === 'cost' ? -bobotDesimal[j] : bobotDesimal[j];
    s *= Math.pow(nilai[j], pangkat);
  }
  return s;
}

/**
 * Hitung WP lengkap untuk satu decision maker.
 *
 * @param {Array<object>} kandidat daftar kandidat, tiap objek punya key kriteria
 *                              (weton, biaya, gedung, cuaca, tamu) + `kode`
 * @param {Object<string, number>} bobotPersen bobot DM dalam persen (total 100)
 * @returns {{hasil: Array<{kode: string, s: number, v: number, ranking: number}>,
 *            totalS: number}}
 */
export function hitungWP(kandidat, bobotPersen) {
  if (!Array.isArray(kandidat) || kandidat.length === 0) {
    throw new Error('Daftar kandidat kosong.');
  }

  const bobotDesimal = normalisasiBobot(bobotPersen);
  const bobotVektor = URUTAN_KRITERIA.map((k) => bobotDesimal[k]);
  const tipeVektor = KRITERIA.map((k) => k.tipe);

  // 1. hitung S tiap kandidat
  const baris = kandidat.map((k) => ({
    kode: k.kode,
    s: hitungS(vektorNilai(k), bobotVektor, tipeVektor),
  }));

  // 2. hitung V = S / ΣS
  const totalS = baris.reduce((acc, b) => acc + b.s, 0);
  if (totalS === 0) throw new Error('Total S bernilai 0, perhitungan tidak dapat dilanjutkan.');
  for (const b of baris) b.v = b.s / totalS;

  // 3. urutkan berdasarkan S menurun, lalu beri ranking
  const urut = [...baris].sort((a, b) => b.s - a.s);
  urut.forEach((b, i) => {
    b.ranking = i + 1;
  });

  return {
    hasil: urut.map((b) => ({
      kode: b.kode,
      s: b.s,
      v: b.v,
      ranking: b.ranking,
    })),
    totalS,
  };
}

/**
 * Hitung WP untuk KETIGA decision maker sekaligus.
 *
 * @param {Array<object>} kandidat
 * @param {Object<string, Object<string, number>>} bobotPerDm
 *        contoh: { sesepuh: {...}, orangtua: {...}, wo: {...} }
 * @returns {Object<string, {hasil: Array, totalS: number}>}
 */
export function hitungWPSemuaDM(kandidat, bobotPerDm) {
  const keluaran = {};
  for (const dm of Object.keys(bobotPerDm)) {
    keluaran[dm] = hitungWP(kandidat, bobotPerDm[dm]);
  }
  return keluaran;
}

/**
 * Ambil ranking per kandidat dari hasil WP, siap dipakai Weighted Borda.
 * @param {Array<{kode: string, ranking: number}>} hasilWP
 * @returns {Object<string, number>} contoh: { A: 3, B: 4, ... }
 */
export function rankingDariWP(hasilWP) {
  const peta = {};
  for (const h of hasilWP) peta[h.kode] = h.ranking;
  return peta;
}

/* ---------------------------------------------------------------------------
 * Utilitas
 * ------------------------------------------------------------------------- */

/** Pembulatan aman untuk perbandingan & tampilan. */
export function round(angka, desimal = PRESISI_INTERNAL) {
  const f = Math.pow(10, desimal);
  return Math.round((angka + Number.EPSILON) * f) / f;
}
