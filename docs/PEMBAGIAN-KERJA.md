# Pembagian Kerja Lengkap — Dina Becik

> Acuan: Panduan Proyek bagian 11 & 12, disesuaikan dengan struktur repo.
> **Satu file = satu pemilik.** Jangan saling menimpa.

---

## Ringkasan Peran

| Anggota | Peran | Folder miliknya | Beban |
|---|---|---|---|
| **Agni** | Ketua & Logika Metode | `src/shared/`, `src/tests/` | Sedang, kritis |
| **Alia** | Backend & Database | `src/data/`, `src/auth/` | Sedang-berat |
| **Sri** | Frontend & Desain | `src/pages/`, `src/components/`, `src/styles/` | **Terbesar** |
| **Nadya** | Data, Weton & Dokumentasi | `src/fixtures/`, `docs/` | Sedang |

---

## AGNI — Ketua & Logika Metode

### File yang kamu miliki

```
src/shared/constants.js      ← sumber kebenaran semua nilai
src/shared/weton.js          ← hitungWeton, hitungSkorWeton
src/shared/wp.js             ← hitungWP, normalisasiBobot
src/shared/borda.js          ← hitungBorda, cekGerbangVoting
src/tests/acuan.test.js      ← 50 test pengunci kebenaran
docs/EXCEL-ACUAN.md          ← dokumentasi hitungan Excel
```

### Tugas

| # | Tugas | Target | Status |
|---|---|---|---|
| A1 | Verifikasi fungsi WP/Borda terhadap Tabel 7.2 & 7.3 | Minggu 1 | ✅ Selesai (50 test lulus) |
| A2 | Buat Excel acuan terpisah (bukti hitung manual) | Minggu 1 | ⬜ |
| A3 | Kunci kriteria & bobot final setelah konfirmasi dosen | Minggu 1 | ⬜ |
| A4 | Tinjau hasil hitung di database (peninjau silang untuk Alia) | Minggu 2–4 | ⬜ |
| A5 | Jaga jadwal & pimpin rapat 2×/minggu | Minggu 1–5 | ⬜ |
| A6 | Tulis bagian metode pada laporan | Minggu 5 | ⬜ |

### Yang kamu jaga

- **`constants.js` tidak boleh diubah tanpa persetujuan seluruh kelompok.** Semua modul bergantung padanya.
- Test di `src/tests/` adalah **alarm kelompok**. Jika merah, jangan merge.
- Pastikan tidak ada yang diam-diam mengganti WP dengan SAW.

### Pertanyaan yang harus kamu bisa jawab saat presentasi

- Mengapa WP, bukan SAW?
- Mengapa pangkat biaya negatif?
- Mengapa Borda memakai bobot jabatan?
- Bagaimana seri ditentukan?

---

## ALIA — Backend & Database

### File yang kamu miliki

```
src/data/kontrak.js          ← daftar fungsi wajib
src/data/index.js            ← titik ganti adapter
src/data/mockAdapter.js      ← SUDAH ADA (jangan rusak, dipakai Sri)
src/data/firebaseAdapter.js  ← kerangka, isi ini
src/auth/                    ← login & hak akses
docs/FIRESTORE-RULES.md      ← aturan keamanan
.env.example
```

### Tugas

| # | Tugas | Target | Status |
|---|---|---|---|
| B1 | Buat Firebase project + 3 akun Auth | Minggu 2 | ⬜ |
| B2 | Implementasi `firebaseAdapter.js` (13 fungsi) | Minggu 2 | ⬜ |
| B3 | Tulis Firestore rules (DM tidak bisa nilai atas nama lain) | Minggu 2 | ⬜ |
| B4 | Halaman login + hak akses per peran | Minggu 2 | ⬜ |
| B5 | Status acara (Draft→Penilaian→Voting→Selesai) | Minggu 2–3 | ⬜ |
| B6 | Kunci penilaian terkirim (tidak bisa diubah) | Minggu 3 | ⬜ |
| B7 | Gerbang voting (terbuka hanya jika 3 DM kirim) | Minggu 4 | ⬜ |
| B8 | Simpan `voting_hasil` sekali via transaction/Cloud Function | Minggu 4 | ⬜ |
| B9 | Uji T1, T4, T7, T8 | Minggu 4–5 | ⬜ |

