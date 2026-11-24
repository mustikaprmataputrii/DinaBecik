# Draf Naskah Demo 7 Menit — Dina Becik (N7)

> Status: **draf latihan**. Naskah ini mengikuti alur aplikasi saat ini dan
> perlu dicocokkan dengan konfigurasi demo, nama akun, serta data yang benar-benar
> tersedia pada hari presentasi. Jangan menampilkan password atau secret.

## Persiapan sebelum demo

- Siapkan tiga profil browser/perangkat terpisah: Sesepuh, Orang Tua, dan WO.
- Pastikan Firebase Auth, Firestore, `VITE_DINA_API_URL`, dan backend Worker aktif;
  periksa endpoint `/health` sebelum presentasi.
- Pastikan tiga akun demo memiliki profil/peran yang benar, acara
  `acara-demo-2027` dan enam kandidat tersedia, serta bobot tiap DM sesuai angka
  acuan dan totalnya 100%.
- Gunakan acara bersih berstatus `Draft` tanpa penilaian terkirim sebelumnya.
  Kiriman bersifat terkunci; jangan mencoba reset atau menghapus data database
  live saat presentasi.
- Siapkan tiga profil browser pada halaman `/login`. Jika waktu terbatas,
  login ketiga akun sebelum timer demo, lalu tunjukkan identitas/peran setiap
  profil saat berpindah. Jangan menampilkan password di layar.

> Bila aplikasi yang dipakai hanya mode mock/localStorage, jangan menyatakan
> bahwa tiga browser membaca database bersama. Untuk uji lintas-akun, demonstrasi
> harus menggunakan backend Firebase yang sudah dikonfigurasi.

## Alur dan naskah

| Waktu | Tindakan | Naskah penyaji |
|---|---|---|
| 0:00–0:40 | Tampilkan slide judul | “Selamat pagi. Kami memperkenalkan Dina Becik, sistem pendukung keputusan kelompok untuk memilih tanggal hajatan. Tantangannya: keluarga mempertimbangkan weton, sementara orang tua dan penyelenggara juga perlu mempertimbangkan biaya, gedung, cuaca, dan tamu.” |
| 0:40–1:20 | Jelaskan tiga peran dan tujuan | “Sistem melibatkan tiga pengambil keputusan: Sesepuh, Orang Tua, dan Wedding Organizer. Masing-masing memberi penilaian sesuai sudut pandangnya. Tujuan sistem bukan menggantikan musyawarah, tetapi membuat perbandingan kandidat lebih terstruktur dan dapat ditelusuri.” |
| 1:20–2:00 | Login sebagai Sesepuh; tunjukkan peran dan Dashboard | “Saya masuk sebagai Sesepuh, pengambil keputusan dengan bobot suara tertinggi. Dashboard menampilkan status acara dan kemajuan penilaian ketiga DM.” |
| 2:00–2:35 | Buka Data Acara/Kandidat, tunjukkan contoh E | “Ada enam kandidat. Contohnya E, Sabtu Legi, 7 Agustus 2027. Neptu mempelai 24 dan neptu weton 14; `(24 + 14) mod 5 = 3`, sehingga skor C1 pada aturan proyek adalah 5. Tafsir weton dapat berbeda antar daerah.” |
| 2:35–3:15 | Tunjukkan bobot Sesepuh dan pratinjau WP | “Bobot tiap DM berjumlah 100 persen. Sesepuh memberi bobot 40 persen pada weton. WP memakai pangkat positif untuk benefit dan negatif untuk biaya sebagai cost. Kandidat E memperoleh nilai S 2,8466 dan ranking pertama bagi Sesepuh.” |
| 3:15–4:35 | Jika Draft, Sesepuh tekan Mulai Penilaian. Kirim penilaian dari tiap profil | “Sesepuh memulai penilaian. Saya beralih ke profil Orang Tua dan WO; setiap akun mengirim penilaiannya sendiri. Setelah dikirim, penilaian terkunci. Dashboard menunjukkan status sudah/belum menilai.” |
| 4:35–5:20 | Tunjukkan gerbang voting dan buka Konsensus/Hasil setelah kiriman ketiga | “Sebelum tiga DM mengirim, voting terkunci. Setelah kiriman ketiga, backend menghitung Weighted Borda dan menyimpan satu hasil final. Peringkat diubah menjadi poin `n − ranking + 1`, lalu dikalikan bobot jabatan 3:2:1.” |
| 5:20–6:10 | Sorot tabel hasil | “Hasil acuan: E memperoleh 35 poin, F 29, dan A 26. Pemenangnya E, Sabtu Legi, 7 Agustus 2027, dengan estimasi biaya 40 juta rupiah. Walaupun WO memberi F ranking pertama, konsensus tiga pihak memilih E.” |
| 6:10–6:40 | Beralih ke tiga profil; jelaskan T6 | “Ketiga akun membaca hasil final yang sama. Jika total Borda seri, kandidat dengan ranking Sesepuh lebih tinggi menang. T6 diuji terpisah dengan fixture dan test otomatis; saya tidak mengubah data acara live untuk memperagakannya.” |
| 6:40–7:00 | Kembali ke slide penutup | “Kesimpulannya, Dina Becik menggabungkan weton dan pertimbangan praktis melalui WP, kemudian menyatukan tiga peringkat dengan Weighted Borda. Terima kasih.” |

