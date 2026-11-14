/**
 * ============================================================================
 *  Dina Becik — MOCK ADAPTER
 * ============================================================================
 *  Adapter sementara: data disimpan di localStorage peramban, dengan data
 *  contoh Tabel 7.1 sebagai isi awal.
 *
 *  Semua fungsi async, meniru perilaku Firestore (latensi kecil disimulasikan).
 *  Saat backend siap: ganti import di src/data/index.js dari mockAdapter ke
 *  firebaseAdapter. Komponen tidak perlu diubah.
 *
 *  PENTING — soal data contoh:
 *  Fixture Tabel 7.1 TIDAK dipakai sebagai "kebenaran mutlak". Fixture hanya
 *  menjadi ISI AWAL. Setelah pengguna mengubah data lewat halaman Kelola Data,
 *  yang dipakai adalah data pengguna, dan data itu bertahan setelah refresh.
 *  Fixture tetap dikunci 50 unit test supaya angka Tabel 7.2/7.3 di laporan
 *  dapat dibuktikan ulang kapan saja.
 * ============================================================================
 */

import { KRITERIA, BOBOT_AWAL, STATUS_ACARA } from '../shared/constants.js';
import { hitungWP } from '../shared/wp.js';
import { hitungBorda } from '../shared/borda.js';
import { lengkapiKandidatWeton } from '../shared/weton.js';
import { ACARA_CONTOH, KANDIDAT_TABEL_71 } from '../fixtures/dataAcuan.js';

/* ---------------------------------------------------------------------------
 *  State awal + penyimpanan
 * ------------------------------------------------------------------------- */

const KUNCI_SIMPAN = 'dina-becik-data';

/** Bentuk state kosong/bawaan. */
function dataBawaan() {
  return {
    acara: { ...ACARA_CONTOH },
    kandidat: KANDIDAT_TABEL_71.map((k) => ({ ...k })),
    bobot: {
      sesepuh: { ...BOBOT_AWAL.sesepuh },
      orangtua: { ...BOBOT_AWAL.orangtua },
      wo: { ...BOBOT_AWAL.wo },
    },
    terkirim: { sesepuh: false, orangtua: false, wo: false },
    penilaian: {}, // { [dm]: { hasil: [...], waktuKirim } }
    hasilVoting: null,
    komentar: [],
  };
}

/**
 * Baca state dari localStorage. Bila belum ada / rusak, pakai data contoh.
 * Field yang belum ada di data lama dilengkapi dari bawaan agar tidak error.
 */
function muatState() {
  const dasar = dataBawaan();
  try {
    const mentah = localStorage.getItem(KUNCI_SIMPAN);
    if (!mentah) return dasar;
    const simpan = JSON.parse(mentah);
    return {
      ...dasar,
      ...simpan,
      acara: { ...dasar.acara, ...(simpan.acara ?? {}) },
      bobot: { ...dasar.bobot, ...(simpan.bobot ?? {}) },
      terkirim: { ...dasar.terkirim, ...(simpan.terkirim ?? {}) },
      kandidat: Array.isArray(simpan.kandidat) ? simpan.kandidat : dasar.kandidat,
    };
  } catch {
    return dasar;
  }
}

const state = muatState();

/** Simpan state ke localStorage. Gagal menyimpan tidak boleh merusak aplikasi. */
function simpanState() {
  try {
    localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(state));
  } catch {
    /* mode privat / kuota penuh — aplikasi tetap jalan di memori */
  }
}

const jeda = () => new Promise((r) => setTimeout(r, 30));

/* ---------------------------------------------------------------------------
 *  Utilitas internal
 * ------------------------------------------------------------------------- */

/**
 * Kandidat dalam bentuk yang dipakai hitungWP():
 * key = key kriteria (weton, biaya, gedung, cuaca, tamu).
 * Skor weton dipetakan dari `skorWeton` milik baris Tabel 7.1.
 */
function kandidatWP() {
  return state.kandidat.map((k) => ({
    kode: k.kode,
    weton: k.skorWeton,
    biaya: k.biaya,
    gedung: k.gedung,
    cuaca: k.cuaca,
    tamu: k.tamu,
  }));
}

/** Kode kandidat berikutnya yang belum terpakai: A, B, C, ... */
function kodeBerikut() {
  const dipakai = new Set(state.kandidat.map((k) => k.kode));
  for (const huruf of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    if (!dipakai.has(huruf)) return huruf;
  }
  return `K${state.kandidat.length + 1}`;
}

/**
 * Data acara / kandidat berubah berarti hasil WP dan Borda lama tidak sah.
 * Semua penilaian dibatalkan supaya tidak ada angka lama yang tertinggal.
 */
function batalkanPenilaian() {
  state.terkirim = { sesepuh: false, orangtua: false, wo: false };
  state.penilaian = {};
  state.hasilVoting = null;
  state.acara.status =
    state.kandidat.length === 0 ? STATUS_ACARA.DRAFT : STATUS_ACARA.PENILAIAN;
}