### Kontrak yang WAJIB kamu patuhi

Signature 13 fungsi di `src/data/kontrak.js` **tidak boleh berubah**. Sri sudah
membangun halaman di atas signature itu. Kalau kamu mengubahnya, frontend rusak.

Semua fungsi **harus async**, meskipun datanya instan.

### Bahaya keamanan

⛔ **JANGAN PERNAH commit `serviceAccountKey.json`.** File itu bisa menghapus
seluruh database. Sudah masuk `.gitignore` — jangan di-force add.

✅ `apiKey` Firebase di frontend **aman** dipublikasikan. Itu desain Firebase.

### Peninjau kamu

**Agni** meninjau hasil hitung di database sebelum dianggap selesai.

---

## SRI — Frontend & Desain (KAMU)

### File yang kamu miliki

```
src/pages/          ← semua halaman
src/components/     ← semua komponen UI
src/styles/         ← design token
public/             ← aset gambar, motif batik
```

### Tugas

| # | Tugas | Prioritas | Target | Status |
|---|---|---|---|---|
| S1 | Design token + layout dasar (navbar, footer) | Wajib | Minggu 1 | 🟡 Token selesai |
| S2 | Halaman Login (3 peran) | Wajib | Minggu 1–2 | ⬜ |
| S3 | Dashboard (status acara + status 3 DM) | Wajib | Minggu 2 | ⬜ |
| S4 | Halaman Data Acara & Kandidat | Wajib | Minggu 2 | ⬜ |
| S5 | Halaman Atur Bobot (5 slider + validasi 100%) | Wajib | Minggu 3 | ⬜ |
| S6 | Halaman Hasil Penilaian Saya (tabel S, V, ranking + Kirim) | Wajib | Minggu 3 | ⬜ |
| S7 | Halaman Konsensus & Hasil (kartu pemenang + tabel Borda) | Wajib | Minggu 4 | ⬜ |
| S8 | Grafik perbandingan ranking | Plus | Minggu 5 | ⬜ |
| S9 | Kalender visual dengan weton | Plus | Minggu 5 | ⬜ |
| S10 | Ekspor PDF | Plus | Minggu 5 | ⬜ |
| S11 | Riwayat keputusan | Plus | Minggu 5 | ⬜ |
| S12 | Komentar DM + countdown hari-H | Plus | Minggu 5 | ⬜ |

### Kamu bisa mulai SEKARANG tanpa menunggu siapa pun

Semua data sudah tersedia. Pakai lapisan data yang sudah ada:

```js
import { getKandidat, getPenilaianDm, getHasilVoting } from '../data/index.js';

// Data kandidat (Tabel 7.1) — sudah lengkap dengan weton
const kandidat = await getKandidat();

// Hasil WP untuk satu DM — angka Tabel 7.2
const penilaian = await getPenilaianDm('acara-demo-2027', 'sesepuh');

// Hasil konsensus — angka Tabel 7.3
const hasil = await getHasilVoting();
```

**Jangan pernah** mengakses Firestore langsung dari komponen. Selalu lewat
`src/data/index.js`. Itu yang membuat kamu tidak perlu rework saat backend siap.

### Aturan desain

- ❌ **Jangan hardcode warna.** Import dari `src/styles/tokens.js`.
- ✅ Angka pakai `FONT.angka` (monospace) agar kolom rata.
- ✅ Motif batik opacity maksimal 0.06 — angka harus tetap terbaca.
- ✅ Warna status konsisten: Draft abu, Penilaian biru, Voting emas, Selesai hijau.

### Peninjau kamu

Kamu meninjau **Nadya** (data & tampilan hasil).

---

## NADYA — Data, Weton & Dokumentasi

### File yang kamu miliki

