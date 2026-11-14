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
 *  Saat Firebase siap, buat firebaseAuth.js dengan signature yang SAMA,
 *  lalu ganti import di src/auth/index.js
 * ============================================================================
 */

import { DECISION_MAKERS } from '../shared/constants.js';

const KUNCI_SESI = 'dina-becik-sesi';

/**
 * Akun demo. Password sederhana untuk demo, TIDAK ditulis di kode publik
 * pada versi produksi. Di sini hanya untuk keperluan pengembangan tampilan.
 */
const AKUN_DEMO = [
  { username: 'sesepuh', password: 'sesepuh123', userId: 'u-sesepuh', peran: 'sesepuh' },
  { username: 'orangtua', password: 'orangtua123', userId: 'u-orangtua', peran: 'orangtua' },
  { username: 'wo', password: 'wo123', userId: 'u-wo', peran: 'wo' },
];

/** Ambil data DM lengkap dari peran. */
export function dmDariPeran(peran) {
  return DECISION_MAKERS.find((item) => item.key === peran) ?? null;
}

/** Login demo. */
export async function login(username, password) {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const akun = AKUN_DEMO.find(
    (item) => item.username === String(username).trim().toLowerCase() && item.password === password,
  );
  if (!akun) throw new Error('Username atau password salah.');
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

/** Logout demo. */
export async function logout() {
  sessionStorage.removeItem(KUNCI_SESI);
}

/** Ambil sesi aktif, atau null. */
export function sesiAktif() {
  try {
    const raw = sessionStorage.getItem(KUNCI_SESI);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** Daftar akun demo untuk pengembangan saja. */
export function daftarAkunDemo() {
  return AKUN_DEMO.map(({ username, password, peran }) => ({ username, password, peran }));
}
