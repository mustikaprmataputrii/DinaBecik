# BAB 3 METODE PENELITIAN

> **Status: draf (A6, Minggu 2).** Angka pada bab ini diambil langsung dari
> modul perhitungan dan unit test yang sudah lulus, bukan ditulis ulang dari
> ingatan. Bobot kriteria pada bagian 3.3 berstatus final setelah konfirmasi
> dosen (A3, 16 November 2026) — lihat `docs/EXCEL-ACUAN.md`.

## 3.1 Gambaran Umum Sistem

Dina Becik adalah sistem pendukung keputusan kelompok (GDSS) untuk memilih
tanggal pernikahan. Sistem mempertemukan tiga pihak yang punya kepentingan
berbeda — Sesepuh, Orang Tua, dan Wedding Organizer (WO) — atas enam
alternatif tanggal yang sama, lalu menghasilkan satu keputusan final.

Metode yang dipakai ada dua lapis:

1. **Weighted Product (WP)** untuk penilaian individual. Tiap decision maker
   (DM) memberi bobot kriteria sendiri, lalu sistem menghitung nilai
   preferensi tiap tanggal dan menyusun peringkat dari sudut pandang DM itu.
2. **Weighted Borda** untuk konsensus. Tiga peringkat individual digabung
   dengan bobot suara jabatan, sehingga keputusan final memperhitungkan
   siapa yang berpendapat, bukan sekadar berapa banyak yang memilih.

Simple Additive Weighting (SAW) **tidak dipakai** di titik mana pun. WP
dipilih karena sifatnya multiplikatif: nilai buruk pada satu kriteria tidak
bisa sekadar ditutupi oleh nilai bagus pada kriteria lain lewat penjumlahan.

Alur keputusan mengikuti status acara:

```
Draft  ->  Penilaian  ->  Voting  ->  Selesai
```

- **Draft**: data acara dan kandidat tanggal masih disiapkan Sesepuh.
- **Penilaian**: ketiga DM mengatur bobot dan mengirim penilaian individual.
- **Voting**: sistem menghitung konsensus setelah ketiga DM mengirim.
- **Selesai**: hasil final terkunci dan terbaca identik di ketiga akun.

## 3.2 Data Masukan dan Kriteria

Data masukan berupa enam kandidat tanggal (Tabel 7.1 Panduan Proyek) dengan
lima kriteria. Dua kriteria bersifat *benefit* (makin besar makin baik) dan
satu bersifat *cost* (makin kecil makin baik).

| Kode | Kriteria | Tipe | Skala / satuan |
|---|---|---|---|
| C1 | Kecocokan weton/neptu | Benefit | 1–5 (hasil aturan skor) |
| C2 | Biaya gedung + katering | **Cost** | juta rupiah |
| C3 | Ketersediaan gedung | Benefit | 1–5 |
| C4 | Prakiraan cuaca/musim | Benefit | 1–5 |
| C5 | Potensi tamu hadir | Benefit | 1–5 |

Satuan C2 wajib **juta rupiah**. Karena C2 berpangkat negatif pada WP,
memakai rupiah penuh menggeser hasil secara drastis dan membuat hasil tidak
lagi cocok dengan angka acuan Tabel 7.2.

Data enam kandidat yang dipakai pada pengujian:

| Kode | Tanggal | Weton | C1 | C2 (juta) | C3 | C4 | C5 |
|---|---|---|---|---|---|---|---|
| A | 2027-06-12 | Sabtu Kliwon | 4 | 38 | 4 | 4 | 5 |
| B | 2027-06-20 | Minggu Pon | 4 | 35 | 3 | 4 | 4 |
| C | 2027-07-10 | Sabtu Pon | 1 | 42 | 5 | 5 | 5 |
| D | 2027-07-23 | Jumat Legi | 1 | 30 | 2 | 5 | 3 |
| E | 2027-08-07 | Sabtu Legi | 5 | 40 | 4 | 5 | 5 |
| F | 2027-08-21 | Sabtu Kliwon | 4 | 44 | 5 | 5 | 4 |

