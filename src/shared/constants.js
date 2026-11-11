/**
 * ============================================================================
 *  Dina Becik — KONSTANTA BERSAMA (SINGLE SOURCE OF TRUTH)
 * ============================================================================
 *  File ini adalah satu-satunya tempat nilai berikut boleh didefinisikan:
 *    - daftar kriteria & tipe (benefit/cost)
 *    - bobot awal tiap decision maker
 *    - bobot suara jabatan
 *    - tabel neptu hari & pasaran
 *    - aturan skor weton (C1)
 *    - status acara
 *    - bobot suara Borda
 *
 *  JANGAN menulis ulang nilai-nilai ini di file lain. Import dari sini.
 *  Acuan: Panduan Proyek Dina Becik bagian 4, 5, 6.1, 6.3, 8.
 * ============================================================================
 */

/* ---------------------------------------------------------------------------
 * 1. DECISION MAKER & BOBOT SUARA JABATAN  (Panduan bagian 4)
 * ------------------------------------------------------------------------- */

/** Bobot suara jabatan untuk Weighted Borda. Sesepuh tertinggi. */
export const BOBOT_JABATAN = Object.freeze({
  sesepuh: 3,
  orangtua: 2,
  wo: 1,
});

/** Daftar 3 decision maker. TIDAK ADA AKUN KE-4. */
export const DECISION_MAKERS = Object.freeze([
  {
    key: 'sesepuh',
    username: 'sesepuh',
    nama: 'Sesepuh Keluarga',
    jabatan: 'Jabatan tertinggi, penentu jika seri',
    bobotSuara: BOBOT_JABATAN.sesepuh,
    sudutPandang: 'Tradisi dan restu keluarga',
    kriteriaDitekankan: 'Weton/neptu',
  },
  {
    key: 'orangtua',
    username: 'orangtua',
    nama: 'Orang Tua / Penyelenggara',
    jabatan: 'Pemilik hajat',
    bobotSuara: BOBOT_JABATAN.orangtua,
    sudutPandang: 'Anggaran dan kenyamanan keluarga',
    kriteriaDitekankan: 'Biaya, tamu hadir',
  },
  {
    key: 'wo',
    username: 'wo',
    nama: 'Wedding Organizer',
    jabatan: 'Pelaksana teknis',
    bobotSuara: BOBOT_JABATAN.wo,
    sudutPandang: 'Kelayakan teknis di lapangan',
    kriteriaDitekankan: 'Ketersediaan gedung, cuaca',
  },
]);

/** Urutan DM tetap: dipakai untuk tampilan & penentuan seri. */
export const URUTAN_DM = Object.freeze(['sesepuh', 'orangtua', 'wo']);

/* ---------------------------------------------------------------------------
 * 2. KRITERIA  (Panduan bagian 5)
 * ------------------------------------------------------------------------- */

/**
 * Lima kriteria C1-C5.
 * `tipe` menentukan tanda pangkat pada Weighted Product:
 *   benefit -> pangkat +w
 *   cost    -> pangkat -w
 */
export const KRITERIA = Object.freeze([
  {
    kode: 'C1',
    key: 'weton',
    nama: 'Kecocokan weton/neptu',
    tipe: 'benefit',
    satuan: 'skala 1-5',
    sumber: 'dihitung otomatis dari tanggal',
    keteranganSkala: '5 = paling cocok menurut aturan weton',
  },
  {
    kode: 'C2',
    key: 'biaya',
    nama: 'Biaya gedung + katering',
    tipe: 'cost',
    satuan: 'juta rupiah',
    sumber: 'data dummy',
    keteranganSkala: 'Angka asli dalam juta rupiah (30-44 pada data acuan)',
  },
  {
    kode: 'C3',
    key: 'gedung',
    nama: 'Ketersediaan gedung',
    tipe: 'benefit',
    satuan: 'skala 1-5',
    sumber: 'data dummy',
    keteranganSkala: '5 = kosong dan mudah dipesan',
  },
  {
    kode: 'C4',
    key: 'cuaca',
    nama: 'Prakiraan cuaca/musim',
    tipe: 'benefit',
    satuan: 'skala 1-5',
    sumber: 'dari bulan acara',
    keteranganSkala: '5 = kemarau stabil, 1 = puncak hujan',
  },
  {
    kode: 'C5',
    key: 'tamu',
    nama: 'Potensi tamu hadir',
    tipe: 'benefit',
    satuan: 'skala 1-5',
    sumber: 'data dummy',
    keteranganSkala: '5 = akhir pekan/libur lebih tinggi',
  },
]);

