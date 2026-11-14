/**
 * ============================================================================
 *  Halaman: Kelola Data Acara
 * ============================================================================
 *  Halaman ini yang membuat aplikasi bisa dipakai untuk hajatan SIAPA SAJA,
 *  bukan hanya data contoh Tabel 7.1.
 *
 *  Yang bisa dilakukan:
 *    - ubah identitas acara (nama, jenis, neptu pria & wanita)
 *    - tambah / ubah / hapus kandidat tanggal
 *    - mengembalikan semuanya ke data contoh (tombol Reset)
 *
 *  ATURAN PENTING yang dijaga di sini:
 *    1. Skor weton (C1) TIDAK PERNAH diinput manual. Pengguna hanya memilih
 *       tanggal; hari, pasaran, neptu, sisa, dan skor dihitung oleh
 *       hitungSkorWeton(). Pratinjau rumusnya ditampilkan sebelum disimpan.
 *    2. Mengubah data acara/kandidat membatalkan penilaian yang sudah
 *       dikirim, karena hasil WP lama tidak lagi sah.
 *    3. Data disimpan di peramban (localStorage) sehingga bertahan setelah
 *       refresh. Saat Firestore siap, hanya adapter yang diganti.
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
  simpanAcara,
  tambahKandidat,
  ubahKandidat,
  hapusKandidat,
  resetDemo,
} from '../data/index.js';
import { hitungSkorWeton } from '../shared/weton.js';
import { KRITERIA, ATURAN_WETON } from '../shared/constants.js';

const ACARA_ID = 'acara-demo-2027';

/** Format tanggal Indonesia. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Form kosong untuk kandidat baru. */
const KANDIDAT_KOSONG = { tanggal: '', biaya: '', gedung: '3', cuaca: '3', tamu: '3' };

/** Kelas pesan sesuai jenisnya. */
function gayaPesan(jenis) {
  if (jenis === 'sukses') return 'border-[#9CCBAE] bg-[#EAF5EE] text-selesai';
  if (jenis === 'galat') return 'border-[#F2C4C0] bg-[#FDECEA] text-bahaya';
  return 'border-sogan-200 bg-krem-100/80 text-netral-600';
}

/* ---------------------------------------------------------------------------
 * Satu baris isian angka 1-5
 * ------------------------------------------------------------------------- */
