/**
 * ============================================================================
 *  Halaman: Kelola Data Acara (Semua Decision Maker — Hak Kelola per Peran)
 * ============================================================================
 *  Revisi pasca-presentasi dosen:
 *    1. Semua 3 akun DM (Sesepuh, Orang Tua, WO) mempunyai menu Kelola Data.
 *    2. Identitas hajatan & daftar kandidat tanggal HANYA dapat diisi/diubah
 *       oleh akun Sesepuh, lalu tersinkron ke semua akun.
 *    3. Biaya gedung + katering (C2) HANYA dapat diisi/diubah oleh akun
 *       Wedding Organizer (WO), lalu tersinkron ke semua akun.
 *    4. Tingkat nilai C1 (Weton), C3 (Gedung), C4 (Cuaca), dan C5 (Tamu)
 *       diisi oleh masing-masing DM (terpisah per DM) untuk perhitungan WP
 *       akun tersebut. Weton tetap dihitung otomatis sebagai acuan/nilai awal
 *       C1, namun tiap DM boleh menyesuaikannya (skala 1–5).
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu, BlokTeks } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import {
  getAcara,
  getKandidat,
  getPenilaianDm,
  simpanAcara,
  hapusKandidat,
  resetDemo,
  MENGGUNAKAN_FIREBASE,
} from '../data/index.js';
import {
  BACKEND_BIAYA_WO_SIAP,
  BACKEND_NILAI_DM_SIAP,
  ambilNilaiDm,
  bersihkanCacheLokalKelola,
  daftarMenungguBiayaWo,
  simpanBiayaWoFrontend,
  simpanNilaiDmFrontend,
  tambahKandidatSesepuh,
  ubahTanggalKandidatSesepuh,
} from '../components/nilaiKriteriaHelper.js';
import { hitungSkorWeton } from '../shared/weton.js';
import { KRITERIA, ATURAN_WETON, DECISION_MAKERS } from '../shared/constants.js';

const ACARA_ID = 'acara-demo-2027';

/** Format tanggal Indonesia. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Kelas pesan sesuai jenisnya. */
function gayaPesan(jenis) {
  if (jenis === 'sukses') return 'border-selesai-300 bg-selesai-50 text-selesai';
  if (jenis === 'galat') return 'border-bahaya-200 bg-bahaya-50 text-bahaya';
  return 'border-sogan-200 bg-krem-100/80 text-netral-600';
}

/** Pilih angka skala 1–5 yang ringkas untuk sel tabel. */
function PilihSkala({ ariaLabel, nilai, onUbah, nonaktif }) {
  return (
    <select
      aria-label={ariaLabel}
      value={String(nilai ?? 3)}
      disabled={nonaktif}
      onChange={(e) => onUbah(Number(e.target.value))}
      className="isian angka w-16 px-2 py-1 text-right text-xs font-semibold"
    >
      {[5, 4, 3, 2, 1].map((n) => (
        <option key={n} value={n}>
          {n}
        </option>
      ))}
    </select>
  );
}

