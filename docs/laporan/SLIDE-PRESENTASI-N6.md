# Draf Slide Presentasi — Dina Becik (N6)

> Status: **draf isi**, belum didesain menjadi PowerPoint. Angka menggunakan
> acuan proyek dan perlu dicocokkan lagi dengan versi final laporan sebelum
> presentasi. Rancangan: 10 slide, sekitar 5–7 menit.

## Slide 1 — Dina Becik

**GDSS Penentuan Hari Baik Hajatan Berbasis Weton dan Logika Modern**

- Praktikum Sistem Informasi — Kelompok 4
- Agni Galuh Essa Vandriya · Alia Julyanti · Sri Mustika Indah Permata Putri · Nadya Clarissa Azzahra

**Catatan penyaji:** Buka dengan gagasan: tiga pihak, tiga sudut pandang, satu tanggal hajatan yang harus dipilih bersama.

## Slide 2 — Masalah yang Diangkat

- Pemilihan tanggal hajatan dapat mempertimbangkan weton/neptu.
- Keluarga juga perlu mempertimbangkan biaya, gedung, cuaca, dan kehadiran tamu.
- Musyawarah tanpa kriteria dan pencatatan yang jelas dapat menghasilkan penilaian yang sulit dibandingkan.

**Catatan penyaji:** Dina Becik membantu menata pertimbangan tersebut. Sistem tidak menggantikan musyawarah atau menetapkan tafsir weton sebagai kebenaran universal.

## Slide 3 — Tujuan dan Pengambil Keputusan

Tujuan: memilih satu tanggal terbaik dari beberapa kandidat melalui penilaian multi-kriteria dan konsensus.

| Pengambil keputusan | Fokus utama | Bobot suara Borda |
|---|---|---:|
| Sesepuh keluarga | Tradisi dan weton | 3 |
| Orang tua/penyelenggara | Biaya dan kenyamanan keluarga | 2 |
| Wedding organizer | Kelayakan teknis | 1 |

## Slide 4 — Kriteria Penilaian

| Kriteria | Jenis | Arti nilai |
|---|---|---|
| C1 Weton/neptu | Benefit | Skor 1–5, dihitung dari tanggal dan neptu mempelai |
| C2 Biaya gedung + katering | Cost | Juta rupiah; lebih rendah lebih baik |
| C3 Ketersediaan gedung | Benefit | Skala 1–5 |
| C4 Cuaca/musim | Benefit | Skala 1–5 |
| C5 Potensi tamu hadir | Benefit | Skala 1–5 |

**Bobot awal per DM berjumlah 100%:**

| DM | C1 | C2 | C3 | C4 | C5 |
|---|---:|---:|---:|---:|---:|
| Sesepuh | 40% | 10% | 15% | 15% | 20% |
| Orang tua | 15% | 35% | 15% | 10% | 25% |
| WO | 10% | 20% | 35% | 20% | 15% |

**Catatan penyaji:** Gunakan angka ini sebagai bobot final setelah konsistensi PR #15 dan #18 dikonfirmasi/tergabung.

## Slide 5 — Weton dan Neptu

1. Tentukan hari dan pasaran dari tanggal kandidat.
2. Neptu weton = neptu hari + neptu pasaran.
3. Hitung sisa: `(neptu pria + neptu wanita + neptu weton tanggal) mod 5`.
4. Terapkan aturan C1 pada panduan proyek: **sisa 3→5, 1→4, 2→3, 4→2, 0→1**.

**Contoh kandidat E:** neptu mempelai `15 + 9 = 24`; neptu Sabtu Legi `14`; sisa `(24 + 14) mod 5 = 3`; skor C1 = **5**.

**Catatan penyaji:** Perhitungan contoh dan tabel skor merujuk Panduan Proyek Dina Becik v1.0; tafsir dapat berbeda antar daerah.

## Slide 6 — Penilaian Individual: Weighted Product

```text
Sᵢ = Πⱼ (xᵢⱼ ^ pⱼ)       Vᵢ = Sᵢ / ΣS
pⱼ = +wⱼ untuk benefit; pⱼ = −wⱼ untuk cost
```

- Setiap DM mengatur bobot kriteria sendiri, total wajib 100%.
- Biaya menggunakan satuan **juta rupiah** dan pangkat negatif.
- Kandidat dengan nilai S terbesar memperoleh ranking 1.
- Contoh Sesepuh: kandidat E memperoleh `S = 2,8466` dan ranking 1.

## Slide 7 — Konsensus: Weighted Borda

```text
Poin Borda = jumlah kandidat − ranking + 1
Total = Σ (poin Borda × bobot suara jabatan)
```

Bobot jabatan: Sesepuh 3, Orang Tua 2, WO 1.

**Contoh kandidat E (n=6):** `6×3 + 6×2 + 5×1 = 35 poin`.

| Kandidat | Total poin | Ranking final |
|---|---:|---:|
| E | 35 | 1 |
| F | 29 | 2 |
| A | 26 | 3 |
| B | 17 | 4 |
| C | 13 | 5 |
| D | 6 | 6 |

**Pemenang acuan:** E — Sabtu Legi, 7 Agustus 2027; estimasi biaya 40 juta rupiah.

## Slide 8 — Aturan Seri dan Keamanan Alur

- Jika total poin Borda seri, pemenang adalah kandidat dengan ranking Sesepuh lebih tinggi.
- Voting baru terbuka setelah ketiga DM mengirim penilaian.
- Penilaian yang sudah dikirim terkunci.
- Backend menghitung dan menyimpan hasil final satu kali; ketiga akun membaca hasil yang sama.

**Catatan penyaji:** Uji T6 memakai data khusus. Fixture N4 dan sheet `Uji_Seri` Excel merupakan data uji terpisah; samakan angka yang ditampilkan di materi final dengan Agni.

## Slide 9 — Aplikasi dan Pengujian

**Alur aplikasi:** Persiapan acara → login tiga peran → atur bobot → hitung WP → kirim penilaian → gerbang voting → Weighted Borda → hasil bersama.

- Data acuan Excel: **28 PASS**.
- Test aplikasi: **67 lulus** (51 acuan + 13 skenario seri + 3 kontrak).
- Test backend Worker: **5 lulus**.

**Catatan penyaji:** Tampilkan aplikasi hanya dengan kredensial demo yang diberikan tim; jangan menampilkan secret atau password pada slide.

## Slide 10 — Kesimpulan dan Referensi Pilihan

- Dina Becik menggabungkan kriteria tradisi dan modern dalam penilaian individual WP.
- Weighted Borda merangkum preferensi tiga DM; Sesepuh menjadi penentu jika terjadi seri.
- Hasil dapat ditelusuri melalui angka acuan dan pengujian.

**Referensi pilihan:** Hwang & Yoon (1981); DeSanctis & Gallupe (1987); Rothe (2019); Ratnasari (2023); Wahyudin et al. (2024); Panduan Proyek Dina Becik v1.0. DOI lengkap ada di bagian Daftar Pustaka laporan.

---

## Arahan Visual

- Palet sogan/cokelat, emas, dan krem; gunakan motif batik sebagai hiasan ringan.
- Jaga kontras dan keterbacaan angka; motif dekoratif beropacity maksimal 0,06.
- Tampilkan tabel hasil Borda dalam satu slide dengan total poin rata kanan.
- Pakai maksimal 4–5 bullet per slide; detail rumus dan angka dapat dibantu catatan penyaji.
