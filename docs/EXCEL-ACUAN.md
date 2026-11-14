# Excel Acuan — dokumen rujukan

File kerja: [`excel-acuan/Dina_Becik_Excel_Acuan.xlsx`](./excel-acuan/Dina_Becik_Excel_Acuan.xlsx)
Catatan pemakaian lengkap: [`excel-acuan/README.md`](./excel-acuan/README.md)

Dokumen ini adalah pintu masuk singkat. Isinya: kegunaan file, angka kunci,
dan **status penguncian bobot (A3)** yang masih menunggu konfirmasi dosen.

## Kegunaan

Excel ini adalah pembanding **independen** untuk Weighted Product (WP) dan
Weighted Borda. Semua angkanya dihitung dengan rumus Excel, bukan memakai kode
aplikasi. Fungsinya membuktikan bahwa hasil program cocok dengan Tabel 7.1,
7.2, dan 7.3 pada Panduan Proyek.

Aturan emas Panduan bagian 13: *jangan menerima kode perhitungan sebelum
angkanya cocok dengan tabel acuan.* File ini adalah buktinya.

## Angka kunci

| Pemeriksaan | Nilai |
|---|---|
| Ringkasan sheet `Cek` | `SEMUA CEK LOLOS (28 PASS)` |
| Pemenang Weighted Borda | **E** |
| Total poin pemenang | **35** |
| Tanggal acara pemenang | **2027-08-07** |
| Total biaya pemenang | **40 juta Rp** |
| Skenario seri T6 | A = B = 32 poin, **A menang** (ranking Sesepuh 1 vs 2) |

Cara cepat memeriksa:

1. Buka file, masuk ke sheet `Cek`, lihat `Cek!B3`.
2. Harus berbunyi `SEMUA CEK LOLOS (28 PASS)`.
3. Kalau muncul `ADA YANG GAGAL`, file sudah berubah — jangan dipakai sebagai
   pembanding sebelum dipulihkan.

## Status penguncian bobot (A3)

**Status: menunggu konfirmasi dosen.** Nilai di bawah adalah yang dipakai
Excel acuan dan unit test saat ini. Selama belum dikunci, nilai ini berstatus
*contoh dari Panduan bagian 5*, bukan keputusan final.

Bobot ditulis sebagai **desimal** (`0,4` = 40%). Total tiap kolom = 100%.

| Kode | Kriteria | Tipe | Sesepuh | Orang Tua | WO |
|---|---|---|---|---|---|
| C1 | Kecocokan weton/neptu | Benefit | 0,40 | 0,15 | 0,10 |
| C2 | Biaya gedung + katering | Cost | 0,10 | 0,35 | 0,20 |
| C3 | Ketersediaan gedung | Benefit | 0,15 | 0,15 | 0,35 |
| C4 | Prakiraan cuaca/musim | Benefit | 0,15 | 0,10 | 0,20 |
| C5 | Potensi tamu hadir | Benefit | 0,20 | 0,25 | 0,15 |
| | **Total** | | **1,00** | **1,00** | **1,00** |

Bobot jabatan untuk konsensus: **Sesepuh 3, Orang Tua 2, WO 1.**

### Yang perlu ditanyakan ke dosen

1. Apakah bobot C1–C5 per DM di atas sudah final, atau ada angka yang harus
   diganti?
2. Apakah bobot jabatan **3 : 2 : 1** untuk Weighted Borda sudah sesuai?
3. Apakah aturan skor weton (sisa 3 = 5, 1 = 4, 2 = 3, 4 = 2, 0 = 1) sesuai
   tradisi yang dipakai untuk praktikum?

Kalau ada yang berubah, yang perlu disunting hanya sheet `Bobot` dan
`Referensi`. Setelah itu tekan hitung ulang, lalu **jalankan `npm test`** —
kalau angka acuan ikut berubah, test perlu diperbarui secara sadar, bukan
diam-diam.

## Hubungan dengan unit test

- `src/tests/acuan.test.js` mengunci angka WP dan Borda, termasuk E = 35.
- `src/tests/seri.test.js` mengunci skenario seri T6.
- PR #10 menambahkan kasus T6 versi Excel yang memakai angka sama dengan
  sheet `Uji_Seri`.

Jalankan:

```bash
npm test
```
