/**
 * ============================================================================
 *  Dina Becik — MOCK ADAPTER
 * ============================================================================
 *  Adapter sementara: membaca data dari fixture (Tabel 7.1/7.2/7.3).
 *  Dipakai frontend SEBELUM Firestore siap.
 *
 *  Semua fungsi async, meniru perilaku Firestore (latensi kecil disimulasikan).
 *  Saat backend siap: ganti import di src/data/index.js dari mockAdapter ke
 *  firebaseAdapter. Komponen tidak perlu diubah.
 * ============================================================================
 */

import { KRITERIA, BOBOT_AWAL, STATUS_ACARA } from '../shared/constants.js';
import { hitungWP } from '../shared/wp.js';
import { hitungBorda } from '../shared/borda.js';
import { lengkapiKandidatWeton } from '../shared/weton.js';
import {
  ACARA_CONTOH,
  KANDIDAT_TABEL_71,
} from '../fixtures/dataAcuan.js';

/* ---------------------------------------------------------------------------
 *  State lokal (in-memory). Hilang saat halaman di-refresh — memang begitu.
 *  Ini hanya untuk mengembangkan tampilan.
 * ------------------------------------------------------------------------- */

const state = {
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

const jeda = () => new Promise((r) => setTimeout(r, 30));

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

function batalkanPenilaian() {
  state.terkirim = { sesepuh: false, orangtua: false, wo: false };
  state.penilaian = {};
  state.hasilVoting = null;
  state.acara.status = state.kandidat.length ? STATUS_ACARA.PENILAIAN : STATUS_ACARA.DRAFT;
}

function validasiKandidat(baris, kodeKecuali = null) {
  if (!baris?.tanggal || Number.isNaN(new Date(`${baris.tanggal}T00:00:00`).getTime())) {
    throw new Error('Tanggal kandidat tidak valid.');
  }
  if (state.kandidat.some((item) => item.tanggal === baris.tanggal && item.kode !== kodeKecuali)) {
    throw new Error('Tanggal kandidat sudah digunakan.');
  }
  if (!Number.isFinite(Number(baris.biaya)) || Number(baris.biaya) <= 0) {
    throw new Error('Biaya harus berupa angka lebih besar dari 0.');
  }
  for (const key of ['gedung', 'cuaca', 'tamu']) {
    const value = Number(baris[key]);
    if (!Number.isFinite(value) || value < 1 || value > 5) throw new Error(`Nilai ${key} harus antara 1 dan 5.`);
  }
}

function kodeBerikut() {
  const existing = new Set(state.kandidat.map((item) => item.kode));
  return [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find((code) => !existing.has(code)) ?? `K${state.kandidat.length + 1}`;
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

export async function simpanAcara(_acaraId, patch) {
  await jeda();
  const next = { ...state.acara, ...patch };
  if (!String(next.nama_acara ?? '').trim()) throw new Error('Nama acara wajib diisi.');
  for (const key of ['neptu_pria', 'neptu_wanita']) {
    if (!Number.isFinite(Number(next[key])) || Number(next[key]) <= 0) throw new Error('Neptu mempelai harus berupa angka lebih besar dari 0.');
  }
  state.acara = { ...next, neptu_pria: Number(next.neptu_pria), neptu_wanita: Number(next.neptu_wanita) };
  state.kandidat = state.kandidat.map((item) => lengkapiKandidatWeton({
    kode: item.kode, tanggal: item.tanggal, biaya: item.biaya,
    gedung: item.gedung, cuaca: item.cuaca, tamu: item.tamu,
  }, state.acara.neptu_pria, state.acara.neptu_wanita));
  batalkanPenilaian();
  return { ...state.acara };
}

export async function tambahKandidat(_acaraId, baris) {
  await jeda();
  validasiKandidat(baris);
  const kandidat = lengkapiKandidatWeton({
    kode: kodeBerikut(), tanggal: baris.tanggal, biaya: Number(baris.biaya),
    gedung: Number(baris.gedung), cuaca: Number(baris.cuaca), tamu: Number(baris.tamu),
  }, state.acara.neptu_pria, state.acara.neptu_wanita);
  state.kandidat.push(kandidat);
  state.kandidat.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  batalkanPenilaian();
  return { ...kandidat };
}

export async function ubahKandidat(_acaraId, kode, patch) {
  await jeda();
  const index = state.kandidat.findIndex((item) => item.kode === kode);
  if (index < 0) throw new Error(`Kandidat ${kode} tidak ditemukan.`);
  const next = { ...state.kandidat[index], ...patch, kode };
  validasiKandidat(next, kode);
  const kandidat = lengkapiKandidatWeton({
    kode, tanggal: next.tanggal, biaya: Number(next.biaya),
    gedung: Number(next.gedung), cuaca: Number(next.cuaca), tamu: Number(next.tamu),
  }, state.acara.neptu_pria, state.acara.neptu_wanita);
  state.kandidat[index] = kandidat;
  state.kandidat.sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  batalkanPenilaian();
  return { ...kandidat };
}

export async function hapusKandidat(_acaraId, kode) {
  await jeda();
  if (state.kandidat.length <= 2) throw new Error('Minimal dua kandidat harus tersedia.');
  const next = state.kandidat.filter((item) => item.kode !== kode);
  if (next.length === state.kandidat.length) throw new Error(`Kandidat ${kode} tidak ditemukan.`);
  state.kandidat = next;
  batalkanPenilaian();
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
}

/* ---------------------------------------------------------------------------
 *  Penilaian individual (WP)
 * ------------------------------------------------------------------------- */

export async function getPenilaianDm(_acaraId, userId) {
  await jeda();
  if (state.terkirim[userId] && state.penilaian[userId]) {
    return { statusKirim: true, ...state.penilaian[userId] };
  }
  // Belum dikirim: hitung pratinjau dari bobot saat ini (tidak disimpan)
  const { hasil, totalS } = hitungWP(kandidatWP(), state.bobot[userId]);
  return { statusKirim: false, hasil, totalS, waktuKirim: null };
}

export async function kirimPenilaian(_acaraId, userId) {
  await jeda();
  if (state.terkirim[userId]) {
    throw new Error('Penilaian sudah dikirim dan terkunci. Tidak dapat diubah.');
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
    state.acara.status = 'Selesai';
  } else {
    state.acara.status = 'Penilaian';
  }
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
}

/* ---------------------------------------------------------------------------
 *  Riwayat acara (fitur plus)
 * ------------------------------------------------------------------------- */

export async function getRiwayatAcara() {
  await jeda();
  return state.acara.status === 'Selesai' ? [{ ...state.acara }] : [];
}

/* ---------------------------------------------------------------------------
 *  Utilitas pengembangan: reset state (dipakai tombol "Reset Demo")
 * ------------------------------------------------------------------------- */

export async function resetDemo() {
  await jeda();
  state.acara = { ...ACARA_CONTOH };
  state.kandidat = KANDIDAT_TABEL_71.map((k) => ({ ...k }));
  state.bobot = {
    sesepuh: { ...BOBOT_AWAL.sesepuh },
    orangtua: { ...BOBOT_AWAL.orangtua },
    wo: { ...BOBOT_AWAL.wo },
  };
  state.terkirim = { sesepuh: false, orangtua: false, wo: false };
  state.penilaian = {};
  state.hasilVoting = null;
  state.komentar = [];
}
