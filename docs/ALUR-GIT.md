# Alur Git untuk Tim — Dina Becik

> Baca ini sekali di awal. Setelah itu kerja jadi lancar.

---

## 1. Peta Branch

```
main                  ← integrasi; masuk hanya lewat Pull Request. CI: 67 test root + 5 test Worker.
├── feat/metode-agni    ← Agni   (logika metode)
├── feat/backend-alia   ← Alia   (backend & database)
├── feat/frontend-sri   ← Sri    (frontend & desain)
└── feat/data-nadya     ← Nadya  (data & dokumentasi)
```

Branch `feat/*` menunjukkan kepemilikan kerja, bukan status apakah tugasnya
masih terbuka. Per 16 November 2026, frontend masuk lewat PR #9, data Excel
lewat PR #8, metode/test lewat PR #10, dan backend lewat PR #12 (menggantikan
PR #6). PR tugas tertentu juga dapat memakai branch `docs/*`, `fix/*`, atau
`gabung/*`; semua perubahan tetap digabung ke `main` melalui Pull Request.

**Aturan:** setiap orang **hanya** push ke branch-nya sendiri. Jangan pernah push
langsung ke `main`.

Status saat ini: fondasi, frontend, Excel acuan, dan backend telah digabung ke
`main` melalui PR. Sinkronkan branch kerja dengan `origin/main` sebelum memulai
pekerjaan baru.

---

## 2. Setup Awal (sekali saja per orang)

```bash
# 1. Clone repo
git clone https://github.com/mustikaprmataputrii/DinaBecik.git
cd DinaBecik

# 2. Install dependensi root dan Worker
npm ci
npm ci --prefix worker

# 3. Pastikan semua test sehat: 67 test aplikasi + 5 test Worker
npm test
npm test --prefix worker

# 4. Pindah ke branch kamu sendiri
git checkout feat/data-nadya       # ganti sesuai branch kerjamu
```

> ⚠️ Jika PowerShell menolak `npm`, gunakan `npm.cmd` untuk perintah di atas.

---

## 3. Alur Kerja Harian

```bash
# 1. Mulai hari: ambil main terbaru ke branch kerjamu
git fetch origin
git checkout feat/data-nadya       # ganti sesuai branch kerjamu
git merge origin/main

# 2. Kerja... edit file...

# 3. Jalankan semua test sebelum commit
npm test
npm test --prefix worker

# 4. Simpan
git add .
git commit -m "feat(ui): tambah halaman atur bobot"
git push
```

**Commit kecil dan sering.** Jangan menumpuk 3 hari kerja dalam 1 commit.

---

## 4. Format Pesan Commit

```
feat(ui): tambah halaman atur bobot
fix(wp): perbaiki pangkat kriteria cost
test(acuan): tambah uji T6 seri
docs(panduan): perbarui pembagian kerja
data(weton): lengkapi tabel neptu
refactor(shared): pisahkan fungsi pembulatan
chore(deps): perbarui vitest
```

Pola: `tipe(area): deskripsi singkat`

| Tipe | Kapan dipakai |
|---|---|
| `feat` | fitur baru |
| `fix` | perbaikan bug |
| `test` | menambah/memperbaiki test |
| `docs` | dokumentasi |
| `data` | data fixture / weton |
| `refactor` | merapikan kode tanpa ubah perilaku |
| `chore` | konfigurasi, dependensi |

---

## 5. Pull Request ke `main`

Setelah bagian kamu selesai (atau ingin digabung):

1. Buka https://github.com/mustikaprmataputrii/DinaBecik
2. Klik **Compare & pull request** pada branch kamu
3. Isi template PR yang sudah tersedia (checklist otomatis muncul)
4. Tunggu peninjau silang menyetujui:

```
Agni  ──meninjau──►  Alia   (hasil hitung di database)
Sri   ──meninjau──►  Nadya  (data & tampilan hasil)
Alia  ──meninjau──►  Sri    (UI pakai adapter, bukan Firestore langsung)
Nadya ──meninjau──►  Agni   (laporan sesuai angka acuan)
```

5. Setelah disetujui → **Merge**

---

## 6. Kalau Ada Konflik

Konflik terjadi kalau dua orang mengubah **file yang sama**. Ini kenapa aturan
"satu file = satu pemilik" penting.

```bash
git checkout feat/frontend-sri
git merge main
# CONFLICT (content): Merge conflict in src/pages/...
```

Buka file yang konflik, cari tanda:

```
<<<<<<< HEAD
versi kamu
=======
versi dari main
>>>>>>> main
```

Pilih yang benar (atau gabungkan), hapus tanda `<<<<<<<`, `=======`, `>>>>>>>`,
lalu:

```bash
git add .
git commit -m "fix(merge): selesaikan konflik di halaman bobot"
git push
```

**Kalau ragu:** tanya pemilik file tersebut. Jangan menimpa pekerjaan orang lain.

---

## 7. Yang TIDAK Boleh Dilakukan

| ⛔ Jangan | Kenapa |
|---|---|
| `git push origin main` langsung | `main` harus selalu hijau, hanya lewat PR |
| `git push --force` | Menghapus commit orang lain |
| Edit file milik orang lain tanpa izin | Bikin konflik & kerja dobel |
| Commit `node_modules/` | Sudah diblokir `.gitignore` — jangan di-force add |
| Commit `.env` atau `serviceAccountKey.json` | **Bocor = database bisa dihapus** |
| Merge saat `npm test` atau `npm test --prefix worker` gagal | Merusak fondasi seluruh kelompok |
| Ubah `src/fixtures/dataAcuan.js` | Dikunci 51 test acuan. Bikin file baru jika butuh data uji |
| Ubah `src/shared/constants.js` sendirian | Mempengaruhi semua modul. Diskusikan dulu |

---

## 8. Perintah yang Sering Dipakai

```bash
git status                    # apa yang berubah
git branch                    # saya di branch mana
git log --oneline -5          # 5 commit terakhir
git diff                      # detail perubahan belum di-commit
git checkout -- namafile      # batalkan perubahan pada satu file
git stash                     # simpan sementara perubahan
git stash pop                 # ambil kembali
git pull                      # ambil update
npm test                      # 67 test aplikasi
npm test --prefix worker      # 5 test backend Worker
npm run build                 # verifikasi build frontend
```

---

## 9. Kalau Bingung

1. `git status` — biasanya langsung menjawab
2. Baca `docs/PEMBAGIAN-KERJA.md` — file mana milik siapa
3. Tanya di grup sebelum menjalankan perintah yang merusak
4. **Jangan pernah** `git push --force` kalau belum yakin
