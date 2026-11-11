/**
 * ============================================================================
 *  Dina Becik — FIREBASE ADAPTER (KERANGKA — BELUM AKTIF)
 * ============================================================================
 *  PEMILIK FILE: Alia (Backend & Database)
 *
 *  File ini masih KERANGKA. Jangan diaktifkan sebelum:
 *    1. Firebase project dibuat
 *    2. Firebase Auth berisi 3 akun (sesepuh, orangtua, wo)
 *    3. Firestore rules ditulis (lihat docs/FIRESTORE_RULES.md)
 *    4. Semua test di src/tests/acuan.test.js HIJAU
 *
 *  Setiap fungsi di sini WAJIB mengikuti kontrak di src/data/kontrak.js
 *  dengan signature yang SAMA PERSIS seperti mockAdapter.js.
 *  Jika signature berubah, komponen frontend akan rusak.
 *
 *  Untuk mengaktifkan: ubah 1 baris di src/data/index.js
 * ============================================================================
 */

// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';

/* ---------------------------------------------------------------------------
 * KONFIGURASI
 * -------------------------------------------------------------------------
 * PENTING: apiKey Firebase di frontend AMAN dipublikasikan.
 * Yang BERBAHAYA dan TIDAK BOLEH masuk repo: serviceAccountKey.json
 * (kunci admin SDK). File itu sudah masuk .gitignore.
 *
 * Nilai diambil dari .env (yang juga tidak masuk repo):
 * ------------------------------------------------------------------------- */

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env?.VITE_FIREBASE_APP_ID,
};

export const SIAP = false; // ubah ke true setelah Firebase terpasang

/* ---------------------------------------------------------------------------
 * Struktur koleksi Firestore yang disarankan (Panduan bagian 9)
 * -------------------------------------------------------------------------
 *  users/{uid}                { nama, username, peran, jabatan, bobot_suara }
 *  acara/{acaraId}            { nama_acara, jenis, neptu_pria, neptu_wanita,
 *                               status, dibuat_oleh, tgl_dibuat }
 *  acara/{acaraId}/kandidat/{kandidatId}
 *                             { kode, tanggal, hari, pasaran, neptu_hari_h,
 *                               skor_weton, biaya, skor_gedung, skor_cuaca, skor_tamu }
 *  acara/{acaraId}/bobot/{uid}        { weton, biaya, gedung, cuaca, tamu }
 *  acara/{acaraId}/penilaian/{uid}    { status_kirim, waktu_kirim,
 *                                       hasil: [{kode, s, v, ranking}] }
 *  acara/{acaraId}/voting_hasil/{kandidatId}
 *                             { poin_sesepuh, poin_ortu, poin_wo, total_poin, ranking_final }
 *  acara/{acaraId}/komentar/{komentarId}  { user_id, isi, waktu }
 *  referensi/neptu/{id}       { jenis, nama, nilai }
 *  referensi/aturan_weton/{id} { sisa, skor, keterangan }
 *
 *  CATATAN: `voting_hasil` ditulis SEKALI oleh Cloud Function / transaction,
 *  lalu DIBACA ketiga akun. Jangan dihitung ulang di browser.
 * ------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * TODO untuk Alia — implementasi fungsi adapter
 * -------------------------------------------------------------------------
 *  [ ] getAcara(acaraId)
 *  [ ] getKandidat(acaraId)
 *  [ ] getKriteria()
 *  [ ] getBobotDm(acaraId, userId)
 *  [ ] simpanBobotDm(acaraId, userId, bobot)   -> validasi total 100% di server juga
 *  [ ] getPenilaianDm(acaraId, userId)
 *  [ ] kirimPenilaian(acaraId, userId)         -> KUNCI: tolak jika status_kirim sudah true
 *  [ ] getStatusSemuaDm(acaraId)
 *  [ ] getHasilVoting(acaraId)
 *  [ ] simpanHasilVoting(acaraId, hasil)       -> hanya sekali, dalam transaction
 *  [ ] getKomentar(acaraId)
 *  [ ] simpanKomentar(acaraId, userId, isi)
 *  [ ] getRiwayatAcara()
 *
 *  Aturan wajib (Panduan bagian 8):
 *   - Bobot total harus 100%, jika tidak -> tolak
 *   - Penilaian terkirim terkunci
 *   - DM tidak bisa menilai atas nama DM lain (cek uid == userId & peran)
 *   - Voting terbuka hanya jika ketiga DM sudah kirim
 *   - Hasil final dihitung SEKALI, disimpan, dibaca ketiga akun
 * ------------------------------------------------------------------------- */

export const BELUM_DIIMPLEMENTASI = 'Firebase adapter belum diimplementasikan.';
