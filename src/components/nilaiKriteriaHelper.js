/**
 * ============================================================================
 *  Dina Becik — Helper Nilai Kriteria per DM & Biaya C2 WO (Frontend Bridge)
 * ============================================================================
 *  PEMILIK FILE: Sri (Frontend & Desain)
 *
 *  Jembatan kompatibilitas di sisi frontend untuk revisi pasca-presentasi:
 *    - Identitas hajatan & daftar kandidat tanggal: khusus Sesepuh (sinkron)
 *    - Biaya gedung + katering (C2): khusus Wedding Organizer (sinkron)
 *    - Tingkat nilai C1, C3, C4, C5: terpisah per DM (weton otomatis tetap
 *      menjadi acuan/nilai awal C1, namun tiap DM boleh menyesuaikannya)
 *
 *  Komponen TIDAK mengakses Firestore langsung. Helper ini selalu lewat
 *  `src/data/index.js`:
 *    - Begitu Backend (@aliajuly) menambahkan `getNilaiDm`, `simpanNilaiDm`,
 *      dan `simpanBiayaKandidat` pada adapter, helper ini otomatis memakainya.
 *    - Sebelum PR Backend digabung, mode demo memakai fallback `localStorage`
 *      agar seluruh alur UI tetap bisa diuji, sementara mode Firebase memberi
 *      pesan yang jujur (tidak gagal diam-diam).
 * ============================================================================
 */

import adapter, {
  MENGGUNAKAN_FIREBASE,
  tambahKandidat,
  ubahKandidat,
} from '../data/index.js';

const KUNCI_NILAI_DM = 'dina-becik-nilai-dm-v1';
const KUNCI_BIAYA_PENDING = 'dina-becik-biaya-pending-v1';

const fnGetNilaiDm = typeof adapter?.['getNilaiDm'] === 'function' ? adapter['getNilaiDm'] : null;
const fnSimpanNilaiDm =
  typeof adapter?.['simpanNilaiDm'] === 'function' ? adapter['simpanNilaiDm'] : null;
const fnSimpanBiayaKandidat =
  typeof adapter?.['simpanBiayaKandidat'] === 'function' ? adapter['simpanBiayaKandidat'] : null;

/** Apakah adapter backend sudah menyediakan API nilai C1/C3/C4/C5 per DM? */
export const BACKEND_NILAI_DM_SIAP = Boolean(fnGetNilaiDm && fnSimpanNilaiDm);

/** Apakah adapter backend sudah menyediakan API biaya C2 khusus WO? */
export const BACKEND_BIAYA_WO_SIAP = Boolean(fnSimpanBiayaKandidat);

function bacaJsonLokal(kunci) {
  try {
    if (typeof localStorage === 'undefined') return {};
    const mentah = localStorage.getItem(kunci);
    return mentah ? JSON.parse(mentah) : {};
  } catch {
    return {};
  }
}

function tulisJsonLokal(kunci, objek) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(kunci, JSON.stringify(objek));
  } catch {
    /* mode privat / kuota penuh */
  }
}

/** Nilai acuan awal C1, C3, C4, C5 dari satu objek kandidat. */
export function nilaiAcuanDariKandidat(k) {
  return {
    weton: Number(k?.skorWeton ?? 3),
    gedung: Number(k?.gedung ?? 3),
    cuaca: Number(k?.cuaca ?? 3),
    tamu: Number(k?.tamu ?? 3),
  };
}

/**
 * Ambil peta nilai C1, C3, C4, C5 milik satu DM untuk setiap kandidat.
 * @returns {Promise<{peta: Record<string, {weton: number, gedung: number, cuaca: number, tamu: number}>, kustom: boolean}>}
 */
