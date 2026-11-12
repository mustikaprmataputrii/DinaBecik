# Catatan Teknis — Dina Becik

Keputusan dan temuan selama membangun pondasi. **Baca sebelum mengubah kode.**

---

## 1. ⚠️ Temuan: "Neptu hari-H" di Tabel 7.1 sebenarnya neptu WETON

### Masalah

Panduan bagian 6.1 menulis rumus skor C1:

```
sisa = (neptu_mempelai_pria + neptu_mempelai_wanita + neptu_hari-H) mod 5
```

Tetapi kolom **"Neptu hari-H"** pada Tabel 7.1 berisi angka yang **bukan** neptu hari.

### Bukti

Dengan neptu mempelai 24 (pria Kamis Pon = 15, wanita Senin Legi = 9):

| Kandidat | Hari | Pasaran | Neptu **weton** | sisa | C1 tabel | Neptu **hari saja** | sisa | C1 hasil |
|---|---|---|---|---|---|---|---|---|
| A | Sabtu | Kliwon | 17 | 1 | **4** ✅ | 9 | 3 | 5 ❌ |
| B | Minggu | Pon | 12 | 1 | **4** ✅ | 5 | 4 | 2 ❌ |
| C | Sabtu | Pon | 16 | 0 | **1** ✅ | 9 | 3 | 5 ❌ |
| D | Jumat | Legi | 11 | 0 | **1** ✅ | 6 | 0 | 1 ✅ |
| E | Sabtu | Legi | 14 | 3 | **5** ✅ | 9 | 3 | 5 ✅ |
| F | Sabtu | Kliwon | 17 | 1 | **4** ✅ | 9 | 3 | 5 ❌ |

Hanya **neptu weton** (hari + pasaran) yang mereproduksi C1 di keenam baris.
Memakai neptu hari saja membuat **4 dari 6 baris salah**.

### Keputusan

Modul `src/shared/weton.js` memakai **neptu weton** hari-H. Field dinamai
`neptuWetonH`, bukan `neptuHari`.

### Konsekuensi

- Kolom database `kandidat_tanggal.neptu_hari_h` (Panduan bagian 9) sebaiknya
  di-rename menjadi `neptu_weton_h` agar tidak menyesatkan.
- **Perbaiki header Tabel 7.1 di laporan** menjadi "Neptu Weton hari-H".
- Ini poin bagus untuk ditanyakan saat presentasi — menunjukkan ketelitian.

**Status:** perlu konfirmasi ke dosen / Agni sebelum laporan final.

---

## 2. Pemetaan skor weton tidak natural

```
sisa 3 -> skor 5   (paling baik)
sisa 1 -> skor 4
sisa 2 -> skor 3
sisa 4 -> skor 2
sisa 0 -> skor 1
```

Urutannya **tidak** mengikuti sisa secara berurutan. Karena itu:

- Disimpan sebagai tabel `ATURAN_WETON` di `constants.js`
- Dipetakan lewat fungsi `skorWetonDariSisa()`
- **Jangan** diganti dengan `if-else` berderet — mudah salah

---

## 3. WP: biaya harus dalam JUTA rupiah

Pangkat negatif pada kriteria cost sangat sensitif terhadap skala.

```
biaya = 40     -> 40^-0.10  = 0.6915
biaya = 40000000 -> 40000000^-0.10 = 0.1668
```

Jika satuan berubah dari juta ke rupiah penuh, hasil S berubah drastis dan
**tidak akan cocok dengan Tabel 7.2**. Satuan wajib konsisten: **juta rupiah**.

---

## 4. Lapisan data (adapter pattern) — mencegah rework

**Aturan:** komponen React tidak boleh mengakses Firestore langsung.

```
Komponen  →  src/data/index.js  →  mockAdapter.js   (sekarang)
                                →  firebaseAdapter.js (nanti)
```

Semua fungsi adapter **async**, meskipun mock-nya instan. Ini supaya signature
tidak berubah saat backend siap.

