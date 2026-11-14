/**
 * ============================================================================
 *  Dina Becik — TITIK GANTI AUTH
 * ============================================================================
 *  Satu-satunya file yang perlu diubah saat backend auth berganti.
 *
 *  Adapter dipilih OTOMATIS:
 *    - VITE_FIREBASE_* tersedia  -> firebaseAuth (Firebase Authentication)
 *    - tidak tersedia            -> mockAuth     (akun demo, untuk dev UI)
 *
 *  Komponen tetap meng-import dari sini, tidak pernah dari file adapter.
 * ============================================================================
 */

import * as firebaseAuth from './firebaseAuth.js';
import * as mockAuth from './mockAuth.js';

const gunakanFirebase = Boolean(
  import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID
);
const authAdapter = gunakanFirebase ? firebaseAuth : mockAuth;

export const login = authAdapter.login;
export const logout = authAdapter.logout;
export const sesiAktif = authAdapter.sesiAktif;
export const daftarAkunDemo = authAdapter.daftarAkunDemo;
export const dmDariPeran = authAdapter.dmDariPeran;

/**
 * Dipakai nanti bila UI ingin mengikuti perubahan status login Firebase
 * secara langsung. Saat memakai mock, fungsi ini tidak tersedia sehingga
 * dilempar ke error yang jelas, bukan gagal diam-diam.
 */
export const pantauSesi =
  authAdapter.pantauSesi ??
  (() => {
    throw new Error('pantauSesi hanya tersedia saat Firebase Auth aktif.');
  });
export const penggunaSaatIni =
  authAdapter.penggunaSaatIni ??
  (() => {
    throw new Error('penggunaSaatIni hanya tersedia saat Firebase Auth aktif.');
  });
