# BAB 5 KESIMPULAN

## 5.1 Hasil akhir

Dina Becik berhasil mengimplementasikan alur GDSS pemilihan tanggal hajatan:
penilaian WP per DM, penguncian kiriman, gerbang voting tiga DM, dan konsensus
Weighted Borda. Pada data acuan, kandidat E (Sabtu Legi, 7 Agustus 2027)
menjadi pemenang dengan 35 poin.

## 5.2 Kesimpulan pengujian

- 67/67 test aplikasi lulus (`src/tests`).
- 5/5 test Worker lulus (`worker/test/worker.test.js`) dengan Firestore tiruan
  (mock fetch), bukan koneksi Firestore nyata.
- Uji logika Worker menunjukkan `voting_hasil` ditulis sekali setelah gerbang
  3 DM terpenuhi.
- T7 (hasil identik di tiga browser) **belum diuji** karena menunggu
  `.env.local` + Worker aktif.
- Hasil Borda sesuai acuan: E 35, F 29, A 26, B 17, C 13, D 6.

## 5.3 Rekomendasi presentasi

1. Gunakan data dari `main` (`f0cf0db`) yang sudah lulus CI.
2. Tunjukkan alur: Dashboard -> Bobot/Penilaian -> Kirim 3 DM -> Hasil.
3. Sorot kartu pemenang E = 35 poin dan tabel Borda.
4. Jika mode Firebase dipakai, pastikan `.env.local`, Worker `/health`, dan
   akun demo aktif sebelum demo; jangan tampilkan secret.

## 5.4 Ringkasan hasil

| Peringkat | Kode | Tanggal | Total Poin |
|---:|:---:|---|---:|
| 1 | E | 2027-08-07 | 35 |
| 2 | F | 2027-08-21 | 29 |
| 3 | A | 2027-06-12 | 26 |
| 4 | B | 2027-06-20 | 17 |
| 5 | C | 2027-07-10 | 13 |
| 6 | D | 2027-07-23 | 6 |

## 5.5 Catatan verifikasi

Titik verifikasi utama:
- `src/shared/borda.js` — `poinBorda`, `hitungBorda`.
- `src/shared/wp.js` — normalisasi bobot dan perhitungan S/V.
- `worker/test/worker.test.js` — T1/T4/T7/T8.
- `docs/excel-acuan/Dina_Becik_Excel_Acuan.xlsx` — bukti hitung manual.

Deadline dosen (baris 215 `docs/PEMBAGIAN-KERJA.md`) masih perlu dikonfirmasi
oleh dosen pembimbing; pantau issue #34 item 6.
