# BAB 5 KESIMPULAN

## 5.1 HASIL AKHIR

Dina Becik diuji sebagai sistem pendukung keputusan kelompok. Data uji terintegrasi
dengan Worker memberikan hasil segar dan stabil: E di urutan pertama, poin kerjasama
dimaknai sebagai peringkat ganda, dan identik terbaca di ketiga akun.

## 5.2 Rekomendasi untuk alumni utama (presentasi)

1. Gunakan data dari `main` (`f0cf0db`), 67 test + 5 test Worker lulus.
2. Tunjukkan kartu hasil (E = 35), lalu tunjukkan gerbang voting dan polling 3 akun.
3. Jika ada waktu, aktifkan mode Firebase sebelum presentasi (lihat `.env.local`).

## 5.2 Rekomendasi untuk alumni utama (presentasi)

1. Gunakan data dari `main` (`f0cf0db`): 67 test root + 5 test Worker.
2. Buka `/dashboard` atau `/hasil`, tunjukkan tabel Border: **E = 35 poin** sebagai pemenang.
3. Tunjukkan hasil WP di 3 akun, lalu hasil konsensus yang sama.
4. Jika ada waktu, aktifkan mode Firebase lebih dulu (`VITE_FIREBASE_*` → Worker → `/health`).

## 5.3 Ringkasan urutan hasil

| Peringkat | Kode | Poin |
|---|---|---|
| 1 | E | 35 |
| 2 | F | 29 |
| 3 | A | 26 |
| 4 | B | 17 |
| 5 | C | 13 |
| 6 | D | 6 |

**Catatan:**hasil poin di atas dari `hitungBorda()` dengan bobot jabatan 3 : 2 : 1. Poinnya tidak bisa dilihat dari Excel, tapi urutan ke-1 ditemukan di UI (tugas Agni yakin).

## 5.4 Tempat verifikasi untuk Agni

Silakan Agni memeriksa di `main` (`f0cf0db`):
- `src/shared/borda.js` (`poinBorda`, `hitungBorda`)
- `worker/test/worker.test.js` (T1/T4/T7/T8)
- Hasil loop konsultatif di `/hasil`

## 5.5 Catatan deadline dosen

Deadline dosen baris 215 di `PEMBAGIAN_KERJA.md` masih perlu dikonfirmasi oleh
dosen pembimbing (issue #34 item 6).