export async function ambilNilaiDm(acaraId, userId, kandidat = []) {
  const dasar = {};
  for (const k of kandidat) {
    dasar[k.kode] = nilaiAcuanDariKandidat(k);
  }

  let tersimpan = {};
  if (fnGetNilaiDm) {
    const hasil = await fnGetNilaiDm(acaraId, userId);
    tersimpan = hasil && typeof hasil === 'object' ? hasil : {};
  } else {
    const semua = bacaJsonLokal(KUNCI_NILAI_DM);
    tersimpan = semua[`${acaraId}::${userId}`] ?? {};
  }

  const peta = {};
  let kustom = false;
  for (const k of kandidat) {
    const acuan = dasar[k.kode];
    const milikDm = tersimpan[k.kode];
    const gabung = {
      weton: milikDm?.weton != null ? Number(milikDm.weton) : acuan.weton,
      gedung: milikDm?.gedung != null ? Number(milikDm.gedung) : acuan.gedung,
      cuaca: milikDm?.cuaca != null ? Number(milikDm.cuaca) : acuan.cuaca,
      tamu: milikDm?.tamu != null ? Number(milikDm.tamu) : acuan.tamu,
    };
    peta[k.kode] = gabung;
    if (
      gabung.weton !== acuan.weton ||
      gabung.gedung !== acuan.gedung ||
      gabung.cuaca !== acuan.cuaca ||
      gabung.tamu !== acuan.tamu
    ) {
      kustom = true;
    }
  }

  return { peta, kustom };
}

/** Validasi dan simpan nilai C1, C3, C4, C5 milik DM yang login. */
export async function simpanNilaiDmFrontend(acaraId, userId, nilaiPerKandidat) {
  const bersih = {};
  for (const [kode, baris] of Object.entries(nilaiPerKandidat ?? {})) {
    const item = {};
    for (const key of ['weton', 'gedung', 'cuaca', 'tamu']) {
      const n = Number(baris?.[key]);
      if (!Number.isFinite(n) || n < 1 || n > 5) {
        throw new Error(`Nilai "${key}" pada kandidat ${kode} harus antara 1 sampai 5.`);
      }
      item[key] = Math.round(n);
    }
    bersih[kode] = item;
  }

  if (fnSimpanNilaiDm) {
    await fnSimpanNilaiDm(acaraId, userId, bersih);
    return;
  }

  if (MENGGUNAKAN_FIREBASE) {
    throw new Error(
      'Penyimpanan nilai C1, C3, C4, C5 per DM di mode Firebase menunggu pembaruan adapter & Firestore rules dari Backend (@aliajuly).'
    );
  }

  const semua = bacaJsonLokal(KUNCI_NILAI_DM);
  semua[`${acaraId}::${userId}`] = bersih;
  tulisJsonLokal(KUNCI_NILAI_DM, semua);
}

/** Simpan biaya gedung + katering (C2) — khusus Wedding Organizer. */
export async function simpanBiayaWoFrontend(acaraId, kode, biaya) {
  const nilai = Number(biaya);
  if (!Number.isFinite(nilai) || nilai <= 0) {
    throw new Error(`Biaya kandidat ${kode} harus berupa angka lebih besar dari 0 (dalam juta rupiah).`);
  }

  if (fnSimpanBiayaKandidat) {
    const hasil = await fnSimpanBiayaKandidat(acaraId, kode, nilai);
    hapusTandaMenungguBiayaWo(acaraId, kode);
    return hasil;
  }

  if (MENGGUNAKAN_FIREBASE) {
    throw new Error(
      'Penyimpanan biaya (C2) oleh Wedding Organizer di mode Firebase menunggu pembaruan adapter & Firestore rules dari Backend (@aliajuly).'
    );
  }

  // Mode demo: ubahKandidat memperbarui kandidat bersama di localStorage
  // sehingga langsung tersinkron ke semua akun DM pada peramban ini.
  const hasil = await ubahKandidat(acaraId, kode, { biaya: nilai });
  hapusTandaMenungguBiayaWo(acaraId, kode);
  return hasil;
}