Ganti adapter cukup di **satu baris** di `src/data/index.js`.

**Kontrak lengkap:** `src/data/kontrak.js` (13 fungsi).

---

## 5. Mengapa `bobot_dm` harus per-acara

Panduan bagian 9 menempatkan `acara_id` di tabel `bobot_dm`. Ini penting karena
uji **T9** meminta: ganti bobot satu DM, lalu hitung ulang di **acara baru**.

Jika bobot disimpan global per user, riwayat acara lama akan berubah — salah.

---

## 6. Hasil final dihitung SEKALI

Panduan bagian 8: *"Hasil final dihitung sekali, disimpan di database, lalu
dibaca oleh ketiga akun. Jangan dihitung ulang terpisah di tiap browser."*

Implementasi:

1. Ketiga DM kirim penilaian → status `Penilaian` selesai
2. Server (Cloud Function / transaction) memanggil `hitungBorda()`
3. Hasil ditulis ke koleksi `voting_hasil` — **sekali saja**
4. Halaman Hasil di ketiga akun **membaca** dokumen itu, tidak menghitung

`hitungBorda()` dipakai di server, **bukan** di komponen.

---

## 7. Aturan seri

Seri dimenangkan kandidat yang **lebih tinggi di ranking Sesepuh**.

Di `hitungBorda()`, pengurutan memakai:

```js
b.totalPoin - a.totalPoin                    // poin menurun
|| a.rankingPerDm.sesepuh - b.rankingPerDm.sesepuh   // seri: Sesepuh lebih tinggi
```

Perbandingan memakai toleransi `1e-9` agar galat floating point tidak
menghasilkan urutan acak.

---

## 8. SAW dilarang

Panduan poin 4 tugas menyebutkan penilaian individual **tidak boleh SAW**.
Referensi skripsi UMK tentang weton memakai SAW — boleh dijadikan inspirasi
tema, **jangan tiru metodenya**.

`src/tests/acuan.test.js` mengunci perilaku WP. Jika ada yang mengganti rumus
menjadi penjumlahan terbobot, test T2 akan gagal.

---

## 9. Firebase: yang aman vs berbahaya

| Item | Status |
|---|---|
| `apiKey` Firebase di frontend | ✅ Aman dipublikasikan (desain Firebase) |
| `serviceAccountKey.json` | ⛔ **SANGAT BERBAHAYA** — bisa hapus database |
| `.env` berisi secret | ⛔ Jangan commit |
| Firestore rules | ✅ Wajib ditulis, jangan `allow read, write: if true` |

Semua sudah masuk `.gitignore`.

---

## 10. Keputusan yang masih terbuka

| # | Hal | Perlu konfirmasi ke |
|---|---|---|
| 1 | Apakah bobot suara jabatan memenuhi "voting dari jabatan tertinggi" | Dosen |
| 2 | Apakah WP dan Borda boleh dipakai | Dosen |
| 3 | Apakah AI untuk membantu kode diperbolehkan | Dosen |
| 4 | Tanggal pengumpulan & format penilaian | Dosen |
| 5 | Rename `neptu_hari_h` → `neptu_weton_h` | Tim |
| 6 | TOPSIS sebagai pembanding (opsional) | Tim — **sarankan tidak dikerjakan** |

Catatan: tulisan "7-10-2026" di foto slide **sudah lewat**, bukan deadline.

---

## 11. Data contoh bukan kebenaran mutlak — fixture hanya ISI AWAL

### Masalah

Mesin WP dan Borda sudah generik (diuji dengan data rekaan: 4 kandidat P/Q/R/S,
bobot 25/25/20/15/15 → S = 1.4163 / 1.0038 / 1.0016 / 0.7001, ΣV = 1.000000,
dan Borda menghasilkan seri P–Q 19 poin yang dimenangkan P oleh aturan Sesepuh).
Tetapi **aplikasinya** belum bisa menerima data lain: `ACARA_CONTOH` dan
`KANDIDAT_TABEL_71` dipakai langsung, tanpa layar input.

