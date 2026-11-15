# Dina Becik API — Cloudflare Workers Free

Backend ini mempertahankan Firebase Spark untuk Authentication dan Firestore. Worker melakukan verifikasi ID token Firebase, menghitung WP dan Borda, serta menggunakan transaksi Firestore REST agar hasil hanya tersimpan sekali.

## Penyiapan sekali saja

1. Buat/login akun Cloudflare dan pasang Wrangler: `npm install` dari folder `worker`.
2. Di Google Cloud Console project `dinabecik-e6096`, buat service account khusus Worker dengan role **Cloud Datastore User** (`roles/datastore.user`). Jangan gunakan service-account key Firebase Admin yang lebih kuat.
3. Buat JSON key untuk service account tersebut secara lokal. Jangan commit atau kirim key ke chat.
4. Login Wrangler dengan `npx wrangler login`, lalu simpan JSON key langsung sebagai Worker secret:

   ```powershell
   Get-Content -Raw "C:\path\di\luar\repo\worker-service-account.json" | npx wrangler secret put FIREBASE_SERVICE_ACCOUNT
   ```

   Secret hanya dikirim ke Cloudflare; file JSON tetap di luar repo.

5. Deploy Worker:

   ```bash
   npm run deploy
   ```

Wrangler menampilkan URL seperti `https://dina-becik-api.<subdomain>.workers.dev`.

## Sambungkan aplikasi

Tambahkan URL Worker ke `.env.local` di root repo (file ini diabaikan Git), lalu restart Vite:

```env
VITE_DINA_API_URL=https://dina-becik-api.<subdomain>.workers.dev
```

Endpoints yang dipakai aplikasi:

- `POST /api/start` — Sesepuh memulai acara berstatus Draft.
- `POST /api/submit` — mengirim penilaian WP. Setelah tiga DM mengirim, Worker menghitung Borda dan menyimpan hasil.
- `POST /api/finalize` — pemulihan idempoten jika proses finalisasi perlu diulang.

Semua endpoint memerlukan `Authorization: Bearer <Firebase ID token>`. Firestore Rules tetap menolak penulisan client langsung. Jangan beri service account role Owner; Worker hanya memerlukan akses data Firestore.

## Batas gratis

Worker Free memiliki batas request/CPU yang ditentukan Cloudflare. Penggunaan proyek kelas berskala kecil biasanya berada dalam batas tersebut; pantau usage di Cloudflare dashboard. Firebase Spark tetap tidak dipakai untuk Cloud Functions.
