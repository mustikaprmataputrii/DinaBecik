# Excel Acuan — dokumen rujukan

File kerja: [`excel-acuan/Dina_Becik_Excel_Acuan.xlsx`](./excel-acuan/Dina_Becik_Excel_Acuan.xlsx)
Catatan pemakaian lengkap: [`excel-acuan/README.md`](./excel-acuan/README.md)

Dokumen ini adalah pintu masuk singkat. Isinya: kegunaan file, angka kunci,
dan **keputusan bobot final (A3)** yang sudah dikunci per 16 November 2026.

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

## Keputusan bobot final (A3)

**Status: FINAL — dikunci 16 November 2026.**

Tiga hal sudah dikonfirmasi ke dosen pembimbing pada tanggal tersebut, sehingga
nilai di bawah berstatus **acuan resmi**, bukan lagi *contoh dari Panduan
bagian 5*.

| Butir | Keputusan |
|---|---|
| Bobot C1–C5 per DM | Diterima apa adanya, sesuai tabel di bawah |
| Bobot jabatan Weighted Borda | **3 : 2 : 1** (Sesepuh : Orang Tua : WO) |
| Aturan skor weton (C1) | Sisa 3 = 5, 1 = 4, 2 = 3, 4 = 2, 0 = 1 — sesuai |

Angka ini **dikunci oleh unit test** di `src/tests/acuan.test.js`
(blok `validasi bobot`): kalau salah satu bobot berubah, `npm test` gagal.
Perubahan hanya sah bila ada keputusan baru dari dosen dan dokumen ini
diperbarui bersamaan.

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

### Kalau nanti ada perubahan

Perubahan bobot **tidak boleh** dilakukan diam-diam. Urutannya:

1. Dapatkan keputusan baru dari dosen (tertulis lebih baik).
2. Sunting sheet `Bobot` dan `Referensi` di file Excel.
3. Tekan hitung ulang, pastikan `Cek!B3` kembali `SEMUA CEK LOLOS`.
4. Perbarui tabel di dokumen ini beserta tanggal keputusannya.
5. Perbarui `BOBOT_AWAL` di `src/shared/constants.js` **dan** angka di test —
   keduanya dalam satu PR, supaya terlihat jelas bahwa angkanya memang sengaja
   berubah.
6. Jalankan `npm test`. Kalau ada angka acuan lain (S, V, poin Borda) yang
   ikut bergeser, periksa satu per satu; jangan sekadar menimpa angka test.

Langkah 5 penting: kalau bobot diubah tanpa memperbarui test, CI akan merah —
itu memang tujuannya, supaya metode tidak bergeser tanpa persetujuan.

## Hubungan dengan unit test

- `src/tests/acuan.test.js` mengunci angka WP dan Borda, termasuk E = 35,
  serta bobot final A3 (C1–C5 per DM dan bobot jabatan 3 : 2 : 1).
- `src/tests/seri.test.js` mengunci skenario seri T6.
- PR #10 menambahkan kasus T6 versi Excel yang memakai angka sama dengan
  sheet `Uji_Seri`.

Jalankan:

```bash
npm test
```