/** Daftar kode kandidat yang baru ditambah Sesepuh dan belum diisi biaya C2 oleh WO (mode demo). */
export function daftarMenungguBiayaWo(acaraId) {
  const semua = bacaJsonLokal(KUNCI_BIAYA_PENDING);
  const daftar = semua[acaraId];
  return new Set(Array.isArray(daftar) ? daftar : []);
}

export function tandaiMenungguBiayaWo(acaraId, kode) {
  const semua = bacaJsonLokal(KUNCI_BIAYA_PENDING);
  const set = new Set(Array.isArray(semua[acaraId]) ? semua[acaraId] : []);
  set.add(kode);
  semua[acaraId] = [...set];
  tulisJsonLokal(KUNCI_BIAYA_PENDING, semua);
}

export function hapusTandaMenungguBiayaWo(acaraId, kode) {
  const semua = bacaJsonLokal(KUNCI_BIAYA_PENDING);
  if (!Array.isArray(semua[acaraId])) return;
  semua[acaraId] = semua[acaraId].filter((k) => k !== kode);
  tulisJsonLokal(KUNCI_BIAYA_PENDING, semua);
}

/**
 * Tambah kandidat tanggal (khusus Sesepuh).
 * Biaya C2 akan diisi oleh Wedding Organizer; nilai awal C1/C3/C4/C5 diisi tiap DM.
 */
export async function tambahKandidatSesepuh(acaraId, tanggal) {
  const payload = BACKEND_BIAYA_WO_SIAP
    ? { tanggal }
    : { tanggal, biaya: 40, gedung: 3, cuaca: 3, tamu: 3 };
  const baru = await tambahKandidat(acaraId, payload);
  if (!BACKEND_BIAYA_WO_SIAP) {
    tandaiMenungguBiayaWo(acaraId, baru.kode);
  }
  return baru;
}

/** Ubah tanggal kandidat (khusus Sesepuh) tanpa menimpa biaya C2 milik WO. */
export async function ubahTanggalKandidatSesepuh(acaraId, kode, tanggalBaru) {
  return ubahKandidat(acaraId, kode, { tanggal: tanggalBaru });
}

/** Bersihkan cache demo lokal (dipanggil saat resetDemo). */
export function bersihkanCacheLokalKelola() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(KUNCI_NILAI_DM);
    localStorage.removeItem(KUNCI_BIAYA_PENDING);
  } catch {
    /* abaikan */
  }
}

/**
 * Gabungkan daftar kandidat bersama (identitas tanggal + weton otomatis + C2 WO)
 * dengan nilai C1, C3, C4, C5 milik DM yang sedang login.
 */
export function gabungkanKandidatDenganNilaiDm(kandidat = [], nilaiDm = {}) {
  return kandidat.map((k) => {
    const acuanWeton = Number(k.skorWeton);
    const milikDm = nilaiDm?.[k.kode];
    const skorC1 = milikDm?.weton != null ? Number(milikDm.weton) : acuanWeton;
    return {
      ...k,
      skorWetonAcuan: acuanWeton,
      skorWeton: skorC1,
      c1DiubahManual: skorC1 !== acuanWeton,
      gedung: milikDm?.gedung != null ? Number(milikDm.gedung) : Number(k.gedung),
      cuaca: milikDm?.cuaca != null ? Number(milikDm.cuaca) : Number(k.cuaca),
      tamu: milikDm?.tamu != null ? Number(milikDm.tamu) : Number(k.tamu),
    };
  });
}

/** Ubah daftar kandidat gabungan menjadi vektor masukan `hitungWP()`. */
export function keKandidatWP(kandidatGabungan = []) {
  return kandidatGabungan.map((k) => ({
    kode: k.kode,
    weton: k.skorWeton,
    biaya: k.biaya,
    gedung: k.gedung,
    cuaca: k.cuaca,
    tamu: k.tamu,
  }));
}