function IsianSkala({ id, label, petunjuk, nilai, onUbah, nonaktif }) {
  return (
    <div>
      <label htmlFor={id} className="label-isian">
        {label}
      </label>
      <select
        id={id}
        value={nilai}
        disabled={nonaktif}
        onChange={(e) => onUbah(e.target.value)}
        className="isian angka"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      {petunjuk && <p className="mt-1 text-[0.66rem] leading-snug text-netral-400">{petunjuk}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Halaman
 * ------------------------------------------------------------------------- */
export default function HalamanKelola({ sesi }) {
  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState(null); // { jenis, isi }

  // form identitas acara
  const [formAcara, setFormAcara] = useState(null);

  // form kandidat: mode 'tambah' atau kode kandidat yang sedang diubah
  const [modeKandidat, setModeKandidat] = useState('tambah');
  const [formKandidat, setFormKandidat] = useState(KANDIDAT_KOSONG);

  const muat = useCallback(async () => {
    const [a, k] = await Promise.all([getAcara(), getKandidat()]);
    setAcara(a);
    setKandidat(k);
    setFormAcara({
      nama_acara: a.nama_acara ?? '',
      jenis: a.jenis ?? 'pernikahan',
      neptu_pria: String(a.neptu_pria ?? ''),
      neptu_wanita: String(a.neptu_wanita ?? ''),
    });
    setMemuat(false);
  }, []);

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

  /** Pratinjau weton untuk tanggal yang sedang diketik. */
  const pratinjauWeton = useMemo(() => {
    if (!formKandidat.tanggal || !acara) return null;
    try {
      return hitungSkorWeton(formKandidat.tanggal, acara.neptu_pria, acara.neptu_wanita);
    } catch {
      return null;
    }
  }, [formKandidat.tanggal, acara]);

  const sedangUbah = modeKandidat !== 'tambah';

  /* ---------------- aksi: identitas acara ---------------- */
  async function simpanIdentitas(e) {
    e.preventDefault();
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
        isi: 'Identitas acara tersimpan. Skor weton semua kandidat dihitung ulang, dan penilaian dibatalkan agar tidak memakai hasil lama.',
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  /* ---------------- aksi: kandidat ---------------- */
  async function simpanKandidat(e) {
    e.preventDefault();
    setSibuk(true);
    setPesan(null);
    try {
      if (sedangUbah) {
        await ubahKandidat(ACARA_ID, modeKandidat, formKandidat);
        setPesan({ jenis: 'sukses', isi: `Kandidat ${modeKandidat} diperbarui.` });
      } else {
        const baru = await tambahKandidat(ACARA_ID, formKandidat);
        setPesan({
          jenis: 'sukses',
          isi: `Kandidat ${baru.kode} ditambahkan: ${baru.hari} ${baru.pasaran}, skor weton ${baru.skorWeton}.`,
        });
      }
      setModeKandidat('tambah');
      setFormKandidat(KANDIDAT_KOSONG);
      await muat();
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  function mulaiUbah(k) {
    setModeKandidat(k.kode);
    setFormKandidat({
      tanggal: k.tanggal,
      biaya: String(k.biaya),
      gedung: String(k.gedung),
      cuaca: String(k.cuaca),
      tamu: String(k.tamu),
    });
    setPesan(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function batalUbah() {
    setModeKandidat('tambah');
    setFormKandidat(KANDIDAT_KOSONG);
    setPesan(null);
  }

  async function hapus(kode) {
    setSibuk(true);
    setPesan(null);
    try {
      await hapusKandidat(ACARA_ID, kode);
      if (modeKandidat === kode) batalUbah();
      await muat();
      setPesan({ jenis: 'sukses', isi: `Kandidat ${kode} dihapus.` });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setSibuk(false);
    }
  }

  async function kembalikanContoh() {
    setSibuk(true);
    setPesan(null);
    try {
      await resetDemo();
      batalUbah();
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

  if (memuat || !formAcara) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat data acara…</Kartu>;
  }

  const totalNeptu = Number(formAcara.neptu_pria || 0) + Number(formAcara.neptu_wanita || 0);

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Kelola Data
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Isi data hajatan Anda sendiri
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              Ubah neptu mempelai, lalu tambahkan tanggal-tanggal yang ingin dibandingkan. Skor
              weton dihitung otomatis dari tanggal — tidak pernah diketik manual.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <BadgeStatus status={acara?.status} gelap ukuran="sm" />
            <span className="chip-emas">
              <span className="angka">{kandidat.length}</span> kandidat
            </span>
          </div>
        </div>
      </Kartu>

      {/* ================= PESAN ================= */}
      {pesan && (
        <p role="status" className={`rounded-md border px-3 py-2 text-sm ${gayaPesan(pesan.jenis)}`}>
          {pesan.isi}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ================= IDENTITAS ACARA ================= */}
        <Kartu varian="tebal" bingkai className="min-w-0">
          <JudulKartu keterangan="Neptu mempelai dipakai untuk menghitung skor weton semua kandidat">
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
              <button
                type="button"
                onClick={kembalikanContoh}
                disabled={sibuk}
                className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-sm font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-50"
              >
                Kembalikan data contoh
              </button>
            </div>
          </form>
        </Kartu>

        {/* ================= FORM KANDIDAT ================= */}
        <Kartu varian="tebal" bingkai className="min-w-0">
          <JudulKartu
            keterangan={
              sedangUbah
                ? `Mengubah kandidat ${modeKandidat} — kode tidak berubah`
                : 'Tanggal dipilih, skor weton dihitung sistem'
            }
            aksi={
              sedangUbah ? (
                <button
                  type="button"
                  onClick={batalUbah}
                  className="rounded border border-sogan-300 px-2 py-1 text-xs text-sogan-700 transition hover:bg-emas-50"
                >
                  Batal
                </button>
              ) : null
            }
          >
            {sedangUbah ? `Ubah Kandidat ${modeKandidat}` : 'Tambah Kandidat'}
          </JudulKartu>

          <form onSubmit={simpanKandidat} className="space-y-3 p-5">
            <div>
              <label htmlFor="tanggal-kandidat" className="label-isian">
                Tanggal hajatan
              </label>
              <input
                id="tanggal-kandidat"
                type="date"
                value={formKandidat.tanggal}
                disabled={sibuk}
                onChange={(e) => setFormKandidat((l) => ({ ...l, tanggal: e.target.value }))}
                className="isian angka"
                required
              />
            </div>

            {/* Pratinjau weton — memperlihatkan rumus, bukan hasil sulap */}
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
                    skor C1 = {pratinjauWeton.skor}
                  </span>
                </div>
                <p className="angka mt-1.5 text-[0.68rem] leading-relaxed text-sogan-700">
                  sisa = ({acara.neptu_pria} + {acara.neptu_wanita} + {pratinjauWeton.neptuWeton})
                  mod 5 = {pratinjauWeton.sisa} → skor {pratinjauWeton.skor}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="biaya-kandidat" className="label-isian">
                Biaya gedung + katering (juta rupiah)
              </label>
              <input
                id="biaya-kandidat"
                type="number"
                min={1}
                step={1}
                value={formKandidat.biaya}
                disabled={sibuk}
                onChange={(e) => setFormKandidat((l) => ({ ...l, biaya: e.target.value }))}
                className="isian angka"
                placeholder="mis. 40"
                required
              />
              <p className="mt-1 text-[0.66rem] leading-snug text-netral-400">
                Angka asli dalam juta rupiah, bukan skala 1–5. Semakin kecil semakin baik (cost).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <IsianSkala
                id="gedung-kandidat"
                label="Gedung"
                petunjuk="5 = kosong"
                nilai={formKandidat.gedung}
                nonaktif={sibuk}
                onUbah={(v) => setFormKandidat((l) => ({ ...l, gedung: v }))}
              />
              <IsianSkala
                id="cuaca-kandidat"
                label="Cuaca"
                petunjuk="5 = kemarau"
                nilai={formKandidat.cuaca}
                nonaktif={sibuk}
                onUbah={(v) => setFormKandidat((l) => ({ ...l, cuaca: v }))}
              />
              <IsianSkala
                id="tamu-kandidat"
                label="Tamu"
                petunjuk="5 = libur"
                nilai={formKandidat.tamu}
                nonaktif={sibuk}
                onUbah={(v) => setFormKandidat((l) => ({ ...l, tamu: v }))}
              />
            </div>

            <button
              type="submit"
              disabled={sibuk}
              className="w-full rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-2 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500 disabled:opacity-50"
            >
              {sibuk
                ? 'Menyimpan…'
                : sedangUbah
                  ? `Simpan perubahan kandidat ${modeKandidat}`
                  : 'Tambah kandidat'}
            </button>
          </form>
        </Kartu>
      </div>

      {/* ================= DAFTAR KANDIDAT ================= */}
      <Kartu varian="tebal" bingkai>
        <JudulKartu
          keterangan="Semua kandidat yang akan dihitung dengan Weighted Product"
          aksi={
            <span className="chip-krem">
              <span className="angka font-semibold text-sogan-800">{kandidat.length}</span>
              <span>kandidat</span>
            </span>
          }
        >
          Daftar Kandidat
        </JudulKartu>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              Daftar kandidat tanggal beserta weton hasil hitung dan nilai kriteria
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
                  Weton (otomatis)
                </th>
                <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  C1
                </th>
                <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  C2
                </th>
                <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  C3
                </th>
                <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  C4
                </th>
                <th scope="col" className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  C5
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {kandidat.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-6 text-center text-sm text-netral-500">
                    Belum ada kandidat. Tambahkan lewat form di atas.
                  </td>
                </tr>
              )}
              {kandidat.map((k) => (
                <tr
                  key={k.kode}
                  className={`border-b border-sogan-200/60 ${
                    modeKandidat === k.kode ? 'bg-emas-500/12' : 'odd:bg-krem-50/50'
                  }`}
                >
                  <td className="px-3 py-2.5">
                    <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                      {k.kode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-netral-700">{tanggalPanjang(k.tanggal)}</td>
                  <td className="px-3 py-2.5">
                    <BadgeWeton hari={k.hari} pasaran={k.pasaran} neptu={k.neptuWetonH} ukuran="sm" />
                  </td>
                  <td className="angka px-2 py-2.5 text-right text-xs font-semibold text-sogan-800">
                    {k.skorWeton}
                  </td>
                  <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">{k.biaya}</td>
                  <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">{k.gedung}</td>
                  <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">{k.cuaca}</td>
                  <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">{k.tamu}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => mulaiUbah(k)}
                        disabled={sibuk}
                        className="rounded border border-sogan-300 bg-netral-0 px-2 py-1 text-[0.7rem] font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-50"
                      >
                        Ubah
                      </button>
                      <button
                        type="button"
                        onClick={() => hapus(k.kode)}
                        disabled={sibuk}
                        className="rounded border border-[#F2C4C0] bg-[#FDECEA] px-2 py-1 text-[0.7rem] font-medium text-bahaya transition hover:bg-[#F8D7D3] disabled:opacity-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-sogan-200 px-5 py-3">
          <p className="text-xs leading-relaxed text-netral-500">
            C1 = skor weton (dihitung dari tanggal, benefit) · C2 = biaya juta rupiah (cost) · C3 =
            gedung · C4 = cuaca · C5 = tamu. Kolom C1 tidak bisa diketik karena berasal dari rumus.
          </p>
        </div>
      </Kartu>

      {/* ================= ATURAN WETON (rujukan) ================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Kartu className="min-w-0">
          <JudulKartu keterangan="Pemetaan sisa bagi 5 menjadi skor C1">Aturan Skor Weton</JudulKartu>
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
                        ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
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
            Kriteria & Tipe
          </JudulKartu>
          <ul className="divide-y divide-sogan-200/70">
            {KRITERIA.map((k) => (
              <li key={k.key} className="px-5 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="angka rounded bg-sogan-700 px-1.5 py-0.5 text-[0.62rem] font-bold text-emas-200">
                      {k.kode}
                    </span>
                    <span className="text-sm font-medium text-sogan-800">{k.nama}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ring-1 ${
                      k.tipe === 'cost'
                        ? 'bg-[#EDF4FA] text-penilaian ring-[#A9C7E0]'
                        : 'bg-emas-100 text-emas-800 ring-emas-300'
                    }`}
                  >
                    {k.tipe}
                  </span>
                </div>
                <p className="mt-1 text-xs text-netral-500">
                  {k.satuan} · {k.keteranganSkala}
                </p>
              </li>
            ))}
          </ul>
        </Kartu>
      </div>

      <BlokTeks judul="Setelah data diubah" ikon="◈">
        Mengubah identitas acara atau daftar kandidat akan{' '}
        <span className="font-semibold text-sogan-800">membatalkan penilaian</span> yang sudah
        dikirim, karena hasil Weighted Product lama tidak lagi sah. Ketiga DM perlu mengirim ulang.
        Data tersimpan di peramban ini, jadi tetap ada setelah halaman dimuat ulang — tetapi belum
        dibagi ke perangkat lain sampai Firestore tersambung.
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