/** Urutan key kriteria — dipakai untuk array vektor nilai & bobot. */
export const URUTAN_KRITERIA = Object.freeze(KRITERIA.map((k) => k.key));

/** Ambil kriteria berdasarkan kode (C1..C5). */
export function kriteriaByKode(kode) {
  return KRITERIA.find((k) => k.kode === kode);
}

/** Apakah kriteria berkode ini bertipe cost? */
export function isCost(kode) {
  const k = kriteriaByKode(kode);
  return Boolean(k && k.tipe === 'cost');
}

/* ---------------------------------------------------------------------------
 * 3. BOBOT AWAL PER DECISION MAKER  (Panduan bagian 5)
 * -------------------------------------------------------------------------
 *  Total tiap kolom HARUS 100%. Sistem menolak penyimpanan bila total != 100%.
 *  Tiap DM boleh mengubahnya di halaman "Atur Bobot".
 * ------------------------------------------------------------------------- */

/** Bobot bawaan dalam persen. Kunci: key DM -> { keyKriteria: persen } */
export const BOBOT_AWAL = Object.freeze({
  sesepuh: Object.freeze({ weton: 40, biaya: 10, gedung: 15, cuaca: 15, tamu: 20 }),
  orangtua: Object.freeze({ weton: 15, biaya: 35, gedung: 15, cuaca: 10, tamu: 25 }),
  wo: Object.freeze({ weton: 10, biaya: 20, gedung: 35, cuaca: 20, tamu: 15 }),
});

/** Total bobot harus sama dengan nilai ini (persen). */
export const TOTAL_BOBOT_WAJIB = 100;

/** Toleransi pembulatan untuk validasi total bobot. */
export const TOLERANSI_BOBOT = 0.01;

/* ---------------------------------------------------------------------------
 * 4. NEPTU HARI & PASARAN  (Panduan bagian 6.1)
 * ------------------------------------------------------------------------- */

/** Neptu tujuh hari. */
export const NEPTU_HARI = Object.freeze({
  Minggu: 5,
  Senin: 4,
  Selasa: 3,
  Rabu: 7,
  Kamis: 8,
  Jumat: 6,
  Sabtu: 9,
});

/** Neptu lima pasaran. */
export const NEPTU_PASARAN = Object.freeze({
  Legi: 5,
  Pahing: 9,
  Pon: 7,
  Wage: 4,
  Kliwon: 8,
});

/**
 * Urutan pasaran untuk perhitungan sisa bagi 5 dari tanggal.
 * sisa 0 = Wage, 1 = Kliwon, 2 = Legi, 3 = Pahing, 4 = Pon
 * Acuan: 1 Jan 1970 = Kamis Wage, 17 Agu 1945 = Jumat Legi.
 */
export const URUTAN_PASARAN = Object.freeze(['Wage', 'Kliwon', 'Legi', 'Pahing', 'Pon']);

/** Titik acuan perhitungan pasaran. */
export const TANGGAL_ACUAN = Object.freeze({
  tanggal: '1970-01-01',
  hari: 'Kamis',
  pasaran: 'Wage',
});