## 3.3 Pembobotan Kriteria per Decision Maker

Setiap DM memberi bobot berbeda sesuai sudut pandangnya. Total bobot tiap DM
harus **tepat 100%**; sistem menolak penyimpanan bila totalnya bukan 100%.
Nilai berikut sudah final (A3) dan dikunci oleh unit test:

| Kode | Kriteria | Sesepuh | Orang Tua | WO |
|---|---|---|---|---|
| C1 | Kecocokan weton/neptu | 0,40 | 0,15 | 0,10 |
| C2 | Biaya (cost) | 0,10 | 0,35 | 0,20 |
| C3 | Ketersediaan gedung | 0,15 | 0,15 | 0,35 |
| C4 | Cuaca/musim | 0,15 | 0,10 | 0,20 |
| C5 | Potensi tamu | 0,20 | 0,25 | 0,15 |
| | **Total** | **1,00** | **1,00** | **1,00** |

Bobot jabatan untuk konsensus Weighted Borda: **Sesepuh 3, Orang Tua 2,
WO 1**. Bobot jabatan ini membuat Sesepuh tetap menentukan ketika terjadi
seri poin, tanpa menghapus suara dua pihak lain.

## 3.4 Perhitungan Skor Weton (C1)

Weton ditentukan dari hari dan pasaran tanggal kandidat. Neptu weton adalah
jumlah neptu hari dan neptu pasaran, lalu dihitung sisa baginya terhadap 5
terhadap jumlah neptu kedua mempelai:

```
sisa = (neptu_pria + neptu_wanita + neptu_weton_kandidat) mod 5
```

Pada data acuan, neptu pria = 15 (Kamis Pon) dan neptu wanita = 9
(Senin Legi). Skor C1 diambil dari tabel aturan weton berikut — perhatikan
bahwa urutannya **tidak** natural (sisa 0 bukan skor tertinggi):

| Sisa | Skor | Keterangan |
|---|---|---|
| 3 | 5 | Paling baik |
| 1 | 4 | Baik |
| 2 | 3 | Cukup |
| 4 | 2 | Kurang |
| 0 | 1 | Paling kurang |

Contoh: kandidat E (Sabtu Legi) memiliki neptu weton 14, sehingga
sisa = (15 + 9 + 14) mod 5 = 38 mod 5 = 3, dan skor C1 = 5.

Satu temuan teknis yang perlu dicatat: angka Tabel 7.1 hanya dapat
direproduksi bila yang dipakai adalah **neptu weton** (hari + pasaran), bukan
neptu hari saja. Kandidat A (Sabtu Kliwon, neptu 17) menghasilkan sisa 1
(skor 4), sedangkan bila hanya neptu hari yang dipakai hasilnya sisa 3
(skor 5) — berbeda dari tabel acuan.

## 3.5 Penilaian Individual dengan Weighted Product

Untuk `n` kriteria dan `m` alternatif, bobot DM dinormalisasi lebih dulu
sehingga jumlahnya 1:

```
wj = Wj / Σ Wj
```

Nilai preferensi tiap alternatif dihitung sebagai perkalian nilai kriteria
yang dipangkatkan bobotnya:

```
Si = Π ( xij ^ pj )
```

dengan `pj = +wj` untuk kriteria benefit dan `pj = -wj` untuk kriteria cost
(di sini hanya C2). Nilai preferensi relatif:

```
Vi = Si / Σ Si
```

Peringkat individual disusun dari `Si` menurun. Contoh perhitungan kandidat E
dari sudut pandang Sesepuh (bobot 0,40 / 0,10 / 0,15 / 0,15 / 0,20):

```
S_E = 5^0,40 × 40^(-0,10) × 4^0,15 × 5^0,15 × 5^0,20
    = 1,9037 × 0,6914 × 1,2311 × 1,2731 × 1,3797
    ≈ 2,8466
```

Hasil lengkap per DM harus sama dengan Tabel 7.2 sampai **4 desimal**:

