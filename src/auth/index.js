/**
 * ============================================================================
 *  Dina Becik — TITIK GANTI AUTH
 * ============================================================================
 *  Satu-satunya file yang perlu diubah saat Firebase Auth siap.
 *
 *  Sekarang : mockAuth      (akun demo di memori)
 *  Nanti    : firebaseAuth  (Firebase Authentication)
 * ============================================================================
 */

// import * as auth from './firebaseAuth.js';   // <- aktifkan saat Firebase siap
import * as auth from './mockAuth.js'; // <- sementara

export const login = auth.login;
export const logout = auth.logout;
export const sesiAktif = auth.sesiAktif;
export const daftarAkunDemo = auth.daftarAkunDemo;
export const dmDariPeran = auth.dmDariPeran;
