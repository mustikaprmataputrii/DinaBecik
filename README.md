# Dina Becik

**GDSS Penentuan Hari Baik Hajatan Berbasis Weton dan Logika Modern**

Website Group Decision Support System untuk memilih satu tanggal terbaik pelaksanaan
hajatan dari beberapa tanggal kandidat, dengan menggabungkan penilaian individual
(**Weighted Product**) dan konsensus voting berbobot jabatan (**Weighted Borda**).

> Praktikum Sistem Informasi · Kelompok 4 orang

---

## 1. Anggota & Pembagian Kerja

| Anggota | NIM | Peran | Folder utama |
|---|---|---|---|
| Agni Galuh Essa Vandriya | 240605110183 | Ketua & Logika Metode | `src/shared/`, `src/tests/` |
| Alia Julyanti | 240605110165 | Backend & Database | `src/data/`, `src/auth/` |
| Sri Mustika Indah Permata Putri | 240605110158 | Frontend & Desain | `src/pages/`, `src/components/`, `src/styles/` |
| Nadya Clarissa Azzahra | 240605110166 | Data, Weton & Dokumentasi | `src/fixtures/`, `docs/` |

| Anggota | GitHub | Branch |
|---|---|---|
| Agni | `@agnigaluhev-svg` | `feat/metode-agni` |
| Alia | `@al-11111` | `feat/backend-alia` |
| Sri | `@mustikaprmataputrii` | `feat/frontend-sri` |
| Nadya | `@nadyaclarisa` | `feat/data-nadya` |

Pembagian lengkap: **[docs/PEMBAGIAN-KERJA.md](docs/PEMBAGIAN-KERJA.md)**
Cara pakai Git: **[docs/ALUR-GIT.md](docs/ALUR-GIT.md)**

---

## 2. Cara Menjalankan

```bash
npm install
npm test          # jalankan 50 unit test acuan
npm run dev       # jalankan website (butuh React/Vite terpasang)
```

> **Catatan:** saat ini repo berisi **pondasi + modul perhitungan + test**.
> Scaffold React/Vite ditambahkan pada langkah berikutnya.

---

## 3. Struktur Repo

```
DinaBecik/
├── README.md                     ← kamu di sini
├── package.json
├── .gitignore
├── .env.example
│
├── docs/
│   ├── PEMBAGIAN-KERJA.md        ← siapa mengerjakan apa
│   ├── ALUR-GIT.md               ← cara pakai git & pull request
│   ├── CATATAN-TEKNIS.md         ← temuan & keputusan teknis
│   ├── FIRESTORE-RULES.md        ← aturan keamanan database
│   └── panduan-proyek.pdf        ← dokumen acuan dosen
│
├── .github/
│   ├── CODEOWNERS                ← penanda pemilik file
│   └── PULL_REQUEST_TEMPLATE.md
│
└── src/
    ├── shared/                   ← [AGNI] logika metode
    │   ├── constants.js          ← SINGLE SOURCE OF TRUTH
    │   ├── weton.js              ← hitungWeton, hitungSkorWeton
    │   ├── wp.js                 ← hitungWP
    │   └── borda.js              ← hitungBorda, cekGerbangVoting
    │
    ├── fixtures/                 ← [NADYA] data acuan
    │   └── dataAcuan.js          ← Tabel 7.1, 7.2, 7.3
    │
    ├── tests/                    ← [AGNI] uji kebenaran
    │   └── acuan.test.js         ← 50 test mengunci angka acuan
    │
    ├── data/                     ← [ALIA] lapisan data
    │   ├── kontrak.js            ← daftar fungsi wajib
    │   ├── index.js              ← TITIK GANTI adapter
    │   ├── mockAdapter.js        ← data tiruan (aktif sekarang)
    │   └── firebaseAdapter.js    ← Firestore (kerangka)
    │
    ├── auth/                     ← [ALIA] login & hak akses
    ├── styles/                   ← [SRI] design token
    │   └── tokens.js
    ├── pages/                    ← [SRI] halaman
    └── components/               ← [SRI] komponen
```

---

## 4. Aturan Wajib Proyek

Diambil dari panduan bagian 8. **Jangan dilanggar.**

1. **Bobot kriteria harus 100%.** Jika tidak, simpan ditolak.
2. **Penilaian yang sudah dikirim terkunci.** Tidak bisa diubah.
3. **DM tidak boleh menilai atas nama DM lain.**
4. **Voting hanya terbuka setelah KETIGA DM mengirim penilaian.**
5. **Hasil final dihitung SEKALI di server**, disimpan ke `voting_hasil`, lalu dibaca ketiga akun.
6. **Semua perhitungan di sisi server / fungsi bersama**, bukan di tampilan.
7. **SAW DILARANG.** Penilaian individual wajib Weighted Product.

---

## 5. Aturan Kerja Tim

### 5.1 Satu file = satu pemilik

Lihat `.github/CODEOWNERS`. Jangan mengedit file milik orang lain tanpa izin.
Jika butuh perubahan di file orang lain: buka Issue atau minta lewat chat.

### 5.2 Satu branch per orang

```
main                    ← selalu hijau (test lulus). Hanya diisi lewat PR.
feat/frontend-sri       ← Sri
feat/backend-alia       ← Alia
feat/metode-agni        ← Agni
feat/data-nadya         ← Nadya
```

Alur:

```bash
git checkout main
git pull
git checkout -b feat/frontend-sri     # sekali saja, di awal
# ...kerja...
git add .
git commit -m "feat(ui): halaman atur bobot"
git push -u origin feat/frontend-sri
# lalu buka Pull Request ke main
```

### 5.3 Format pesan commit

```
feat(ui): tambah halaman atur bobot
fix(wp): perbaiki pangkat kriteria cost
test(acuan): tambah uji T6 seri
docs(panduan): perbarui pembagian kerja
data(weton): lengkapi tabel neptu
```

Awalan: `feat`, `fix`, `test`, `docs`, `data`, `refactor`, `chore`.

### 5.4 Gerbang kualitas

**Jangan pernah merge ke `main` jika `npm test` gagal.**

Test di `src/tests/acuan.test.js` mengunci angka Tabel 7.2 & 7.3.
Kalau ada yang merusak rumus, test langsung merah.

---

## 6. Status Pondasi

| Komponen | Status |
|---|---|
| Konstanta bersama | ✅ Selesai |
| Modul weton & neptu | ✅ Selesai (teruji) |
| Modul Weighted Product | ✅ Selesai (teruji) |
| Modul Weighted Borda | ✅ Selesai (teruji) |
| Data acuan Tabel 7.1 | ✅ Selesai (terverifikasi) |
| Unit test 50 kasus | ✅ Lulus |
| Design token | ✅ Selesai |
| Lapisan data (mock) | ✅ Selesai |
| Scaffold React/Vite | ⬜ Belum |
| Firebase Auth | ⬜ Belum |
| Halaman-halaman | ⬜ Belum |

---

## 7. Acuan

- `docs/panduan-proyek.pdf` — Panduan Proyek Dina Becik v1.0, 11 Nov 2026
- `docs/CATATAN-TEKNIS.md` — keputusan & temuan teknis
