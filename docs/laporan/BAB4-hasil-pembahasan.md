# BAB 4 HASIL & PEMBAHASAN

> Status: draf (N9, Minggu 4). Angka di bab ini diambil dari hasil uji di
> `main` (`f0cf0db`): 67 test aplikasi, 5 test Worker, dan integrasi Worker
> pada alur penilaian-voting.

## 4.1 Hasil eksperimen

| No | Pengujian | Hasil | Sumber/Catatan |
|---|---|---|---|
| 4.1.1 | Uji integrasi Worker (alur T7) | Lulus | 3 penilaian terkirim, gerbang 3 DM terbuka, `voting_hasil` tersimpan sekali |
| 4.1.2 | Test Worker | 5/5 lulus | `worker/test/worker.test.js` |
| 4.1.3 | Test aplikasi | 67/67 lulus | `src/tests/` |
| 4.1.4 | Uji tampilan hasil statik | Lulus | `HalamanHasil.jsx` menampilkan pemenang dan tabel Borda tanpa error konsol |

Hasil integrasi Worker (acuan):

```text
penilaian    : sesepuh, orangtua, wo -> statusKirim true
voting_hasil : 6 dokumen
  E: 35  F: 29  A: 26  B: 17  C: 13  D: 6
```

## 4.2 Hasil Borda (ranking konsensus)

Perhitungan menggunakan `hitungBorda()` di `src/shared/borda.js`. Poin per DM:
`n - ranking + 1`, dengan `n = 6` kandidat, lalu dikalikan bobot jabatan
(Sesepuh 3, Orang Tua 2, WO 1).

| Peringkat | Kode | Tanggal | Poin Sesepuh | Poin Orang Tua | Poin WO | Total |
|---:|:---:|---|---:|---:|---:|---:|
| 1 | E | 2027-08-07 (Sabtu Legi) | 18 | 12 | 5 | 35 |
| 2 | F | 2027-08-21 (Sabtu Kliwon) | 15 | 8 | 6 | 29 |
| 3 | A | 2027-06-12 (Sabtu Kliwon) | 12 | 10 | 4 | 26 |
| 4 | B | 2027-06-20 (Minggu Pon) | 9 | 6 | 2 | 17 |
| 5 | C | 2027-07-10 (Sabtu Pon) | 6 | 4 | 3 | 13 |
| 6 | D | 2027-07-23 (Jumat Legi) | 3 | 2 | 1 | 6 |

Kandidat E menjadi pemenang konsensus dengan total 35 poin.

## 4.3 Hasil detail nilai WP

Nilai S (Weighted Product) diambil dari data acuan Tabel 7.2 / `src/fixtures/dataAcuan.js`.

| Kode | S Sesepuh | Ranking Sesepuh | S Orang Tua | Ranking Orang Tua | S WO | Ranking WO |
|:---:|---:|---:|---:|---:|---:|---:|
| A | 2,5308 | 3 | 0,7289 | 2 | 1,5144 | 3 |
| B | 2,3373 | 4 | 0,6795 | 4 | 1,3462 | 5 |
| C | 1,5387 | 5 | 0,6044 | 5 | 1,4609 | 4 |
| D | 1,2523 | 6 | 0,5216 | 6 | 1,0503 | 6 |
| E | 2,8466 | 1 | 0,7570 | 1 | 1,6027 | 2 |
| F | 2,5502 | 2 | 0,6924 | 3 | 1,6079 | 1 |

## 4.4 Interpretasi

- Kandidat E unggul karena konsisten tinggi di Sesepuh dan Orang Tua; meski WO menempatkan F di ranking 1, bobot jabatan 3:2:1 membuat total E tetap tertinggi.
- Hasil Borda sesuai dengan data acuan proyek (E=35, F=29, A=26, B=17, C=13, D=6) dan terkunci oleh test otomatis.
- Bukti perhitungan manual tersedia di `docs/excel-acuan/Dina_Becik_Excel_Acuan.xlsx` (28 PASS); implementasi aplikasi harus tetap selaras dengan acuan tersebut.
