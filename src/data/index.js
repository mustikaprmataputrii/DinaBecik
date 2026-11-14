/**
 * ============================================================================
 *  Dina Becik — TITIK GANTI ADAPTER
 * ============================================================================
 *  SATU-SATUNYA file yang perlu diubah saat backend siap.
 *
 *  Sekarang  : mockAdapter  (data dari fixture Tabel 7.1/7.2/7.3)
 *  Nanti     : firebaseAdapter (data dari Firestore)
 *
 *  Cara ganti (cukup 2 baris):
 *      import * as adapter from './firebaseAdapter.js';
 *      export * from './firebaseAdapter.js';
 *
 *  Komponen meng-import dari sini:
 *      import { getKandidat } from '../data/index.js';
 * ============================================================================
 */

// Firebase dipilih otomatis bila konfigurasi VITE_FIREBASE_* tersedia.
// Tanpa konfigurasi, mock tetap dipakai untuk pengembangan UI.
import * as mockAdapter from './mockAdapter.js';
import * as firebaseAdapter from './firebaseAdapter.js';

const adaKonfigurasiFirebase = Boolean(import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID);
const adapter = adaKonfigurasiFirebase ? firebaseAdapter : mockAdapter;

export default adapter;

// Re-export semua fungsi adapter agar bisa di-import langsung.
export const getAcara = adapter.getAcara;
export const simpanAcara = adapter.simpanAcara;
export const getKandidat = adapter.getKandidat;
export const tambahKandidat = adapter.tambahKandidat;
export const ubahKandidat = adapter.ubahKandidat;
export const hapusKandidat = adapter.hapusKandidat;
export const getKriteria = adapter.getKriteria;
export const getBobotDm = adapter.getBobotDm;
export const simpanBobotDm = adapter.simpanBobotDm;
export const getPenilaianDm = adapter.getPenilaianDm;
export const kirimPenilaian = adapter.kirimPenilaian;
export const getStatusSemuaDm = adapter.getStatusSemuaDm;
export const mulaiPenilaian = adapter.mulaiPenilaian;
export const getHasilVoting = adapter.getHasilVoting;
export const simpanHasilVoting = adapter.simpanHasilVoting;
export const getKomentar = adapter.getKomentar;
export const simpanKomentar = adapter.simpanKomentar;
export const getRiwayatAcara = adapter.getRiwayatAcara;
export const resetDemo = adapter.resetDemo;