```
src/fixtures/dataAcuan.js    ← Tabel 7.1/7.2/7.3
docs/                        ← laporan, slide, naskah demo
docs/panduan-proyek.pdf      ← acuan
```

### Tugas

| # | Tugas | Target | Status |
|---|---|---|---|
| N1 | Verifikasi tabel neptu hari & pasaran | Minggu 1 | ✅ (sudah diverifikasi Agni) |
| N2 | Verifikasi aturan skor weton (sisa → skor) | Minggu 1 | ✅ |
| N3 | Verifikasi data dummy 6 kandidat Tabel 7.1 | Minggu 1 | ✅ |
| N4 | Tambah data uji skenario SERI (untuk T6) | Minggu 1 | ✅ (`src/fixtures/dataUjiSeri.js`) |
| N5 | Tulis latar belakang & landasan teori laporan | Minggu 2–3 | ⬜ |
| N6 | Susun slide presentasi | Minggu 4–5 | ⬜ |
| N7 | Tulis naskah demo 7 menit | Minggu 5 | ⬜ |
| N8 | Kumpulkan referensi (Borda, WP, weton) | Minggu 3 | ⬜ |

### Catatan penting untuk kamu

⚠️ **Jangan mengubah `src/fixtures/dataAcuan.js`.** File itu dikunci oleh 50 unit
test. Jika diubah, test merah dan seluruh kelompok terblokir.

Jika butuh data uji baru (misalnya skenario seri), buat file **terpisah**:
`src/fixtures/dataUjiSeri.js`

### Peninjau kamu

**Sri** meninjau data & tampilan hasil.

---

## Jadwal 5 Minggu

| Minggu | Tanggal | Fokus | PJ utama |
|---|---|---|---|
| 1 | 11–17 Nov | Kunci judul, rancangan, data, hitungan acuan, mockup | **Agni, Nadya, Sri** |
| 2 | 18–24 Nov | Database, login 3 akun, hak akses, halaman data acara | Alia, Sri |
| 3 | 25 Nov–1 Des | Atur bobot, WP, status sudah/belum menilai | Alia, Agni, Sri |
| 4 | 2–8 Des | Weighted Borda, aturan seri, halaman hasil semua akun | Agni, Alia, Sri |
| 5 | 9–15 Des | Fitur plus, perbaikan bug, laporan, slide, latihan demo | Semua |

**Deadline resmi dari dosen: ______________** (masih perlu dikonfirmasi)

Jika waktu mepet, pertahankan hanya inti: login 3 akun → WP → Borda → hasil di
semua akun. Fitur plus dikorbankan lebih dulu.

---

## Peninjauan Silang

```
Agni  ──meninjau──►  Alia   (hasil hitung di database)
Sri   ──meninjau──►  Nadya  (data & tampilan hasil)
Alia  ──meninjau──►  Sri    (apakah UI memakai data adapter, bukan Firestore langsung)
Nadya ──meninjau──►  Agni   (apakah laporan sesuai angka acuan)
```

Pekerjaan baru dianggap **selesai** setelah peninjau menyetujui.

---

## Checklist Sebelum Presentasi

Setiap anggota harus bisa menjawab:

- [ ] Mengapa memakai WP, bukan SAW?
- [ ] Mengapa Borda berbobot jabatan?
- [ ] Bagaimana seri ditentukan?
- [ ] Dari mana data dummy berasal?
- [ ] Mengapa hasil harus dihitung di server, bukan browser?

Dan kelompok harus lulus:

- [ ] T1 Login 3 akun + akun salah ditolak
- [ ] T2 WP = Tabel 7.2 sampai 4 desimal
- [ ] T3 Bobot bukan 100% ditolak
- [ ] T4 Voting terkunci saat baru 2 DM kirim
- [ ] T5 Pemenang E, 35 poin
- [ ] T6 Seri dimenangkan ranking Sesepuh
- [ ] T7 Hasil identik di 3 browser
- [ ] T8 Penilaian terkirim tidak bisa diubah
- [ ] T9 Ganti bobot 1 DM tidak mempengaruhi DM lain
- [ ] T10 Ekspor PDF = isi layar
