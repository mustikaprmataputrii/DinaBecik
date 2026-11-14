# Laporan Dina Becik — Bab 1 & Bab 2

> **Draf N5** — Latar Belakang & Landasan Teori
> Penyusun: Nadya Clarissa Azzahra (240605110166)
> Status: **draf untuk ditinjau** (peninjau: Sri; acuan angka: Agni)
> Disusun dari `README.md`, `docs/CATATAN-TEKNIS.md`, `docs/PEMBAGIAN-KERJA.md`,
> dan `src/shared/constants.js`. Sesuaikan penomoran subbab dengan format
> laporan resmi dan panduan proyek bagian 11–12.

---

# BAB 1 PENDAHULUAN

## 1.1 Latar Belakang

Hajatan—terutama pernikahan—merupakan peristiwa penting bagi keluarga Jawa.
Selain menyangkut kesiapan biaya, tempat, dan tamu, pemilihan tanggal
pelaksanaan sering kali tidak dapat dilepaskan dari tradisi **weton**, yaitu
gabungan hari dan pasaran (Legi, Pahing, Pon, Wage, Kliwon) yang dipercaya
membawa makna tertentu bagi keluarga. Praktik ini masih hidup di masyarakat,
namun penentuannya umumnya dilakukan secara lisan dan sangat bergantung pada
pengetahuan seorang sesepuh.

Ketergantungan pada satu orang menimbulkan beberapa masalah. Pertama,
penilaian menjadi **subjektif** dan sulit dipertanggungjawabkan karena tidak
didasarkan pada kriteria yang eksplisit. Kedua, hasilnya **tidak konsisten**:
dua sesepuh atau dua keluarga dapat menghasilkan kesimpulan berbeda untuk
tanggal yang sama. Ketiga, pertimbangan non-tradisional seperti biaya,
ketersediaan gedung, prakiraan cuaca, dan potensi kehadiran tamu sering tidak
diperhitungkan secara sistematis, padahal keputusan akhir harus memuaskan
beberapa pihak sekaligus—sesepuh sebagai pemegang tradisi, orang tua sebagai
pemilik hajat, dan wedding organizer sebagai pelaksana teknis.

Kondisi tersebut sesuai dengan karakter masalah pengambilan keputusan
multi-kriteria (multi-criteria decision making, MCDM) yang melibatkan beberapa
pengambil keputusan. Oleh karena itu diperlukan sebuah **Group Decision Support
System (GDSS)** yang mampu (1) menampung penilaian masing-masing pihak secara
terpisah, (2) menghitung peringkat kandidat tanggal secara transparan, dan
(3) menyatukan peringkat tersebut menjadi satu keputusan kelompok yang dapat
dipertanggungjawabkan.

Penelitian ini membangun **Dina Becik**, sebuah sistem berbasis web yang
menggabungkan **Weighted Product (WP)** untuk penilaian individual dan
**Weighted Borda** untuk konsensus kelompok. WP dipilih karena mampu
menangani kriteria dengan satuan berbeda melalui perkalian berpangkat dan
secara alami membedakan kriteria *benefit* dan *cost*—misalnya weton yang
semakin tinggi semakin baik, sedangkan biaya yang semakin tinggi semakin
merugikan. Borda dipilih karena bekerja pada **peringkat**, sehingga penilaian
tiap pihak yang telah dinormalisasi oleh WP dapat digabungkan tanpa
membandingkan angka mentah yang satuannya berbeda. Bobot suara jabatan
(Sesepuh 3, Orang Tua 2, Wedding Organizer 1) dipakai agar pihak dengan
tanggung jawab tradisional tertinggi tetap memiliki pengaruh terbesar tanpa
menghilangkan suara pihak lain. Aturan **SAW (Simple Additive Weighting) tidak
digunakan** karena penjumlahan terbobot tidak menangani perkalian antar
kriteria sebagaimana dituntut rumusan WP pada panduan proyek.

Hasil akhir sistem adalah satu tanggal terbaik beserta rincian poin Borda tiap
kandidat. Seluruh perhitungan dilakukan **sekali di sisi server** dan disimpan,
lalu dibaca oleh ketiga akun, sehingga ketiga pengguna melihat hasil yang
identik dan dapat diaudit.

## 1.2 Rumusan Masalah

