/**
 * ============================================================================
 *  Dina Becik — AUTH (MOCK)
 * ============================================================================
 *  PEMILIK FILE: Alia (Backend & Database)
 *  Diisi sementara oleh Sri agar frontend bisa jalan tanpa Firebase.
 *
 *  ATURAN: sama seperti lapisan data — komponen TIDAK boleh memanggil
 *  Firebase Auth langsung. Selalu lewat src/auth/index.js
 *
 *  STATUS: firebaseAuth.js sudah aktif. File ini HANYA dipakai saat
 *  VITE_FIREBASE_* tidak tersedia (mode demo / pengembangan UI).
 *  JANGAN DIPAKAI DI PRODUKSI.
 * ============================================================================
 */

import { DECISION_MAKERS } from '../shared/constants.js';

const KUNCI_SESI = 'dina-becik-sesi';

/**
 * Akun demo untuk pengembangan UI. JANGAN dipakai di produksi: password di sini
 * teks biasa dan sesi disimpan di sessionStorage. Saat VITE_FIREBASE_* terisi,
 * src/auth/index.js otomatis memakai firebaseAuth.js (Firebase Authentication).
 */
const AKUN_DEMO = [
  { username: 'sesepuh', password: 'sesepuh123', userId: 'u-sesepuh', peran: 'sesepuh' },
  { username: 'orangtua', password: 'orangtua123', userId: 'u-orangtua', peran: 'orangtua' },
  { username: 'wo', password: 'wo123', userId: 'u-wo', peran: 'wo' },
];

/** Ambil data DM lengkap dari peran. */
export function dmDariPeran(peran) {
  return DECISION_MAKERS.find((d) => d.key === peran) ?? null;
}

/**
 * Login.
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{userId: string, username: string, peran: string, nama: string, bobotSuara: number}>}
 */
export async function login(username, password) {
  await new Promise((r) => setTimeout(r, 120));

  const akun = AKUN_DEMO.find(
    (a) => a.username === String(username).trim().toLowerCase() && a.password === password
  );

  if (!akun) {
    throw new Error('Username atau password salah.');
  }

  const dm = dmDariPeran(akun.peran);
  const sesi = {
    userId: akun.userId,
    username: akun.username,
    peran: akun.peran,
    nama: dm.nama,
    bobotSuara: dm.bobotSuara,
  };

  sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
  return sesi;
}

/** Logout. */
export async function logout() {
  sessionStorage.removeItem(KUNCI_SESI);
}

/** Ambil sesi aktif, atau null. */
export function sesiAktif() {
  try {
    const mentah = sessionStorage.getItem(KUNCI_SESI);
    return mentah ? JSON.parse(mentah) : null;
  } catch {
    return null;
  }
}

/** Daftar akun demo untuk ditampilkan di halaman login (hanya saat pengembangan). */
export function daftarAkunDemo() {
  return AKUN_DEMO.map((a) => ({ username: a.username, password: a.password, peran: a.peran }));
}