| Kandidat | S Sesepuh | Rank | S Orang Tua | Rank | S WO | Rank |
|---|---|---|---|---|---|---|
| A | 2,5308 | 3 | 0,7289 | 2 | 1,5144 | 3 |
| B | 2,3373 | 4 | 0,6795 | 4 | 1,3462 | 5 |
| C | 1,5387 | 5 | 0,6044 | 5 | 1,4609 | 4 |
| D | 1,2523 | 6 | 0,5216 | 6 | 1,0503 | 6 |
| E | 2,8466 | 1 | 0,7570 | 1 | 1,6027 | 2 |
| F | 2,5502 | 2 | 0,6924 | 3 | 1,6079 | 1 |

Tampilan aplikasi membulatkan angka S dan V pada 4 desimal, tetapi peringkat
disusun dari nilai penuh, bukan dari angka yang sudah dibulatkan, agar
pembulatan tampilan tidak mengubah urutan.

## 3.6 Konsensus dengan Weighted Borda

Peringkat tiap DM diterjemahkan menjadi poin Borda mentah:

```
poin = n - ranking + 1
```

Untuk `n = 6`, peringkat 1 memperoleh 6 poin dan peringkat 6 memperoleh
1 poin. Poin itu dikalikan bobot jabatan DM, lalu dijumlahkan:

```
totalPoin_i = Σ_dm ( poinBorda(ranking_i, n) × bobotSuara_dm )
```

Contoh kandidat E: Sesepuh menempatkannya ranking 1 (6 × 3 = 18), Orang Tua
ranking 1 (6 × 2 = 12), WO ranking 2 (5 × 1 = 5). Totalnya **35 poin**.

| Kandidat | Poin Sesepuh | Poin Orang Tua | Poin WO | Total | Rank akhir |
|---|---|---|---|---|---|
| E | 18 | 12 | 5 | **35** | 1 |
| F | 15 | 8 | 6 | 29 | 2 |
| A | 12 | 10 | 4 | 26 | 3 |
| B | 9 | 6 | 2 | 17 | 4 |
| C | 6 | 4 | 3 | 13 | 5 |
| D | 3 | 2 | 1 | 6 | 6 |

Konsensus memenangkan **E (7 Agustus 2027)** dengan 35 poin, biaya
40 juta rupiah. Angka ini adalah angka acuan Tabel 7.3 dan menjadi salah satu
pengunci utama pengujian (uji T5).

## 3.7 Aturan Penyelesaian Seri

Seri dapat terjadi pada dua tingkat:

1. **Seri nilai WP dalam satu DM.** Peringkat tetap harus unik agar poin
   Borda bisa dihitung. Pengurutan memakai nilai S penuh (tanpa pembulatan
   tampilan); bila dua nilai benar-benar sama, urutan masukan dipertahankan
   karena pengurutan bersifat stabil, sehingga tidak ada dua kandidat yang
   memperoleh peringkat sama.
2. **Seri total poin Borda antar kandidat.** Pemenang ditentukan oleh
   **ranking Sesepuh** — jabatan tertinggi. Aturan ini sudah disepakati
   sebagai bagian dari metode, bukan tambahan teknis.

Kasus uji T6 memakai konstruksi seri murni: dua kandidat (A dan B) sama-sama
memperoleh **32 poin** Borda, dan A menang karena ranking Sesepuh-nya lebih
tinggi (1 berbanding 2). Kasus ini dikunci oleh unit test tersendiri.

## 3.8 Gerbang Penilaian dan Penguncian Hasil

Aturan yang dijaga sistem, bukan hanya ditampilkan di layar:

- **Bobot harus 100%.** Bila total bukan 100%, penyimpanan ditolak dan pesan
  kesalahan menyebut total sebenarnya.
- **Penilaian terkunci setelah dikirim.** DM tidak dapat mengubah kirimannya,
  dan tidak dapat menilai atas nama DM lain.