1. Bagaimana memodelkan penentuan hari baik hajatan berbasis weton sebagai
   masalah keputusan multi-kriteria yang melibatkan tiga pengambil keputusan?
2. Bagaimana menerapkan Weighted Product untuk menghitung nilai preferensi
   setiap kandidat tanggal pada masing-masing pengambil keputusan?
3. Bagaimana menerapkan Weighted Borda untuk menyatukan peringkat ketiga
   pengambil keputusan, termasuk penyelesaian kasus seri?
4. Bagaimana merancang sistem berbasis web yang menjaga konsistensi hasil
   melalui perhitungan di server dan hak akses per peran?

## 1.3 Tujuan

1. Menghasilkan sistem pendukung keputusan kelompok untuk memilih satu tanggal
   hajatan terbaik dari beberapa kandidat.
2. Menerapkan dan menguji metode Weighted Product serta Weighted Borda sesuai
   aturan pada panduan proyek.
3. Menyediakan perhitungan yang transparan, dapat diuji ulang, dan konsisten
   di ketiga akun pengguna.

## 1.4 Manfaat

**Teoretis.** Menjadi contoh penerapan gabungan WP dan Weighted Borda pada
domain budaya lokal (weton) dan menunjukkan bagaimana aturan tradisional dapat
diformalkan menjadi kriteria terukur tanpa menghilangkan peran pemegang
tradisi.

**Praktis.** Membantu keluarga mengambil keputusan tanggal hajatan secara
cepat, terdokumentasi, dan mempertimbangkan tradisi sekaligus aspek teknis
dan biaya. Bagi wedding organizer, sistem menyediakan dasar komunikasi yang
jelas dengan keluarga.

## 1.5 Batasan Masalah

- Objek studi adalah pemilihan tanggal hajatan pernikahan; jenis hajatan lain
  hanya berbeda pada data, bukan pada metode.
- Terdapat **tiga** pengambil keputusan: Sesepuh, Orang Tua, dan Wedding
  Organizer. Tidak ada akun keempat.
- Lima kriteria: C1 kecocokan weton/neptu (*benefit*), C2 biaya gedung dan
  katering (*cost*, satuan juta rupiah), C3 ketersediaan gedung (*benefit*),
  C4 prakiraan cuaca/musim (*benefit*), dan C5 potensi tamu hadir (*benefit*).
- Perhitungan skor C1 mengikuti tabel neptu dan aturan sisa bagi 5 yang
  ditetapkan pada panduan proyek; perbedaan tafsir primbon antar daerah tidak
  dibahas.
- Sistem dibangun sebagai aplikasi web dengan Firebase sebagai backend dan
  diuji menggunakan data dummy yang telah diverifikasi.

## 1.6 Sistematika Penulisan

Bab 1 memuat latar belakang, rumusan masalah, tujuan, manfaat, dan batasan.
Bab 2 memuat landasan teori mengenai SPK/GDSS, weton dan neptu, Weighted
Product, Borda, serta teknologi pendukung. Bab 3 memuat analisis dan
perancangan sistem, Bab 4 memuat implementasi dan pengujian, dan Bab 5 memuat
kesimpulan serta saran.

---

# BAB 2 LANDASAN TEORI

## 2.1 Sistem Pendukung Keputusan (SPK)

Sistem Pendukung Keputusan adalah sistem berbasis komputer yang membantu
pengambil keputusan menyelesaikan masalah semi-terstruktur dengan menyediakan
data, model, dan antarmuka yang memudahkan evaluasi alternatif. SPK tidak
menggantikan pengambil keputusan, melainkan menyediakan perhitungan yang
konsisten dan dapat ditelusuri sehingga keputusan akhir tetap berada di tangan
manusia.

## 2.2 Group Decision Support System (GDSS)

GDSS merupakan perluasan SPK untuk situasi yang melibatkan beberapa
pengambil keputusan (decision maker, DM). Menurut DeSanctis dan Gallupe
(1987), GDSS menggabungkan teknologi komunikasi dan komputasi untuk
mendukung perumusan masalah serta evaluasi alternatif oleh kelompok. Dalam
Dina Becik, GDSS diwujudkan melalui tiga akun dengan hak akses berbeda,
penilaian yang terpisah dan terkunci setelah dikirim, gerbang voting yang baru
terbuka setelah ketiga DM mengirim penilaian, serta hasil akhir yang dihitung
sekali dan dibaca bersama.