/** Validasi satu baris kandidat. Melempar Error dengan pesan yang jelas. */
function periksaKandidat(baris, kodeDikecualikan = null) {
  if (!baris.tanggal) throw new Error('Tanggal kandidat wajib diisi.');
  if (Number.isNaN(new Date(`${baris.tanggal}T00:00:00`).getTime())) {
    throw new Error('Tanggal kandidat tidak valid.');
  }
  const kembar = state.kandidat.find(
    (k) => k.tanggal === baris.tanggal && k.kode !== kodeDikecualikan
  );
  if (kembar) {
    throw new Error(`Tanggal itu sudah dipakai kandidat ${kembar.kode}. Pilih tanggal lain.`);
  }
  if (!Number.isFinite(Number(baris.biaya)) || Number(baris.biaya) <= 0) {
    throw new Error('Biaya harus berupa angka lebih besar dari 0 (dalam juta rupiah).');
  }
  for (const key of ['gedung', 'cuaca', 'tamu']) {
    const n = Number(baris[key]);
    if (!Number.isFinite(n) || n < 1 || n > 5) {
      throw new Error(`Nilai "${key}" harus 1 sampai 5.`);
    }
  }
}

/* ---------------------------------------------------------------------------
 *  Acara & kandidat
 * ------------------------------------------------------------------------- */

export async function getAcara() {
  await jeda();
  return { ...state.acara };
}

export async function getKandidat() {
  await jeda();
  return state.kandidat.map((k) => ({ ...k }));
}

export async function getKriteria() {
  await jeda();
  return KRITERIA.map((k) => ({ ...k }));
}

/**
 * Simpan identitas acara. `patch` boleh sebagian, misalnya hanya neptu.
 * @param {string} _acaraId
 * @param {object} patch { nama_acara?, jenis?, neptu_pria?, neptu_wanita? }
 */
export async function simpanAcara(_acaraId, patch) {
  await jeda();
  const gabung = { ...state.acara, ...patch };
  if (!String(gabung.nama_acara ?? '').trim()) {
    throw new Error('Nama acara wajib diisi.');
  }
  for (const key of ['neptu_pria', 'neptu_wanita']) {
    const n = Number(gabung[key]);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error('Neptu mempelai harus berupa angka lebih besar dari 0.');
    }
  }
  state.acara = gabung;

  // Neptu berubah -> skor weton semua kandidat harus dihitung ulang.
  state.kandidat = state.kandidat.map((k) =>
    lengkapiKandidatWeton(
      { kode: k.kode, tanggal: k.tanggal, biaya: k.biaya, gedung: k.gedung, cuaca: k.cuaca, tamu: k.tamu },
      state.acara.neptu_pria,
      state.acara.neptu_wanita
    )
  );
  batalkanPenilaian();
  simpanState();
  return { ...state.acara };
}

/**
 * Tambah kandidat tanggal. Skor weton (C1) TIDAK diinput — dihitung dari
 * tanggal + neptu mempelai lewat lengkapiKandidatWeton().
 */
export async function tambahKandidat(_acaraId, baris) {
  await jeda();
  periksaKandidat(baris);
  const lengkap = lengkapiKandidatWeton(
    {
      kode: kodeBerikut(),
      tanggal: baris.tanggal,
      biaya: Number(baris.biaya),
      gedung: Number(baris.gedung),
      cuaca: Number(baris.cuaca),
      tamu: Number(baris.tamu),
    },
    state.acara.neptu_pria,
    state.acara.neptu_wanita
  );
  state.kandidat.push(lengkap);
  state.kandidat.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  batalkanPenilaian();
  simpanState();
  return { ...lengkap };
}

/** Ubah satu kandidat. Kode kandidat tidak berubah. */
export async function ubahKandidat(_acaraId, kode, patch) {
  await jeda();
  const indeks = state.kandidat.findIndex((k) => k.kode === kode);
  if (indeks < 0) throw new Error(`Kandidat ${kode} tidak ditemukan.`);

  const gabung = { ...state.kandidat[indeks], ...patch };
  periksaKandidat(gabung, kode);

  const lengkap = lengkapiKandidatWeton(
    {
      kode,
      tanggal: gabung.tanggal,
      biaya: Number(gabung.biaya),
      gedung: Number(gabung.gedung),
      cuaca: Number(gabung.cuaca),
      tamu: Number(gabung.tamu),
    },
    state.acara.neptu_pria,
    state.acara.neptu_wanita
  );
  state.kandidat[indeks] = lengkap;
  state.kandidat.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  batalkanPenilaian();
  simpanState();
  return { ...lengkap };
}

/** Hapus kandidat. Minimal 2 kandidat harus tersisa agar WP bermakna. */
export async function hapusKandidat(_acaraId, kode) {
  await jeda();
  if (state.kandidat.length <= 2) {
    throw new Error('Minimal 2 kandidat harus ada. Tambah kandidat lain sebelum menghapus.');
  }
  const sisa = state.kandidat.filter((k) => k.kode !== kode);
  if (sisa.length === state.kandidat.length) {
    throw new Error(`Kandidat ${kode} tidak ditemukan.`);
  }
  state.kandidat = sisa;
  batalkanPenilaian();
  simpanState();
}

