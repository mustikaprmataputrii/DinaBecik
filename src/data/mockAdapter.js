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

import { KRITERIA, BOBOT_AWAL } from '../shared/constants.js';
import { hitungWP } from '../shared/wp.js';
import { hitungBorda } from '../shared/borda.js';
import {
  ACARA_CONTOH,
  KANDIDAT_TABEL_71,
  KANDIDAT_UNTUK_WP,
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
  const { hasil, totalS } = hitungWP(KANDIDAT_UNTUK_WP, state.bobot[userId]);
  return { statusKirim: false, hasil, totalS, waktuKirim: null };
}

export async function kirimPenilaian(_acaraId, userId) {
  await jeda();
  if (state.terkirim[userId]) {
    throw new Error('Penilaian sudah dikirim dan terkunci. Tidak dapat diubah.');
  }
  const { hasil, totalS } = hitungWP(KANDIDAT_UNTUK_WP, state.bobot[userId]);
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