### Keputusan

| Hal | Keputusan |
|---|---|
| Fixture `src/fixtures/dataAcuan.js` | **Tidak diubah.** Tetap dikunci 50 unit test untuk membuktikan Tabel 7.2/7.3 di laporan |
| Peran fixture | Hanya **isi awal** adapter, bukan satu-satunya sumber data |
| Data pengguna | Disimpan di `localStorage['dina-becik-data']` lewat `mockAdapter.js` |
| Skor C1 | **Tidak pernah diinput manual** — selalu `lengkapiKandidatWeton()` |
| Perubahan acara/kandidat | Memanggil `batalkanPenilaian()`: `terkirim`, `penilaian`, `hasilVoting` direset |
| Hapus kandidat | Minimal **2** harus tersisa, agar WP tetap bermakna |

Pemisahan ini disengaja: **fixture untuk pembuktian, adapter untuk data nyata.**
Saat `firebaseAdapter` aktif, pindah penyimpanan cukup di `src/data/index.js`.

### Konsekuensi

1. `localStorage` bersifat **per perangkat** — belum dibagi antar DM sampai
   Firestore tersambung (Issue #3, Alia). Setelah data diubah di satu peramban,
   DM lain tidak melihatnya.
2. Jumlah kriteria masih **dipaku 5** (C1–C5) di `constants.js`; yang bisa diubah
   pengguna hanya bobot, bukan daftar kriteria.
3. ID acara masih **satu**, `'acara-demo-2027'`, ditulis di `HalamanBobot.jsx`
   (2×), `HalamanPenilaian.jsx` (1×), dan `HalamanKelola.jsx` (1×). Multi-acara
   baru bisa setelah ID diambil dari acara aktif.
4. Tombol "Kembalikan data contoh" memanggil `resetDemo()` — berguna saat demo,
   tetapi menghapus data pengguna di peramban itu.

---

## 12. Panel Bukti Akurasi: angka laporan sebagai PEMBANDING, bukan masukan

### Masalah

Pengguna (dan dosen) perlu yakin bahwa aplikasi ini benar-benar menghitung,
bukan menampilkan angka yang sudah dipatok. Menampilkan "E = 35 poin" saja
tidak membuktikan apa pun — angka itu bisa saja ditulis mati di JSX.

### Keputusan

`src/components/PanelBuktiAkurasi.jsx` (dipasang di Dashboard):

1. Ambil **data contoh** Tabel 7.1 dari fixture (selalu data contoh, tidak
   terpengaruh data yang diisi pengguna).
2. Hitung **ulang** dengan `hitungWP()` dan `hitungBorda()` — fungsi yang sama
   persis dengan halaman Penilaian & Konsensus.
3. Bandingkan hasil hitung dengan angka Tabel 7.2/7.3.
4. Tampilkan berdampingan: angka hasil hitung (besar) + angka laporan (kecil)
   + tanda ✓/!.

Ada tombol "Hitung ulang" yang menjalankan mesin sekali lagi, dan penanda waktu
supaya terlihat panelnya benar-benar bekerja saat itu, bukan hasil render statis.

### Konsekuensi

- Panel ini berfungsi sebagai **alarm**: kalau ada yang merusak rumus, badge
  berubah dari "48/48 cocok" menjadi merah. Ini pelengkap 50 unit test, bukan
  penggantinya.
- Angka di kolom "laporan" **tidak pernah dipakai untuk menghitung apa pun** —
  hanya sebagai pembanding. Jadi tidak ada risiko sirkular (membandingkan angka
  dengan dirinya sendiri).
- Toleransi pembanding nilai S: `0.00005`, karena laporan menulis 4 desimal
  (selisih mentah terbesar yang terukur: 0.0000447).
- Total pemeriksaan: 6 kandidat × 3 DM × 2 (nilai S + ranking) + 6 × 2
  (poin + ranking final) = **48**.