/**
 * ATURAN SKOR WETON (kriteria C1).
 * sisa = (neptu_pria + neptu_wanita + neptu_weton_hari_H) mod 5
 * Pemetaan sisa -> skor 1..5. PERHATIKAN: urutannya tidak natural.
 *   sisa 3 -> skor 5 (paling baik)
 *   sisa 1 -> skor 4
 *   sisa 2 -> skor 3
 *   sisa 4 -> skor 2
 *   sisa 0 -> skor 1
 * Disimpan sebagai tabel agar mudah diganti (tabel `aturan_weton` di database).
 * Acuan: tradisi Jawa umum; tafsir dapat berbeda antar daerah.
 */
export const ATURAN_WETON = Object.freeze([
  { sisa: 3, skor: 5, keterangan: 'Paling baik (mengacu primbon populer)' },
  { sisa: 1, skor: 4, keterangan: 'Baik' },
  { sisa: 2, skor: 3, keterangan: 'Cukup' },
  { sisa: 4, skor: 2, keterangan: 'Kurang' },
  { sisa: 0, skor: 1, keterangan: 'Paling kurang' },
]);

/** Cari skor C1 dari sisa bagi 5. */
export function skorWetonDariSisa(sisa) {
  const baris = ATURAN_WETON.find((a) => a.sisa === sisa);
  if (!baris) throw new Error(`Sisa weton tidak dikenal: ${sisa}`);
  return baris.skor;
}

/* ---------------------------------------------------------------------------
 * 5. STATUS ACARA  (Panduan bagian 8)
 * ------------------------------------------------------------------------- */

/**
 * Alur: Draft -> Penilaian -> Voting -> Selesai
 *   Draft      : acara & kandidat masih disiapkan. Berpindah saat Sesepuh klik "Mulai Penilaian".
 *   Penilaian  : DM mengatur bobot & mengirim penilaian. Berpindah saat KETIGA DM sudah kirim.
 *   Voting     : sistem menghitung konsensus. Berpindah saat perhitungan selesai & tersimpan.
 *   Selesai    : hasil final terkunci, tampil di semua akun.
 */
export const STATUS_ACARA = Object.freeze({
  DRAFT: 'Draft',
  PENILAIAN: 'Penilaian',
  VOTING: 'Voting',
  SELESAI: 'Selesai',
});

export const URUTAN_STATUS = Object.freeze([
  STATUS_ACARA.DRAFT,
  STATUS_ACARA.PENILAIAN,
  STATUS_ACARA.VOTING,
  STATUS_ACARA.SELESAI,
]);

/* ---------------------------------------------------------------------------
 * 6. ATURAN SISTEM YANG WAJIB DIPATUHI  (Panduan bagian 8)
 * ------------------------------------------------------------------------- */

export const ATURAN_SISTEM = Object.freeze([
  'Bobot kriteria harus berjumlah 100%. Jika tidak, simpan ditolak.',
  'Penilaian yang sudah dikirim terkunci. DM tidak bisa mengubahnya.',
  'DM tidak boleh menilai atas nama DM lain.',
  'Voting dan hasil hanya terbuka setelah KETIGA DM mengirim penilaian.',
  'Hasil final dihitung SEKALI di server, disimpan ke voting_hasil, lalu dibaca ketiga akun.',
  'Semua perhitungan dilakukan di sisi server / fungsi bersama, bukan hanya di tampilan.',
  'SAW DILARANG. Penilaian individual wajib memakai Weighted Product (WP).',
]);

/* ---------------------------------------------------------------------------
 * 7. METODE
 * ------------------------------------------------------------------------- */

export const METODE = Object.freeze({
  penilaianIndividual: 'Weighted Product (WP)',
  konsensus: 'Weighted Borda (voting berbobot jabatan)',
  penentuSeri: 'Ranking Sesepuh (jabatan tertinggi)',
  dilarang: 'Simple Additive Weighting (SAW)',
});

/** Pembulatan tampilan angka S/V/poin (desimal). */
export const DESIMAL_TAMPILAN = 4;

/** Presisi pembulatan internal untuk perbandingan seri. */
export const PRESISI_INTERNAL = 10;
