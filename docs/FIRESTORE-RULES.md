# Firestore Security Rules — Dina Becik

> PEMILIK: **Alia** (Backend & Database)
> File ini adalah rancangan. Salin ke `firestore.rules` saat Firebase disiapkan.

---

## Prinsip

1. **Satu akun = satu decision maker.** Tidak ada akun ke-4.
2. **DM hanya boleh menulis datanya sendiri.** Tidak bisa menilai atas nama DM lain.
3. **Penilaian yang sudah terkirim terkunci.** Tidak bisa diubah.
4. **`voting_hasil` hanya ditulis server**, tidak boleh dari browser.
5. **Bobot wajib total 100%** — divalidasi di server juga, bukan hanya UI.

---

## Rancangan Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // ---------- Helper ----------
    function sudahLogin() {
      return request.auth != null;
    }

    // Peran diambil dari dokumen users/{uid}, bukan dari klaim klien.
    function peranSaya() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.peran;
    }

    function adalahDm() {
      return sudahLogin() && peranSaya() in ['sesepuh', 'orangtua', 'wo'];
    }

    function hanyaSesepuh() {
      return adalahDm() && peranSaya() == 'sesepuh';
    }

    // ---------- users ----------
    // Hanya bisa membaca datanya sendiri. Tidak ada pendaftaran mandiri.
    match /users/{uid} {
      allow read: if sudahLogin() && request.auth.uid == uid;
      allow write: if false;   // dibuat lewat seed/admin saja
    }

    // ---------- acara ----------
    match /acara/{acaraId} {
      allow read: if adalahDm();

      // Hanya Sesepuh yang membuat acara.
      allow create: if hanyaSesepuh();

      // Hanya Sesepuh yang mengubah data acara.
      allow update: if hanyaSesepuh();

      allow delete: if false;  // acara tidak dihapus, hanya diarsipkan

      // ---------- kandidat ----------
      match /kandidat/{kandidatId} {
        allow read: if adalahDm();
        allow write: if hanyaSesepuh();
      }

      // ---------- bobot per DM ----------
      match /bobot/{uid} {
        allow read: if adalahDm();

        // Hanya DM itu sendiri yang boleh menulis bobotnya.
        allow write: if adalahDm() && request.auth.uid == uid;

        // Catatan: validasi total 100% TIDAK bisa dilakukan di rules
        // (rules tidak bisa menjumlahkan field secara dinamis dengan aman).
        // Lakukan validasi di Cloud Function / sisi aplikasi.
      }

      // ---------- penilaian per DM ----------
      match /penilaian/{uid} {
        allow read: if adalahDm();

        // Hanya DM itu sendiri, dan HANYA jika belum pernah mengirim.
        // Ini yang mengunci penilaian terkirim (uji T8).
        allow create: if adalahDm()
                      && request.auth.uid == uid
                      && request.resource.data.status_kirim == false;

        allow update: if adalahDm()
                      && request.auth.uid == uid
                      && resource.data.status_kirim == false;

        allow delete: if false;
      }

      // ---------- hasil voting ----------
      // Hanya server (Cloud Function dengan admin SDK) yang menulis.
      // Klien hanya membaca. Ini memenuhi "hasil dihitung sekali".
      match /voting_hasil/{kandidatId} {
        allow read: if adalahDm();
        allow write: if false;   // ditulis admin SDK, bypass rules
      }

      // ---------- komentar ----------
      match /komentar/{komentarId} {
        allow read: if adalahDm();
        allow create: if adalahDm()
                      && request.resource.data.user_id == request.auth.uid;
        allow update, delete: if false;
      }
    }

    // ---------- referensi (neptu, aturan weton) ----------
    match /referensi/{dokumen} {
      allow read: if adalahDm();
      allow write: if false;   // diisi lewat seed
    }

    // ---------- default: tolak semua ----------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Uji Keamanan yang Wajib Dilakukan

| ID | Skenario | Hasil diharapkan |
|---|---|---|
| T1 | Login akun salah | Ditolak |
| T8a | DM mengubah penilaian yang sudah `status_kirim: true` | Ditolak rules |
| T8b | DM menulis ke `penilaian/{uid_lain}` | Ditolak rules |
| T8c | WO menulis ke `acara/{id}` | Ditolak rules |
| T8d | Klien menulis ke `voting_hasil` | Ditolak rules |
| T8e | Pengguna tanpa login membaca `acara` | Ditolak rules |

---

## Yang TIDAK boleh dilakukan

```
// ⛔ JANGAN PERNAH
allow read, write: if true;

// ⛔ JANGAN PERNAH
allow read, write: if request.auth != null;
```

Dua pola di atas membuat siapa pun yang login bisa mengubah data siapa pun —
dan melanggar aturan "DM tidak bisa menilai atas nama DM lain".