## 2.3 Weton, Neptu, dan Aturan Skor C1

**Weton** adalah gabungan hari dalam sepekan (7 hari) dengan pasaran dalam
siklus lima hari (Legi, Pahing, Pon, Wage, Kliwon). Setiap hari dan pasaran
memiliki **neptu** (nilai) sebagai berikut.

| Hari | Neptu | | Pasaran | Neptu |
|---|---|---|---|---|
| Minggu | 5 | | Legi | 5 |
| Senin | 4 | | Pahing | 9 |
| Selasa | 3 | | Pon | 7 |
| Rabu | 7 | | Wage | 4 |
| Kamis | 8 | | Kliwon | 8 |
| Jumat | 6 | | | |
| Sabtu | 9 | | | |

Pasaran suatu tanggal dihitung dari selisih hari terhadap titik acuan
1 Januari 1970 (Kamis Wage), lalu diambil sisa bagi 5 dengan urutan
0 = Wage, 1 = Kliwon, 2 = Legi, 3 = Pahing, 4 = Pon. Neptu weton adalah
jumlah neptu hari dan neptu pasaran.

Skor kriteria C1 dihitung dari:

```
sisa  = (neptu_pria + neptu_wanita + neptu_weton_hari_H) mod 5
skor  = tabel aturan sisa -> skor
```

dengan pemetaan **tidak berurutan** sebagaimana ditetapkan panduan:

| sisa | 3 | 1 | 2 | 4 | 0 |
|---|---|---|---|---|---|
| skor | 5 | 4 | 3 | 2 | 1 |

Catatan penting: hasil verifikasi pada `docs/CATATAN-TEKNIS.md` menunjukkan
bahwa angka pada Tabel 7.1 hanya dapat direproduksi jika yang dipakai adalah
**neptu weton** (hari + pasaran), bukan neptu hari saja. Karena itu field data
dinamai `neptuWetonH`. Temuan ini perlu dikonfirmasi kepada dosen sebelum
laporan final.

## 2.4 Multi-Criteria Decision Making dan Weighted Product

Weighted Product (WP) adalah metode MCDM yang menilai alternatif melalui
perkalian nilai kriteria yang dipangkatkan dengan bobotnya. Berbeda dengan
metode penjumlahan terbobot, WP memperhitungkan interaksi multiplikatif antar
kriteria dan tidak memerlukan normalisasi nilai mentah ke skala yang sama.

Langkah-langkah WP:

1. **Normalisasi bobot** agar jumlahnya 1:
   `wj = Wj / Σ Wj`
2. **Hitung nilai preferensi S** tiap alternatif:

   ```
   Si = Π ( xij ^ pj )
   ```

   dengan `pj = +wj` untuk kriteria *benefit* dan `pj = -wj` untuk kriteria
   *cost*.
3. **Hitung nilai V** (preferensi relatif):

   ```
   Vi = Si / Σ Si
   ```
4. **Peringkatkan** alternatif berdasarkan `Si` menurun.

Pada Dina Becik, tiap DM memiliki bobot kriteria sendiri yang wajib berjumlah
tepat 100%. Contoh bobot bawaan: Sesepuh menekankan weton (40%), Orang Tua
menekankan biaya (35%) dan tamu (25%), Wedding Organizer menekankan
ketersediaan gedung (35%). Hasil WP tiap DM adalah peringkat kandidat yang
selanjutnya menjadi masukan Borda.

Kriteria *cost* memerlukan perhatian khusus pada satuan. Karena pangkat
negatif sangat sensitif terhadap skala, biaya wajib dinyatakan dalam **juta
rupiah**; penggunaan rupiah penuh akan mengubah hasil secara drastis dan
membuat hasil tidak sesuai angka acuan.

## 2.5 Metode Borda dan Weighted Borda

Metode Borda (de Borda, 1781) menggabungkan preferensi beberapa pemilih
dengan memberikan poin berdasarkan posisi alternatif dalam peringkat. Untuk
`n` kandidat:

```
poin = n - ranking + 1
```

sehingga kandidat pada peringkat 1 memperoleh `n` poin dan peringkat terakhir
memperoleh 1 poin. **Weighted Borda** mengalikan poin tersebut dengan bobot
suara pemilih:

```
totalPoin_i = Σ_dm ( poinBorda(ranking_i, n) × bobotSuara_dm )
```

Dina Becik memakai bobot jabatan Sesepuh 3, Orang Tua 2, dan Wedding Organizer
1. Kandidat dengan total poin tertinggi menjadi pemenang. Pendekatan ini
menjaga agar pihak dengan tanggung jawab tradisional tertinggi memiliki
pengaruh besar, sementara suara pihak lain tetap diperhitungkan.

## 2.6 Aturan Penyelesaian Seri

Seri terjadi bila dua kandidat atau lebih memperoleh total poin Borda yang
sama. Pada Dina Becik, seri dimenangkan oleh kandidat yang **lebih tinggi pada
ranking Sesepuh**. Aturan ini konsisten dengan kedudukan Sesepuh sebagai
pemegang tradisi dan penentu terakhir. Implementasi membandingkan total poin
dengan toleransi `1e-9` untuk menghindari kesalahan pembulatan *floating
point*, kemudian membandingkan ranking Sesepuh. Skenario seri diuji dengan data
khusus (`src/fixtures/dataUjiSeri.js`) dan test otomatis T6.

## 2.7 Teknologi Pendukung

**Firebase** dipakai sebagai backend terkelola: Firebase Authentication untuk
tiga akun peran dan Cloud Firestore untuk menyimpan acara, kandidat, bobot,
penilaian, serta hasil voting. Hasil akhir disimpan pada koleksi
`voting_hasil` dan dihitung **sekali** melalui transaksi atau Cloud Function
agar ketiga akun membaca angka yang sama. Aturan keamanan Firestore membatasi
setiap DM agar hanya dapat menulis penilaian atas namanya sendiri, dan
penilaian yang telah dikirim tidak dapat diubah.

**React/Vite** dipakai pada sisi klien untuk membangun antarmuka. Komponen
tidak mengakses Firestore secara langsung, melainkan melalui lapisan adapter
(`src/data/index.js`) sehingga penggantian backend tidak memerlukan penulisan
ulang tampilan.

## 2.8 Posisi Penelitian

Penelitian tentang weton umumnya berhenti pada perhitungan kecocokan tanggal.
Dina Becik menambahkan dua hal: (1) penggabungan kriteria tradisional dengan
kriteria teknis dan biaya dalam satu model WP, dan (2) konsensus kelompok
berbobot jabatan melalui Weighted Borda, termasuk aturan penyelesaian seri
yang eksplisit. Dengan demikian sistem tidak hanya menghitung tanggal "baik"
menurut primbon, tetapi juga mendukung keputusan bersama keluarga secara
terdokumentasi.

## 2.9 Kerangka Pemikiran

Data tanggal kandidat → perhitungan weton dan skor C1 → penilaian tiap DM
dengan WP (bobot 100% per DM) → peringkat tiap DM → konsensus Weighted Borda
(bobot jabatan 3:2:1) → aturan seri (ranking Sesepuh) → satu tanggal terbaik
yang disimpan dan ditampilkan ke ketiga akun.

---

## Daftar Pustaka Awal

> Daftar ini baru **awal**; N8 akan melengkapi dan memverifikasi formatnya
> (gaya sitasi menyesuaikan panduan kampus).

1. Hwang, C.-L., & Yoon, K. (1981). *Multiple Attribute Decision Making:
   Methods and Applications*. Springer-Verlag.
2. Yoon, K., & Hwang, C.-L. (1995). *Multiple Attribute Decision Making:
   An Introduction*. Sage Publications.
3. DeSanctis, G., & Gallupe, R. B. (1987). A foundation for the study of group
   decision support systems. *Management Science, 33*(5), 589–609.
4. de Borda, J.-C. (1781). *Mémoire sur les élections au scrutin*.
5. Arrow, K. J. (1951). *Social Choice and Individual Values*. Wiley.
6. Koentjaraningrat. (1984). *Kebudayaan Jawa*. Balai Pustaka.
7. Google. (2026). *Cloud Firestore Documentation*.
   https://firebase.google.com/docs/firestore
8. Dina Becik. (2026). *Panduan Proyek Dina Becik v1.0*.
   `docs/panduan-proyek.pdf`.
