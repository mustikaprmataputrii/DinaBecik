/**
 * ============================================================================
 *  Dina Becik — KONTRAK LAPISAN DATA (DATA ADAPTER)
 * ============================================================================
 *  ATURAN EMAS: komponen React TIDAK BOLEH mengakses Firestore langsung.
 *  Semua akses data lewat fungsi di file adapter ini.
 *
 *  Alasannya: sekarang data berasal dari fixture (mock), nanti dari Firestore.
 *  Dengan lapisan ini, saat backend siap, cukup ganti isi mockAdapter.js ->
 *  firebaseAdapter.js. Komponen TIDAK berubah sama sekali = NOL rework.
 *
 *  Semua fungsi di sini ASYNC, supaya signature-nya sudah sama dengan versi
 *  Firebase (yang memang async). Ini mencegah perubahan signature di kemudian hari.
 * ============================================================================
 *
 *  Daftar fungsi yang WAJIB ada di setiap adapter:
 *
 *   getAcara(acaraId)                    -> Acara
 *   getKandidat(acaraId)                 -> Kandidat[]
 *   getKriteria()                        -> Kriteria[]
 *   getBobotDm(acaraId, userId)          -> { [keyKriteria]: persen }
 *   simpanBobotDm(acaraId, userId, bobot)-> void
 *   getPenilaianDm(acaraId, userId)      -> { statusKirim, hasil: [...] }
 *   kirimPenilaian(acaraId, userId, data)-> void
 *   getStatusSemuaDm(acaraId)            -> { sesepuh: bool, orangtua: bool, wo: bool }
 *   getHasilVoting(acaraId)              -> HasilVoting | null
 *   simpanHasilVoting(acaraId, hasil)    -> void
 *   getKomentar(acaraId)                 -> Komentar[]
 *   simpanKomentar(acaraId, userId, isi) -> void
 *   getRiwayatAcara()                    -> Acara[]
 *
 *  Bentuk objek mengikuti nama field tabel di Panduan bagian 9 (snake_case),
 *  supaya pemetaan ke Firestore/relasional tidak perlu diubah.
 * ============================================================================
 */

export const KONTRAK_ADAPTER = Object.freeze([
  'getAcara',
  'getKandidat',
  'getKriteria',
  'getBobotDm',
  'simpanBobotDm',
  'getPenilaianDm',
  'kirimPenilaian',
  'getStatusSemuaDm',
  'getHasilVoting',
  'simpanHasilVoting',
  'getKomentar',
  'simpanKomentar',
  'getRiwayatAcara',
]);