/* ---------------------------------------------------------------------------
 *  Bobot per DM
 * ------------------------------------------------------------------------- */

export async function getBobotDm(_acaraId, userId) {
  await jeda();
  return { ...state.bobot[userId] };
}

export async function simpanBobotDm(_acaraId, userId, bobot) {
  await jeda();
  state.bobot[userId] = { ...bobot };
  // Bobot berubah -> penilaian DM itu harus dihitung ulang & dikirim ulang.
  state.terkirim[userId] = false;
  delete state.penilaian[userId];
  state.hasilVoting = null;
  if (state.acara.status === STATUS_ACARA.SELESAI) {
    state.acara.status = STATUS_ACARA.PENILAIAN;
  }
  simpanState();
}

/* ---------------------------------------------------------------------------
 *  Penilaian individual (WP)
 * ------------------------------------------------------------------------- */

export async function getPenilaianDm(_acaraId, userId) {
  await jeda();
  if (state.terkirim[userId] && state.penilaian[userId]) {
    return { statusKirim: true, ...state.penilaian[userId] };
  }
  // Belum dikirim: hitung pratinjau dari bobot & kandidat saat ini (tidak disimpan)
  const { hasil, totalS } = hitungWP(kandidatWP(), state.bobot[userId]);
  return { statusKirim: false, hasil, totalS, waktuKirim: null };
}

export async function kirimPenilaian(_acaraId, userId) {
  await jeda();
  if (state.terkirim[userId]) {
    throw new Error('Penilaian sudah dikirim dan terkunci. Tidak dapat diubah.');
  }
  if (state.kandidat.length === 0) {
    throw new Error('Belum ada kandidat. Isi data acara lebih dulu.');
  }
  const { hasil, totalS } = hitungWP(kandidatWP(), state.bobot[userId]);
  state.penilaian[userId] = { hasil, totalS, waktuKirim: new Date().toISOString() };
  state.terkirim[userId] = true;

  // Jika ketiga DM sudah kirim -> hitung konsensus sekali & simpan
  if (Object.values(state.terkirim).every(Boolean)) {
    const ranking = {
      sesepuh: Object.fromEntries(state.penilaian.sesepuh.hasil.map((h) => [h.kode, h.ranking])),
      orangtua: Object.fromEntries(state.penilaian.orangtua.hasil.map((h) => [h.kode, h.ranking])),
      wo: Object.fromEntries(state.penilaian.wo.hasil.map((h) => [h.kode, h.ranking])),
    };
    state.hasilVoting = hitungBorda(ranking);
    state.acara.status = STATUS_ACARA.SELESAI;
  } else {
    state.acara.status = STATUS_ACARA.PENILAIAN;
  }
  simpanState();
  return state.penilaian[userId];
}

export async function getStatusSemuaDm() {
  await jeda();
  return { ...state.terkirim };
}

export async function mulaiPenilaian() {
  await jeda();
  if (state.acara.status !== STATUS_ACARA.DRAFT) throw new Error('Acara bukan berstatus Draft.');
  if (state.kandidat.length < 2) throw new Error('Minimal dua kandidat diperlukan.');
  state.acara.status = STATUS_ACARA.PENILAIAN;
  simpanState();
  return { status: STATUS_ACARA.PENILAIAN };
}

/* ---------------------------------------------------------------------------
 *  Hasil konsensus
 * ------------------------------------------------------------------------- */

export async function getHasilVoting() {
  await jeda();
  return state.hasilVoting;
}

export async function simpanHasilVoting(_acaraId, hasil) {
  await jeda();
  state.hasilVoting = hasil;
  simpanState();
}

/* ---------------------------------------------------------------------------
 *  Komentar DM (fitur plus)
 * ------------------------------------------------------------------------- */

export async function getKomentar() {
  await jeda();
  return state.komentar.map((k) => ({ ...k }));
}

export async function simpanKomentar(_acaraId, userId, isi) {
  await jeda();
  state.komentar.push({
    id: `k${state.komentar.length + 1}`,
    user_id: userId,
    isi,
    waktu: new Date().toISOString(),
  });
  simpanState();
}

/* ---------------------------------------------------------------------------
 *  Riwayat acara (fitur plus)
 * ------------------------------------------------------------------------- */

export async function getRiwayatAcara() {
  await jeda();
  return state.acara.status === STATUS_ACARA.SELESAI ? [{ ...state.acara }] : [];
}

/* ---------------------------------------------------------------------------
 *  Utilitas pengembangan: kembalikan ke data contoh Tabel 7.1
 * ------------------------------------------------------------------------- */

export async function resetDemo() {
  await jeda();
  const dasar = dataBawaan();
  state.acara = dasar.acara;
  state.kandidat = dasar.kandidat;
  state.bobot = dasar.bobot;
  state.terkirim = dasar.terkirim;
  state.penilaian = dasar.penilaian;
  state.hasilVoting = dasar.hasilVoting;
  state.komentar = dasar.komentar;
  simpanState();
}
