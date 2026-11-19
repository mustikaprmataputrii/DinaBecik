# Firestore Rules & Backend Gratis

> PEMILIK: **Alia** (Backend & Database)

## Firestore Rules

Sumber rules untuk project adalah [`../firestore.rules`](../firestore.rules). Rules ini sudah di-deploy ke project `dinabecik-e6096`. Profil hanya dapat dibaca pemiliknya, bobot divalidasi total 100%, dan browser tidak dapat menulis penilaian maupun hasil voting.

Perubahan status serta submit penilaian diproses backend tepercaya. Backend alternatif untuk paket Firebase Spark ada di [`../worker/`](../worker/README.md): Cloudflare Worker Free memverifikasi token Firebase, menghitung WP/Borda, lalu menulis melalui Firestore REST API dengan service account yang disimpan sebagai secret Cloudflare.

## Status acara

Alur backend: `Draft → Penilaian → Voting → Selesai`.

- Sesepuh memulai penilaian dari `Draft`.
- Setiap DM hanya dapat mengirim penilaiannya sekali.
- Kiriman DM ketiga mengubah status menjadi `Voting`; Worker menghitung dan menyimpan hasil satu kali lalu mengubah status menjadi `Selesai`.

## Catatan audit dependency

`npm audit` sebelumnya melaporkan 4 advisory high pada `@grpc/grpc-js@1.9.16`, dependency transitif dari Firebase Firestore SDK. Aplikasi memakai Firebase Web SDK di browser; hasil `vite build` tidak memuat implementasi gRPC Node. Cloudflare Worker mengakses Firestore melalui REST dan tidak memakai `@grpc/grpc-js`.

Sejak PR #21, `package.json` memakai `overrides` untuk `@grpc/grpc-js@^1.14.7` (di luar rentang advisory `<=1.13.5`). Firebase tetap `^13.3.0` — tidak ada downgrade. Kompatibilitas sudah diuji: `npm test` 67/67, `npm --prefix worker test` 5/5, `npm run build` OK, dan bundle browser tetap bebas implementasi gRPC. Hasil `npm audit` sekarang **0 vulnerability**.

Kalau Firebase SDK diperbarui, jalankan ulang `npm audit`, `npm test`, dan `npm run build` sebelum mengubah `overrides`.

## Uji lokal

Jalankan unit test Worker dari folder `worker`:

```bash
npm test
npm run deploy -- --dry-run
```

Jangan simpan service-account key atau `.dev.vars` di repo. Jangan membuka rules agar browser dapat menulis ke `penilaian` atau `voting_hasil`.
