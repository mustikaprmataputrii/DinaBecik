# Excel Acuan — Dina Becik

File: [`Dina_Becik_Excel_Acuan.xlsx`](./Dina_Becik_Excel_Acuan.xlsx)

Pembanding **independen** untuk perhitungan Weighted Product (WP) dan
Weighted Borda. File ini tidak memakai kode proyek sama sekali — semua angka
dihitung ulang dengan rumus Excel asli, lalu dibandingkan dengan angka di
Panduan Proyek (Tabel 7.1, 7.2, 7.3) dan dengan unit test.

| | |
|---|---|
| Pembuat | Agni (`agnigaluhev-svg`) |
| Versi awal | 11 November 2026 |
| Revisi | 14 November 2026 — perbaikan Issue #1 (`fullCalcOnLoad`, label neptu) |
| Dibuat dengan | Python `openpyxl` (metadata file masih mencantumkan `openpyxl`) |
| Metode | WP untuk skor individual, **Weighted Borda** untuk konsensus — **tidak memakai SAW** |

> File di repo ini adalah versi **final** setelah Issue #1. Perubahan yang
> dilakukan hanya dua: menambah `fullCalcOnLoad="1"` pada `xl/workbook.xml`
> dan memperbaiki label `Kandidat!I4` / `Petunjuk!B8` menjadi
> "Neptu **weton** hari-H". Rumus dan 664 nilai cache tidak disentuh.

---

## Isi tiap sheet

| Sheet | Isi |
|---|---|
| `Petunjuk` | Tujuan, alur hitung, penjelasan metode, aturan weton, legenda warna, dan daftar sheet. Mulai membaca dari sini. |
| `Referensi` | Neptu hari dan pasaran, aturan skor weton (C1), neptu mempelai contoh, dan bobot jabatan (Sesepuh 3, Orang Tua 2, WO 1). |
| `Bobot` | Bobot kriteria C1–C5 untuk tiap DM (Sesepuh, Orang Tua, WO), tipe benefit/cost, dan tanda pangkat. Total tiap kolom 100%. |
| `Kandidat` | Tabel 7.1: hari, pasaran, neptu, sisa mod 5, dan skor C1 yang dihitung otomatis dari tanggal. |
| `WP` | Tabel 7.2: S, V, dan ranking untuk ketiga DM, lengkap dengan faktor `x^p`. |
| `Borda` | Tabel 7.3: poin per DM, bobot jabatan, total poin, ranking final, aturan seri, dan pemenang. |
| `Cek` | Perbandingan hasil Excel dengan angka acuan PDF. Status PASS/FAIL per baris dan ringkasan di `Cek!B3`. |
| `Uji_Seri` | Skenario uji T6: dua kandidat bertotal sama; pemenang harus yang ranking Sesepuh-nya lebih tinggi. |

## Cara memakai

1. Buka file di Excel / LibreOffice Calc.
2. Buka sheet **`Cek`** dan lihat sel **`Cek!B3`**.
   Harus berbunyi:

   ```
   SEMUA CEK LOLOS (28 PASS)
   ```

   Kalau muncul `ADA YANG GAGAL (...)`, file sudah berubah dari versi acuan —
   jangan dipakai sebagai pembanding sebelum diperbaiki.
3. Angka penting yang harus keluar dari data bawaan:

   | Angka | Nilai |
   |---|---|
   | Pemenang Weighted Borda | **E** |
   | Total poin pemenang | **35** |
   | Tanggal acara pemenang | **2027-08-07** |
   | Total biaya pemenang | **40 juta Rp** |
   | Jumlah cek | **28 PASS, 0 FAIL** |

4. Untuk skenario seri (T6), buka sheet **`Uji_Seri`**:
   A dan B sama-sama **32 poin**, dan **A menang** karena ranking Sesepuh-nya
   lebih tinggi (1 vs 2). Angka ini juga dikunci oleh unit test.

## Hal yang perlu diperhatikan

- **Bobot ditulis sebagai desimal, bukan persen.** `0.4` berarti **40%**.
  Jangan mengalikan lagi dengan 100 saat membandingkan dengan kode.
- **Hitung ulang setelah membuka file.** File sudah diberi
  `fullCalcOnLoad="1"`, jadi Excel menghitung ulang otomatis saat dibuka.
  Kalau memakai aplikasi lain dan nilai terlihat `0`/kosong, tekan
  **F9** (Excel) atau **Ctrl+Shift+F9** untuk hitung ulang penuh.
- **Jangan simpan ulang dengan `openpyxl`.** Re-save seperti itu menghapus
  nilai cache rumus dan membuat file tampak kosong sebelum dihitung ulang.
  Kalau perlu mengubah label, patch XML di dalam arsip seperti yang dilakukan
  pada Issue #1.
- **Mengubah input membuat `Cek` FAIL — itu wajar.** Kolom acuan di sheet
  `Cek` memakai angka tetap dari PDF. Kalau bobot atau kandidat diubah,
  bandingkan dengan perhitungan kode, bukan lagi dengan status `Cek`.
- **File ini hanya acuan, bukan sumber data aplikasi.** Data yang dipakai
  aplikasi ada di `src/fixtures/`.

## Hubungan dengan unit test

Angka dari file ini dikunci oleh `src/tests/acuan.test.js`:

- WP dibandingkan sampai 10 desimal (selisih maksimum yang tercatat
  sekitar `4,2 × 10⁻¹⁵`).
- Borda dibandingkan per kandidat, termasuk total **E = 35**.
- Skenario seri T6 dari sheet `Uji_Seri` (A dan B = 32, A menang).

Jalankan:

```bash
npm test
```

Status saat file ini diarsipkan:

- Branch `feat/data-nadya` (tempat file ini disimpan): **63 test lulus**
  — 50 test di `acuan.test.js` + 13 test skenario seri di `seri.test.js`.
- Branch `feat/metode-agni`: **51 test di `acuan.test.js`**, setelah
  ditambah kasus T6 versi Excel (n = 6, A dan B seri 32 poin).

Detail audit ada di Issue #1.