## Jawaban 5 pertanyaan penguji

Jika ditanya saat penguji, jawaban bisa langsung digelar sebagai deskripsi kelompok:

1. **WP bukan SAW?** WP memakai pangkat positif untuk kriteria benefit dan pangkat negatif untuk kriteria cost. SAW adalah penjumlahan linear yang sensitif terhadap skala nilai; WP memprioritaskan struktur bentuk sehingga kecil pada satu kriteria tidak terlalu mengurangi nilai besar yang lain.
2. **Borda berbobot jabatan 3 : 2 : 1?** Bobot suara jabatan: Sesepuh = 3, Orang Tua = 2, WO = 1 — disetujui di BAB3 3.3/3.5 dan `BOBOT_JABATAN` di `src/shared/constants.js`.
3. **Bagaimana seri ditentukan?** Aturan seri di BAB3 3.7 dan uji T6 (A dan B seimbang; A menang karena ranking Sesepuh lebih tinggi).
4. **Dari mana data dummy berasal?** `src/fixtures/dataUjiSeri.js` (N4), serta fixture lain di `src/fixtures/`.
5. **Mengapa hasil dihitung di server?** Supaya tiga akun membaca hasil yang sama (Worker → Firestore `voting_hasil`, T7).

(Sumber daya: langsung ke `docs/laporan/BAB3-metode.md` & `docs/EXCEL-ACUAN.md`; gunakan jawaban di BAB5 untuk BAB4.)

## Jika demo terlambat atau ada kendala

- Prioritaskan: login → data/weton → kirim tiga penilaian → hasil konsensus.
- Jangan mengarang hasil atau mengubah angka jika backend gagal; tunjukkan tabel
  acuan dan jelaskan bahwa bagian live sedang terkendala.
- Jangan mengklaim uji lintas-browser berhasil jika Firebase/backend belum aktif.
- Untuk T6, gunakan penjelasan aturan dan bukti test/fixture; skenario seri bukan
  data acara live.

## Acuan angka

- WP Sesepuh: E = `S 2,8466`, ranking 1 (Tabel 7.2).
- Weighted Borda: E 35, F 29, A 26, B 17, C 13, D 6 (Tabel 7.3).
- Skor C1 E: sisa 3 → skor 5 menurut Panduan Proyek Dina Becik v1.0.
- Test: 67 test aplikasi + 5 test Worker (periksa ulang status CI sebelum demo).