- **Voting hanya terbuka bila ketiga DM sudah mengirim.** Dengan dua DM,
  gerbang masih tertutup dan sistem menyebutkan siapa yang belum mengirim.
- **Hasil dihitung sekali di server.** Konsensus dihitung, disimpan ke
  `voting_hasil`, lalu dibaca oleh ketiga akun. Perhitungan tidak diulang di
  browser masing-masing, sehingga ketiga akun menampilkan angka identik (uji
  T7).
- **Perubahan status acara hanya lewat server.** Klien tidak boleh mengubah
  status; perpindahan `Draft → Penilaian` dilakukan endpoint khusus yang
  hanya menerima peran Sesepuh.

## 3.9 Implementasi dan Keamanan

Sistem dibangun sebagai aplikasi web React dengan dua mode data:

| Mode | Kapan aktif | Penyimpanan |
|---|---|---|
| Demo | variabel `VITE_FIREBASE_*` kosong | `localStorage` browser |
| Firebase | variabel `VITE_FIREBASE_*` terisi | Firestore |

Kedua mode memakai **kontrak adapter yang sama**, sehingga halaman tidak
berubah saat sumber data diganti. Aturan keamanan Firestore bersifat
*default deny*: penulisan data acara dan kandidat hanya untuk Sesepuh, dan
`voting_hasil` tidak dapat ditulis klien sama sekali. Operasi yang tidak
boleh dilakukan klien dijalankan oleh Cloudflare Worker.

Perhitungan WP dan Borda diletakkan di modul bersama (`src/shared/`) yang
diimpor baik oleh aplikasi maupun Worker, sehingga rumus di layar dan rumus
di server tidak mungkin berbeda.

## 3.10 Pengujian dan Validasi

Validasi memakai dua pembanding independen:

1. **Excel acuan** yang menghitung skenario yang sama dengan rumus Excel
   murni. Berkas ini punya sheet pemeriksaan otomatis dan harus berbunyi
   `SEMUA CEK LOLOS (28 PASS)` sebelum dipakai sebagai pembanding.
2. **Unit test otomatis** yang mengunci angka acuan. Total **67 test**:

| Berkas | Jumlah | Yang dikunci |
|---|---|---|
| `acuan.test.js` | 51 | weton, WP (Tabel 7.2), Borda (Tabel 7.3), bobot final A3, T6 versi Excel |
| `seri.test.js` | 13 | skenario seri, termasuk T6 |
| `kontrak.test.js` | 3 | kelengkapan 19 fungsi adapter |

Pemetaan ke skenario uji Panduan Proyek:

| Uji | Cakupan | Status |
|---|---|---|
| T2 | WP = Tabel 7.2 sampai 4 desimal | otomatis |
| T3 | bobot bukan 100% ditolak | otomatis |
| T5 | pemenang E dengan 35 poin | otomatis |
| T6 | seri dimenangkan ranking Sesepuh | otomatis |
| T1, T4, T7, T8 | login, gerbang voting, hasil identik, penilaian terkunci | 5 test Worker + verifikasi manual |

Aturan kerjanya: **jangan menerima kode perhitungan sebelum angkanya cocok
dengan tabel acuan**. Setiap kali bobot atau data acuan berubah, test harus
ikut berubah dalam satu perubahan yang disadari — kalau tidak, CI merah.

## 3.11 Batasan Metode

- Bobot kriteria bersifat **subjektif per DM**. Sistem menjamin totalnya
  100%, tetapi tidak menilai apakah pembagian bobot itu "benar" secara
  metodologis.
- Aturan skor weton mengikuti tradisi Jawa yang dipakai pada praktikum;
  tafsir di daerah lain dapat berbeda.
- Metode memilih di antara **alternatif yang diberikan**. Sistem tidak
  menghasilkan tanggal baru di luar daftar kandidat.
- Weighted Borda mengasumsikan peringkat tiap DM lengkap dan konsisten; bila
  seorang DM tidak mengirim penilaian, konsensus tidak dihitung, bukan
  dihitung dengan data sebagian.