export default function HalamanKelola({ sesi }) {
  const userId = sesi?.peran;
  const adalahSesepuh = userId === 'sesepuh';
  const adalahWo = userId === 'wo';
  const dm = DECISION_MAKERS.find((d) => d.key === userId);

  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [penilaianTerkunci, setPenilaianTerkunci] = useState(false);
  const [menungguBiaya, setMenungguBiaya] = useState(() => new Set());
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState(null); // { jenis, isi }

  // Form identitas acara (khusus Sesepuh)
  const [formAcara, setFormAcara] = useState(null);

  // Form kandidat tanggal (khusus Sesepuh): 'tambah' atau kode kandidat yang sedang diubah tanggalnya
  const [modeKandidat, setModeKandidat] = useState('tambah');
  const [tanggalKandidat, setTanggalKandidat] = useState('');

  // Form biaya C2 (khusus WO): { [kode]: string }
  const [formBiaya, setFormBiaya] = useState({});

  // Form nilai C1, C3, C4, C5 (semua DM): { [kode]: { weton, gedung, cuaca, tamu } }
  const [formNilai, setFormNilai] = useState({});

  const muat = useCallback(async () => {
    const [a, k, p] = await Promise.all([
      getAcara(ACARA_ID),
      getKandidat(ACARA_ID),
      getPenilaianDm(ACARA_ID, userId).catch(() => null),
    ]);
    const { peta } = await ambilNilaiDm(ACARA_ID, userId, k);

    setAcara(a);
    setKandidat(k);
    setPenilaianTerkunci(Boolean(p?.statusKirim));
    setMenungguBiaya(daftarMenungguBiayaWo(ACARA_ID));

    setFormAcara({
      nama_acara: a?.nama_acara ?? '',
      jenis: a?.jenis ?? 'pernikahan',
      neptu_pria: String(a?.neptu_pria ?? ''),
      neptu_wanita: String(a?.neptu_wanita ?? ''),
    });

    setFormBiaya(
      Object.fromEntries(k.map((item) => [item.kode, item.biaya != null ? String(item.biaya) : '']))
    );
    setFormNilai(peta);
    setMemuat(false);
  }, [userId]);

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        await muat();
      } catch {
        if (!batal) setMemuat(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, [muat]);

  /** Pratinjau weton otomatis untuk tanggal kandidat yang sedang diketik Sesepuh. */
  const pratinjauWeton = useMemo(() => {
    if (!tanggalKandidat || !acara) return null;
    try {
      return hitungSkorWeton(tanggalKandidat, acara.neptu_pria, acara.neptu_wanita);
    } catch {
      return null;
    }
  }, [tanggalKandidat, acara]);

  const sedangUbahTanggal = modeKandidat !== 'tambah';

  /* ---------------- aksi Sesepuh: identitas acara ---------------- */
  async function simpanIdentitas(e) {
    e.preventDefault();
    if (!adalahSesepuh) return;
    setSibuk(true);
    setPesan(null);
    try {
      await simpanAcara(ACARA_ID, {
        nama_acara: formAcara.nama_acara,
        jenis: formAcara.jenis,
        neptu_pria: Number(formAcara.neptu_pria),
        neptu_wanita: Number(formAcara.neptu_wanita),
      });
      await muat();
      setPesan({
        jenis: 'sukses',
        isi: 'Identitas hajatan tersimpan dan sinkron ke semua akun. Acuan skor weton semua kandidat dihitung ulang.',
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  /* ---------------- aksi Sesepuh: kandidat tanggal ---------------- */
  async function simpanTanggalKandidat(e) {
    e.preventDefault();
    if (!adalahSesepuh) return;
    setSibuk(true);
    setPesan(null);
    try {
      if (sedangUbahTanggal) {
        await ubahTanggalKandidatSesepuh(ACARA_ID, modeKandidat, tanggalKandidat);
        setPesan({
          jenis: 'sukses',
          isi: `Tanggal kandidat ${modeKandidat} diperbarui dan sinkron ke semua akun (biaya C2 dari WO tidak ditimpa).`,
        });
      } else {
        const baru = await tambahKandidatSesepuh(ACARA_ID, tanggalKandidat);
        setPesan({
          jenis: 'sukses',
          isi: `Kandidat ${baru.kode} (${baru.hari} ${baru.pasaran}, acuan C1 = ${baru.skorWeton}) ditambahkan. Biaya C2 menunggu isian akun Wedding Organizer.`,
        });
      }
      setModeKandidat('tambah');
      setTanggalKandidat('');
      await muat();
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  function mulaiUbahTanggal(k) {
    setModeKandidat(k.kode);
    setTanggalKandidat(k.tanggal);
    setPesan(null);
  }

  function batalUbahTanggal() {
    setModeKandidat('tambah');
    setTanggalKandidat('');
    setPesan(null);
  }

  async function hapus(kode) {
    if (!adalahSesepuh) return;
    setSibuk(true);
    setPesan(null);
    try {
      await hapusKandidat(ACARA_ID, kode);
      if (modeKandidat === kode) batalUbahTanggal();
      await muat();
      setPesan({ jenis: 'sukses', isi: `Kandidat ${kode} dihapus dan sinkron ke semua akun.` });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  async function kembalikanContoh() {
    if (!adalahSesepuh) return;
    setSibuk(true);
    setPesan(null);
    try {
      await resetDemo();
      bersihkanCacheLokalKelola();
      batalUbahTanggal();
      await muat();
      setPesan({
        jenis: 'info',
        isi: 'Data dikembalikan ke contoh Tabel 7.1 (6 kandidat, neptu 15 & 9).',
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  /* ---------------- aksi WO: biaya C2 ---------------- */
  async function simpanSatuBiaya(kode) {
    if (!adalahWo) return;
    setSibuk(true);
    setPesan(null);
    try {
      await simpanBiayaWoFrontend(ACARA_ID, kode, formBiaya[kode]);
      await muat();
      setPesan({
        jenis: 'sukses',
        isi: `Biaya C2 kandidat ${kode} (Rp ${formBiaya[kode]} juta) tersimpan dan sinkron ke semua akun DM.`,
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  async function simpanSemuaBiaya(e) {
    e.preventDefault();
    if (!adalahWo) return;
    setSibuk(true);
    setPesan(null);
    try {
      for (const k of kandidat) {
        await simpanBiayaWoFrontend(ACARA_ID, k.kode, formBiaya[k.kode]);
      }
      await muat();
      setPesan({
        jenis: 'sukses',
        isi: `Biaya C2 untuk ${kandidat.length} kandidat tersimpan dan sinkron ke semua akun DM.`,
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  /* ---------------- aksi semua DM: nilai C1, C3, C4, C5 ---------------- */
  function ubahNilaiSel(kode, key, nilai) {
    setFormNilai((lama) => ({
      ...lama,
      [kode]: {
        ...(lama[kode] ?? { weton: 3, gedung: 3, cuaca: 3, tamu: 3 }),
        [key]: nilai,
      },
    }));
    setPesan(null);
  }

  function samakanC1KeAcuanWeton() {
    setFormNilai((lama) => {
      const baru = { ...lama };
      for (const k of kandidat) {
        baru[k.kode] = {
          ...(baru[k.kode] ?? { gedung: k.gedung, cuaca: k.cuaca, tamu: k.tamu }),
          weton: Number(k.skorWeton),
        };
      }
      return baru;
    });
    setPesan({
      jenis: 'info',
      isi: 'Nilai C1 seluruh kandidat disamakan dengan hasil rumus weton otomatis. Klik Simpan untuk menyimpan.',
    });
  }

  async function simpanNilaiSaya(e) {
    e.preventDefault();
    if (penilaianTerkunci) return;
    setSibuk(true);
    setPesan(null);
    try {
      await simpanNilaiDmFrontend(ACARA_ID, userId, formNilai);
      await muat();
      setPesan({
        jenis: 'sukses',
        isi: `Tingkat nilai C1, C3, C4, dan C5 versi ${dm?.nama ?? userId} tersimpan untuk perhitungan Weighted Product Anda.`,
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  if (memuat || !formAcara) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat data acara…</Kartu>;
  }

  const totalNeptu = Number(formAcara.neptu_pria || 0) + Number(formAcara.neptu_wanita || 0);

  const ringkasanPeran = adalahSesepuh
    ? 'Anda mengelola identitas hajatan & daftar kandidat tanggal (sinkron ke semua akun), serta mengisi tingkat nilai C1, C3, C4, dan C5 versi Sesepuh. Biaya C2 diisi oleh Wedding Organizer.'
    : adalahWo
      ? 'Anda mengelola biaya gedung + katering C2 untuk semua kandidat (sinkron ke semua akun), serta mengisi tingkat nilai C1, C3, C4, dan C5 versi Wedding Organizer. Identitas & daftar kandidat dikelola Sesepuh.'
      : 'Anda mengisi tingkat nilai C1, C3, C4, dan C5 versi Orang Tua pada setiap kandidat. Identitas & daftar kandidat dikelola Sesepuh, sedangkan biaya C2 diisi oleh Wedding Organizer.';

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Kelola Data · {dm?.nama ?? userId}
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              {adalahSesepuh
                ? 'Kelola hajatan, kandidat, & nilai kriteria Anda'
                : adalahWo
                  ? 'Kelola biaya C2 & nilai kriteria Anda'
                  : 'Kelola tingkat nilai kriteria Anda'}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-krem-200/80">
              {ringkasanPeran}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <BadgeStatus status={acara?.status} gelap ukuran="sm" />
            <span className="chip-emas">
              <span className="angka">{kandidat.length}</span> kandidat
            </span>
          </div>
        </div>

        {/* Pembagian wewenang kelola data */}
        <div className="relative z-10 mt-4 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-emas-500/25 bg-tirai/35 px-3 py-2">
            <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-emas-300/80">
              Sesepuh (sinkron)
            </div>
            <div className="mt-0.5 text-xs text-krem-200/85">
              Identitas hajatan &amp; daftar kandidat tanggal
            </div>
          </div>
          <div className="rounded-lg border border-emas-500/25 bg-tirai/35 px-3 py-2">
            <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-emas-300/80">
              Wedding Organizer (sinkron)
            </div>
            <div className="mt-0.5 text-xs text-krem-200/85">
              C2 Biaya gedung + katering (juta Rp)
            </div>
          </div>
          <div className="rounded-lg border border-emas-500/40 bg-emas-500/15 px-3 py-2">
            <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-emas-200">
              Masing-masing DM
            </div>
            <div className="mt-0.5 text-xs text-krem-100">
              Tingkat nilai C1, C3, C4, C5 pribadi (1–5)
            </div>
          </div>
        </div>
      </Kartu>

      {/* ================= PESAN ================= */}
      {pesan && (
        <p role="status" className={`rounded-md border px-3 py-2 text-sm ${gayaPesan(pesan.jenis)}`}>
          {pesan.isi}
        </p>
      )}

      {/* ================= BAGIAN 1: IDENTITAS HAJATAN & KANDIDAT (KHUSUS SESEPUH) ================= */}
      {adalahSesepuh ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Identitas acara (editable Sesepuh) */}
          <Kartu varian="tebal" bingkai className="min-w-0">
            <JudulKartu
              keterangan="Sinkron ke semua akun DM · neptu mempelai menjadi acuan weton otomatis"
              aksi={<span className="chip-krem">Khusus Sesepuh</span>}
            >
              Identitas Hajatan
            </JudulKartu>

            <form onSubmit={simpanIdentitas} className="space-y-3 p-5">
              <div>
                <label htmlFor="nama-acara" className="label-isian">
                  Nama acara
                </label>
                <input
                  id="nama-acara"
                  type="text"
                  value={formAcara.nama_acara}
                  disabled={sibuk}
                  onChange={(e) => setFormAcara((l) => ({ ...l, nama_acara: e.target.value }))}
                  className="isian"
                  placeholder="mis. Pernikahan Rina & Bayu"
                  required
                />
              </div>

              <div>
                <label htmlFor="jenis-acara" className="label-isian">
                  Jenis hajatan
                </label>
                <select
                  id="jenis-acara"
                  value={formAcara.jenis}
                  disabled={sibuk}
                  onChange={(e) => setFormAcara((l) => ({ ...l, jenis: e.target.value }))}
                  className="isian"
                >
                  <option value="pernikahan">Pernikahan</option>
                  <option value="khitanan">Khitanan</option>
                  <option value="selamatan">Selamatan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="neptu-pria" className="label-isian">
                    Neptu pria
                  </label>
                  <input
                    id="neptu-pria"
                    type="number"
                    min={1}
                    max={18}
                    value={formAcara.neptu_pria}
                    disabled={sibuk}
                    onChange={(e) => setFormAcara((l) => ({ ...l, neptu_pria: e.target.value }))}
                    className="isian angka"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="neptu-wanita" className="label-isian">
                    Neptu wanita
                  </label>
                  <input
                    id="neptu-wanita"
                    type="number"
                    min={1}
                    max={18}
                    value={formAcara.neptu_wanita}
                    disabled={sibuk}
                    onChange={(e) => setFormAcara((l) => ({ ...l, neptu_wanita: e.target.value }))}
                    className="isian angka"
                    required
                  />
                </div>
              </div>

              <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2 text-xs leading-relaxed text-netral-600">
                Jumlah neptu mempelai:{' '}
                <span className="angka font-semibold text-sogan-800">{totalNeptu}</span>. Neptu
                didapat dari hari lahir + pasaran, misalnya Kamis Pon = 8 + 7 = 15.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="submit"
                  disabled={sibuk}
                  className="rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-4 py-1.5 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:opacity-50"
                >
                  {sibuk ? 'Menyimpan…' : 'Simpan identitas'}
                </button>
                {!MENGGUNAKAN_FIREBASE && (
                  <button
                    type="button"
                    onClick={kembalikanContoh}
                    disabled={sibuk}
                    className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-sm font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-50"
                  >
                    Kembalikan data contoh
                  </button>
                )}
              </div>
            </form>
          </Kartu>

          {/* Tambah / ubah tanggal kandidat (khusus Sesepuh) */}
          <Kartu varian="tebal" bingkai className="min-w-0">
            <JudulKartu
              keterangan={
                sedangUbahTanggal
                  ? `Mengubah tanggal kandidat ${modeKandidat} — kode & biaya C2 tetap terjaga`
                  : 'Tanggal yang ditambahkan sinkron ke semua akun DM'
              }
              aksi={
                sedangUbahTanggal ? (
                  <button
                    type="button"
                    onClick={batalUbahTanggal}
                    className="rounded border border-sogan-300 px-2 py-1 text-xs text-sogan-700 transition hover:bg-emas-50"
                  >
                    Batal
                  </button>
                ) : (
                  <span className="chip-krem">Khusus Sesepuh</span>
                )
              }
            >
              {sedangUbahTanggal ? `Ubah Tanggal Kandidat ${modeKandidat}` : 'Tambah Kandidat Tanggal'}
            </JudulKartu>

            <form onSubmit={simpanTanggalKandidat} className="space-y-3 p-5">
              <div>
                <label htmlFor="tanggal-kandidat" className="label-isian">
                  Tanggal hajatan
                </label>
                <input
                  id="tanggal-kandidat"
                  type="date"
                  value={tanggalKandidat}
                  disabled={sibuk}
                  onChange={(e) => setTanggalKandidat(e.target.value)}
                  className="isian angka"
                  required
                />
              </div>

              {pratinjauWeton && (
                <div className="rounded-lg border border-emas-300 bg-emas-50/70 px-3 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <BadgeWeton
                      hari={pratinjauWeton.hari}
                      pasaran={pratinjauWeton.pasaran}
                      neptu={pratinjauWeton.neptuWeton}
                      ukuran="sm"
                    />
                    <span className="angka rounded bg-sogan-700 px-2 py-0.5 text-[0.66rem] font-bold text-emas-200">
                      acuan C1 = {pratinjauWeton.skor}
                    </span>
                  </div>
                  <p className="angka mt-1.5 text-[0.68rem] leading-relaxed text-sogan-700">
                    sisa = ({acara.neptu_pria} + {acara.neptu_wanita} + {pratinjauWeton.neptuWeton})
                    mod 5 = {pratinjauWeton.sisa} → acuan skor {pratinjauWeton.skor}
                  </p>
                </div>
              )}

              <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2 text-xs leading-relaxed text-netral-600">
                Biaya gedung + katering (<span className="font-semibold text-sogan-800">C2</span>)
                diisi oleh akun <span className="font-semibold text-sogan-800">Wedding Organizer</span>.
                Tingkat nilai <span className="font-semibold text-sogan-800">C1, C3, C4, C5</span>{' '}
                diisi oleh masing-masing DM pada tabel di bawah.
              </p>

              <button
                type="submit"
                disabled={sibuk}
                className="w-full rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-2 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500 disabled:opacity-50"
              >
                {sibuk
                  ? 'Menyimpan…'
                  : sedangUbahTanggal
                    ? `Simpan tanggal kandidat ${modeKandidat}`
                    : 'Tambah kandidat tanggal'}
              </button>

              {/* Daftar ringkas aksi ubah/hapus kandidat */}
              {kandidat.length > 0 && (
                <div className="border-t border-sogan-200 pt-3">
                  <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                    Kelola kandidat aktif ({kandidat.length})
                  </div>
                  <ul className="divide-y divide-sogan-200/70 rounded-lg border border-sogan-200 bg-krem-50/70">
                    {kandidat.map((k) => (
                      <li
                        key={k.kode}
                        className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs ${
                          modeKandidat === k.kode ? 'bg-emas-500/12' : ''
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="angka inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sogan-700 text-[0.62rem] font-bold text-emas-200">
                            {k.kode}
                          </span>
                          <span className="truncate font-medium text-sogan-800">
                            {tanggalPanjang(k.tanggal)}
                          </span>
                          <BadgeWeton hari={k.hari} pasaran={k.pasaran} ukuran="sm" />
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => mulaiUbahTanggal(k)}
                            disabled={sibuk}
                            className="rounded border border-sogan-300 bg-netral-0 px-2 py-0.5 text-[0.68rem] font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-50"
                          >
                            Ubah tanggal
                          </button>
                          <button
                            type="button"
                            onClick={() => hapus(k.kode)}
                            disabled={sibuk || kandidat.length <= 2}
                            title={kandidat.length <= 2 ? 'Minimal 2 kandidat harus tersisa' : `Hapus kandidat ${k.kode}`}
                            className="rounded border border-bahaya-200 bg-bahaya-50 px-2 py-0.5 text-[0.68rem] font-medium text-bahaya transition hover:bg-bahaya-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Hapus
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </form>
          </Kartu>
        </div>
      ) : (
        /* Identitas acara (read-only untuk Orang Tua & WO) */
        <Kartu varian="tebal" bingkai>
          <JudulKartu
            keterangan="Identitas hajatan dan daftar tanggal kandidat dikelola oleh Sesepuh dan tersinkron otomatis"
            aksi={<span className="chip-krem">Dikelola Sesepuh</span>}
          >
            {acara?.nama_acara}
          </JudulKartu>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                Jenis hajatan
              </div>
              <div className="mt-1 font-medium capitalize text-sogan-800">{acara?.jenis}</div>
            </div>
            <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                Neptu pria
              </div>
              <div className="angka mt-1 font-semibold text-sogan-800">{acara?.neptu_pria}</div>
            </div>
            <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                Neptu wanita
              </div>
              <div className="angka mt-1 font-semibold text-sogan-800">{acara?.neptu_wanita}</div>
            </div>
            <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
              <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                Jumlah neptu mempelai
              </div>
              <div className="angka mt-1 font-semibold text-emas-700">{totalNeptu}</div>
            </div>
          </div>
        </Kartu>
      )}

      {/* ================= BAGIAN 2: KELOLA BIAYA C2 (KHUSUS WEDDING ORGANIZER) ================= */}
      {adalahWo && (
        <Kartu varian="tebal" bingkai>
          <JudulKartu
            keterangan="Kriteria C2 (cost, satuan juta rupiah) diisi khusus Wedding Organizer dan tersinkron ke semua akun DM"
            aksi={<span className="chip-krem">Khusus Wedding Organizer</span>}
          >
            Kelola Biaya Gedung &amp; Katering (C2)
          </JudulKartu>

          <form onSubmit={simpanSemuaBiaya}>
            <p className="petunjuk-geser" aria-hidden="true">
              <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] border-collapse text-sm">
                <caption className="sr-only">
                  Daftar biaya gedung dan katering (C2) per kandidat yang diisi Wedding Organizer
                </caption>
                <thead>
                  <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                    <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                      Kode
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                      Tanggal
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                      Weton
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                      C2 Biaya (juta Rp)
                    </th>
                    <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kandidat.map((k) => {
                    const pending = menungguBiaya.has(k.kode);
                    return (
                      <tr key={k.kode} className="border-b border-sogan-200/60 odd:bg-krem-50/50">
                        <td className="px-3 py-2.5">
                          <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                            {k.kode}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-netral-700">
                          {tanggalPanjang(k.tanggal)}
                          {pending && (
                            <span className="ml-2 rounded bg-emas-100 px-1.5 py-0.5 text-[0.6rem] font-semibold text-emas-800 ring-1 ring-emas-300">
                              perlu diisi WO
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <BadgeWeton hari={k.hari} pasaran={k.pasaran} ukuran="sm" />
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <span className="text-xs text-netral-500">Rp</span>
                            <input
                              aria-label={`Biaya C2 kandidat ${k.kode} dalam juta rupiah`}
                              type="number"
                              min={1}
                              step="any"
                              value={formBiaya[k.kode] ?? ''}
                              disabled={sibuk}
                              onChange={(e) =>
                                setFormBiaya((lama) => ({ ...lama, [k.kode]: e.target.value }))
                              }
                              className="isian angka w-24 px-2 py-1 text-right text-xs font-semibold"
                              required
                            />
                            <span className="text-xs text-netral-500">jt</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => simpanSatuBiaya(k.kode)}
                            disabled={sibuk}
                            className="rounded border border-sogan-300 bg-netral-0 px-2.5 py-1 text-xs font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-50"
                          >
                            Simpan
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sogan-200 px-5 py-3.5">
              <p className="text-xs leading-relaxed text-netral-500">
                Satuan wajib <span className="font-semibold text-sogan-700">juta rupiah</span>{' '}
                (mis. <span className="angka">40</span> untuk Rp 40 juta). Semakin rendah semakin
                baik (kriteria cost).
              </p>
              <button
                type="submit"
                disabled={sibuk || kandidat.length === 0}
                className="rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-1.5 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500 disabled:opacity-50"
              >
                {sibuk ? 'Menyimpan…' : 'Simpan semua biaya C2'}
              </button>
            </div>
          </form>

          {MENGGUNAKAN_FIREBASE && !BACKEND_BIAYA_WO_SIAP && (
            <div className="border-t border-sogan-200 bg-emas-50/70 px-5 py-2.5 text-xs text-emas-900">
              Info integrasi: penyimpanan C2 oleh WO pada mode Firebase menunggu pembaruan kontrak
              adapter &amp; Firestore rules dari Backend (<span className="font-semibold">@aliajuly</span>).
            </div>
          )}
        </Kartu>
      )}

      {/* ================= BAGIAN 3: PENILAIAN C1, C3, C4, C5 (SEMUA 3 DM) ================= */}
      <Kartu varian="tebal" bingkai>
        <JudulKartu
          keterangan={`Tingkat nilai skala 1–5 khusus untuk akun ${dm?.nama ?? userId}. C1 diawali dari acuan weton otomatis dan boleh disesuaikan.`}
          aksi={
            <span className="chip-krem">
              {penilaianTerkunci ? '🔒 Terkunci' : 'C1 · C3 · C4 · C5 Saya'}
            </span>
          }
        >
          Tingkat Nilai Kriteria Saya
        </JudulKartu>

        {penilaianTerkunci && (
          <div className="border-b border-sogan-200 bg-selesai-50 px-5 py-3 text-xs text-selesai">
            ✓ Penilaian Anda sudah dikirim dan terkunci. Tingkat nilai C1, C3, C4, dan C5 tidak dapat
            diubah lagi pada sesi ini.
          </div>
        )}

        <form onSubmit={simpanNilaiSaya}>
          <p className="petunjuk-geser" aria-hidden="true">
            <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[54rem] border-collapse text-sm">
              <caption className="sr-only">
                Form tingkat nilai C1, C3, C4, dan C5 untuk masing-masing kandidat oleh DM yang login
              </caption>
              <thead>
                <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                  <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                    Kode
                  </th>
                  <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                    Tanggal &amp; Weton
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                    C1 Weton
                    <span className="block text-[0.6rem] font-normal text-netral-400">
                      1–5 (acuan otomatis)
                    </span>
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                    C2 Biaya
                    <span className="block text-[0.6rem] font-normal text-netral-400">
                      dari WO (juta)
                    </span>
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                    C3 Gedung
                    <span className="block text-[0.6rem] font-normal text-netral-400">1–5</span>
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                    C4 Cuaca
                    <span className="block text-[0.6rem] font-normal text-netral-400">1–5</span>
                  </th>
                  <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                    C5 Tamu
                    <span className="block text-[0.6rem] font-normal text-netral-400">1–5</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {kandidat.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-3 py-6 text-center text-sm text-netral-500">
                      Belum ada kandidat tanggal. Menunggu Sesepuh menambahkan kandidat.
                    </td>
                  </tr>
                )}
                {kandidat.map((k) => {
                  const baris = formNilai[k.kode] ?? {
                    weton: k.skorWeton,
                    gedung: k.gedung,
                    cuaca: k.cuaca,
                    tamu: k.tamu,
                  };
                  const bedaAcuan = Number(baris.weton) !== Number(k.skorWeton);
                  const biayaPending = menungguBiaya.has(k.kode);
                  return (
                    <tr key={k.kode} className="border-b border-sogan-200/60 odd:bg-krem-50/50">
                      <td className="px-3 py-2.5">
                        <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                          {k.kode}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs font-medium text-sogan-800">
                          {tanggalPanjang(k.tanggal)}
                        </div>
                        <div className="mt-0.5">
                          <BadgeWeton
                            hari={k.hari}
                            pasaran={k.pasaran}
                            neptu={k.neptuWetonH}
                            ukuran="sm"
                          />
                        </div>
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <PilihSkala
                            ariaLabel={`Skor C1 Weton kandidat ${k.kode}`}
                            nilai={baris.weton}
                            nonaktif={sibuk || penilaianTerkunci}
                            onUbah={(v) => ubahNilaiSel(k.kode, 'weton', v)}
                          />
                          <span
                            className={`angka text-[0.6rem] ${
                              bedaAcuan ? 'font-semibold text-emas-700' : 'text-netral-400'
                            }`}
                          >
                            acuan: {k.skorWeton}
                          </span>
                        </div>
                      </td>
                      <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">
                        {biayaPending ? (
                          <span className="rounded bg-emas-100 px-1.5 py-0.5 text-[0.6rem] font-medium text-emas-800 ring-1 ring-emas-300">
                            Menunggu WO
                          </span>
                        ) : (
                          <span>Rp {k.biaya} jt</span>
                        )}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <PilihSkala
                          ariaLabel={`Skor C3 Gedung kandidat ${k.kode}`}
                          nilai={baris.gedung}
                          nonaktif={sibuk || penilaianTerkunci}
                          onUbah={(v) => ubahNilaiSel(k.kode, 'gedung', v)}
                        />
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <PilihSkala
                          ariaLabel={`Skor C4 Cuaca kandidat ${k.kode}`}
                          nilai={baris.cuaca}
                          nonaktif={sibuk || penilaianTerkunci}
                          onUbah={(v) => ubahNilaiSel(k.kode, 'cuaca', v)}
                        />
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <PilihSkala
                          ariaLabel={`Skor C5 Tamu kandidat ${k.kode}`}
                          nilai={baris.tamu}
                          nonaktif={sibuk || penilaianTerkunci}
                          onUbah={(v) => ubahNilaiSel(k.kode, 'tamu', v)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sogan-200 px-5 py-4">
            <button
              type="button"
              onClick={samakanC1KeAcuanWeton}
              disabled={sibuk || penilaianTerkunci || kandidat.length === 0}
              className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-xs font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Samakan C1 ke acuan weton
            </button>
            <button
              type="submit"
              disabled={sibuk || penilaianTerkunci || kandidat.length === 0}
              className="rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-4 py-1.5 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sibuk ? 'Menyimpan…' : 'Simpan nilai C1, C3, C4, C5'}
            </button>
          </div>
        </form>

        {!BACKEND_NILAI_DM_SIAP && (
          <div className="border-t border-sogan-200 bg-krem-100/80 px-5 py-2.5 text-xs leading-relaxed text-netral-600">
            {MENGGUNAKAN_FIREBASE
              ? 'Info integrasi: penyimpanan nilai C1/C3/C4/C5 per DM pada mode Firebase menunggu pembaruan kontrak adapter, Firestore rules, & Worker dari Backend (@aliajuly).'
              : 'Mode demo: nilai C1/C3/C4/C5 pribadi disimpan di peramban untuk pratinjau WP pada halaman Data Acara, Atur Bobot, dan Penilaian Saya. Sinkronisasi server & Worker akan aktif penuh setelah pembaruan adapter dari Backend (@aliajuly).'}
          </div>
        )}
      </Kartu>

      {/* ================= ATURAN WETON & KRITERIA (rujukan) ================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Kartu className="min-w-0">
          <JudulKartu keterangan="Acuan awal skor C1 dari sisa bagi 5">Aturan Skor Weton</JudulKartu>
          <ul className="divide-y divide-sogan-200/70">
            {[...ATURAN_WETON]
              .sort((a, b) => b.skor - a.skor)
              .map((a) => (
                <li key={a.sisa} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="angka flex h-6 w-8 shrink-0 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                      {a.sisa}
                    </span>
                    <span className="min-w-0 text-sm text-sogan-800">{a.keterangan}</span>
                  </span>
                  <span
                    className={`angka shrink-0 rounded px-2 py-0.5 text-xs font-semibold ring-1 ${
                      a.skor >= 4
                        ? 'bg-selesai-50 text-selesai ring-selesai-300'
                        : a.skor >= 3
                          ? 'bg-emas-100 text-emas-800 ring-emas-300'
                          : 'bg-netral-100 text-netral-600 ring-netral-300'
                    }`}
                  >
                    skor {a.skor}
                  </span>
                </li>
              ))}
          </ul>
        </Kartu>

        <Kartu className="min-w-0">
          <JudulKartu keterangan="Nilai yang dipakai metode Weighted Product">
            Kriteria &amp; Pengelola
          </JudulKartu>
          <ul className="divide-y divide-sogan-200/70">
            {KRITERIA.map((k) => {
              const pengelola = k.kode === 'C2' ? 'Khusus WO (sinkron)' : 'Masing-masing DM';
              return (
                <li key={k.key} className="px-5 py-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="angka rounded bg-sogan-700 px-1.5 py-0.5 text-[0.62rem] font-bold text-emas-200">
                        {k.kode}
                      </span>
                      <span className="text-sm font-medium text-sogan-800">{k.nama}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded bg-krem-200 px-1.5 py-0.5 text-[0.6rem] font-medium text-sogan-700 ring-1 ring-sogan-200">
                        {pengelola}
                      </span>
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ring-1 ${
                          k.tipe === 'cost'
                            ? 'bg-penilaian-50 text-penilaian ring-penilaian-300'
                            : 'bg-emas-100 text-emas-800 ring-emas-300'
                        }`}
                      >
                        {k.tipe}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-netral-500">
                    {k.satuan} · {k.keteranganSkala}
                  </p>
                </li>
              );
            })}
          </ul>
        </Kartu>
      </div>

      <BlokTeks judul="Alur pengelolaan data" ikon="◈">
        Identitas hajatan &amp; daftar tanggal kandidat dikelola{' '}
        <span className="font-semibold text-sogan-800">Sesepuh</span>, biaya gedung C2 dikelola{' '}
        <span className="font-semibold text-sogan-800">Wedding Organizer</span>, dan tingkat nilai
        C1, C3, C4, serta C5 dinilai terpisah oleh masing-masing DM sebagai masukan Weighted Product
        akun masing-masing.
      </BlokTeks>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/kandidat"
          className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-sm font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50"
        >
          Lihat Data Acara →
        </Link>
        <Link
          to="/bobot"
          className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-sm font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50"
        >
          Lanjut atur bobot →
        </Link>
      </div>
    </div>
  );
}
