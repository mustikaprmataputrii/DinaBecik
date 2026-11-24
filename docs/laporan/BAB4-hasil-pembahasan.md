# BAB 4 HASIL & PEMBAHASAN

> Status: draf (N9, Minggu 4). Angka di bab ini diambil dari hasil uji di
> `main` (`f0cf0db`): integrasi Worker, 5 test Worker, hasil statik di
> `HalamanHasil.jsx`, dan 67 test aplikasi.

## 4.1 HASIL EKSPERIMEN

Hasil eksperimen digunakan untuk perbandingan dan sebagai basis bahasan Bab 4.

| No | Tugas | Hasil | Catatan |
|---|---|---|---|
| 4.1.1 | Uji integrasi Worker (T7) | Lulus | 3 penilaian terkirim, gerbang tiga DM, hasil sekali |
| 4.1.2 | Test Worker | 5/5 lulus | Di `worker/test/worker.test.js` |
| 4.1.3 | Test aplikasi | 67/67 lulus | Di root `src/tests` |
| 4.1.4 | Hasil statik Dashboard | Tidak ada error konsol yang terbaca | Di `HalamanHasil.jsx` |

Hasil integrasi Worker (produktif):

```
penilaian    : sesepuh, orangtua, wo → statusKirim true
voting_hasil : 6 dokumen
  E : 35   F : 29   A : 26   B : 17   C : 13   D : 6
```

## 4.2 HASIL BORDA (RANKING KONSENSUS)

Ranking dari `hitungBorda()` di `src/shared/borda.js` (poin = n − ranking + 1, n = 6 kandidat).

| Peringkat | Kode | Total Poin | Bobot Jabatan (3:2:1) |
|---|---|---|---|
| 1 | E | 35 | 3 (Sesepuh) |
| 2 | F | 29 | 2 (Orang Tua) |
| 3 | A | 26 | 1 (WO) |
| 4 | B | 17 | 0 |
| 5 | C | 13 | 0 |
| 6 | D | 6 | 0 |

Peringkat paling tinggi (E) tercatat di semua akun (Data Acuan `BAB3 3.10`).

## 4.3 HASIL DETAIL NILAI (WP)

Nilai S di BAB 3 digunakan untuk interpretasi di Bab 4.

| Kode | Sesepuh | Orang Tua | WO |
|---|---|---|---|
| E | S 2,8466 | S 2,5308 | S 2,5308 |
| F | – | S 2,8466 | S 2,5308 |

## 4.4 INTERPRETASI & ANALISIS

- E paling tinggi sejalan dengan hasil consultatif di laporan.
- Utamanya adalah hasil buatan data Acuan (28 PASS ini Excel).
- Bilang jika ada angka yang butuh koreksi dari Agni (issue #34 item 4).
