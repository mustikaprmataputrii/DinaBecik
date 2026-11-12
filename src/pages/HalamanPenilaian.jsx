/**
 * ============================================================================
 *  Halaman: Penilaian Saya
 * ============================================================================
 *  Panduan bagian 10: menampilkan hasil Weighted Product milik DM yang login —
 *  nilai S, V, dan ranking tiap kandidat — lalu tombol Kirim untuk mengunci.
 *
 *  Aturan penting (Panduan bagian 9):
 *    - Setelah dikirim, penilaian TERKUNCI dan tidak dapat diubah.
 *    - Bila bobot diubah, adapter membatalkan pengiriman (harus kirim ulang).
 *    - Konsensus baru dihitung setelah KETIGA DM mengirim.
 *
 *  Uji T4/T5 bergantung pada halaman ini.
 * ============================================================================
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu, BlokTeks } from '../components/Kartu.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import {
  getAcara,
  getKandidat,
  getBobotDm,
  getPenilaianDm,
  kirimPenilaian,
  getStatusSemuaDm,
} from '../data/index.js';
import { KRITERIA, URUTAN_KRITERIA, URUTAN_DM, DECISION_MAKERS } from '../shared/constants.js';

const ACARA_ID = 'acara-demo-2027';

/** Format angka desimal dengan jumlah digit tetap agar kolom rata. */
function angka(n, d = 4) {
  if (!Number.isFinite(Number(n))) return '—';
  return Number(n).toFixed(d);
}

/** Nilai kriteria untuk ditampilkan di tabel. */
function nilaiKriteria(kandidat, key) {
  if (!kandidat) return '—';
  if (key === 'weton') return kandidat.skorWeton;
  return kandidat[key];
}

export default function HalamanPenilaian({ sesi }) {
  const userId = sesi?.peran;
  const dm = DECISION_MAKERS.find((d) => d.key === userId);

  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [bobot, setBobot] = useState(null);
  const [penilaian, setPenilaian] = useState(null);
  const [statusDm, setStatusDm] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [pesan, setPesan] = useState(null);

  const muat = useCallback(async () => {
    const [a, k, b, p, s] = await Promise.all([
      getAcara(),
      getKandidat(),
      getBobotDm(ACARA_ID, userId),
      getPenilaianDm(ACARA_ID, userId),
      getStatusSemuaDm(),
    ]);
    setAcara(a);
    setKandidat(k);
    setBobot(b);
    setPenilaian(p);
    setStatusDm(s);
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

  /** Peta kode -> baris kandidat, untuk menampilkan nilai kriteria. */
  const petaKandidat = useMemo(
    () => Object.fromEntries(kandidat.map((k) => [k.kode, k])),
    [kandidat]
  );

  const terkunci = Boolean(penilaian?.statusKirim);
  const hasil = penilaian?.hasil ?? [];
  const sudahKirim = statusDm ? URUTAN_DM.filter((d) => statusDm[d]).length : 0;
  const semuaKirim = sudahKirim === URUTAN_DM.length;

  async function kirim() {
    setMengirim(true);
    setPesan(null);
    try {
      await kirimPenilaian(ACARA_ID, userId);
      await muat();
      setPesan({
        jenis: 'sukses',
        isi: 'Penilaian terkirim dan terkunci. Hubungi sesepuh bila perlu diubah — bobot harus diubah lebih dulu.',
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setMengirim(false);
    }
  }

  if (memuat || !penilaian) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat penilaian…</Kartu>;
  }

  const gayaPesan =
    pesan?.jenis === 'sukses'
      ? 'border-[#9CCBAE] bg-[#EAF5EE] text-selesai'
      : 'border-[#F2C4C0] bg-[#FDECEA] text-bahaya';

  const pemenang = hasil.find((h) => h.ranking === 1);

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Penilaian Saya
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Hasil Weighted Product Anda
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              Nilai S dihitung dengan mengalikan nilai tiap kriteria berpangkat bobot Anda
              (cost bernilai negatif). V adalah S dibagi total S.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <span className="chip-emas">
              <span aria-hidden="true">{terkunci ? '🔒' : '✎'}</span>
              {terkunci ? 'Terkunci' : 'Belum dikirim'}
            </span>
            <span className="chip-emas">
              Bobot suara <span className="angka font-semibold">{dm?.bobotSuara ?? '-'}</span>
            </span>
          </div>
        </div>
      </Kartu>

      {/* ================= BOBOT YANG DIPAKAI ================= */}
      <Kartu varian="tebal">
        <JudulKartu
          keterangan={`Bobot ${dm?.nama ?? userId} — total 100%`}
          aksi={
            <Link
              to="/bobot"
              className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-xs font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50"
            >
              Ubah bobot →
            </Link>
          }
        >
          Bobot yang Dipakai
        </JudulKartu>
        <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-5">
          {KRITERIA.map((k) => (
            <div
              key={k.key}
              className="rounded-lg border border-sogan-200 bg-krem-100/60 px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <span className="angka rounded bg-sogan-700 px-1 py-0.5 text-[0.6rem] font-bold text-emas-200">
                  {k.kode}
                </span>
                <span
                  className={`text-[0.55rem] font-bold uppercase ${
                    k.tipe === 'cost' ? 'text-penilaian' : 'text-emas-700'
                  }`}
                >
                  {k.tipe === 'cost' ? '−' : '+'}
                </span>
              </div>
              <div className="angka mt-1 text-base font-semibold text-sogan-800">
                {bobot?.[k.key] ?? 0}%
              </div>
              <div className="min-w-0 truncate text-[0.66rem] text-netral-500">{k.nama}</div>
            </div>
          ))}
        </div>
      </Kartu>

      {/* ================= TABEL HASIL WP ================= */}
      <Kartu varian="tebal" bingkai>
        <JudulKartu
          keterangan="Diurutkan berdasarkan ranking; S terbesar menjadi peringkat 1"
          aksi={
            <span className="chip-krem">
              <span className="angka font-semibold text-sogan-800">{hasil.length}</span>
              <span>kandidat</span>
            </span>
          }
        >
          Perhitungan S, V, dan Ranking
        </JudulKartu>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-sm">
            <caption className="sr-only">
              Tabel nilai S, V, dan ranking Weighted Product untuk setiap kandidat
            </caption>
            <thead>
              <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                  Rank
                </th>
                <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                  Kandidat
                </th>
                <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                  Tanggal
                </th>
                {URUTAN_KRITERIA.map((key, i) => {
                  const k = KRITERIA[i];
                  return (
                    <th
                      key={key}
                      scope="col"
                      className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700"
                      title={k.nama}
                    >
                      {k.kode}
                      <span className="ml-0.5 text-[0.6rem] font-normal text-netral-400">
                        {k.tipe === 'cost' ? '−' : '+'}
                      </span>
                    </th>
                  );
                })}
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  S
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  V
                </th>
              </tr>
            </thead>
            <tbody>
              {[...hasil]
                .sort((a, b) => a.ranking - b.ranking)
                .map((h) => {
                  const k = petaKandidat[h.kode];
                  const juara = h.ranking === 1;
                  return (
                    <tr
                      key={h.kode}
                      className={`border-b border-sogan-200/60 ${
                        juara ? 'bg-emas-500/10' : 'odd:bg-krem-50/50'
                      }`}
                    >
                      <td className="px-3 py-2.5">
                        <span
                          className={`angka inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.66rem] font-bold shadow-sm ring-1 ${
                            juara
                              ? 'bg-gradient-to-b from-emas-300 to-emas-500 text-sogan-900 ring-emas-600'
                              : 'bg-netral-100 text-netral-600 ring-netral-300'
                          }`}
                        >
                          {h.ranking}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="font-semibold text-sogan-800">Kandidat {h.kode}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        {k ? (
                          <BadgeWeton hari={k.hari} pasaran={k.pasaran} ukuran="sm" />
                        ) : (
                          <span className="text-netral-400">—</span>
                        )}
                      </td>
                      {URUTAN_KRITERIA.map((key) => (
                        <td
                          key={key}
                          className="angka px-2 py-2.5 text-right text-xs text-netral-600"
                        >
                          {nilaiKriteria(k, key)}
                        </td>
                      ))}
                      <td className="angka px-3 py-2.5 text-right font-medium text-sogan-800">
                        {angka(h.s)}
                      </td>
                      <td className="angka px-3 py-2.5 text-right font-semibold text-sogan-800">
                        {angka(h.v)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-sogan-300 bg-sogan-50/80">
                <td colSpan={7} className="px-3 py-2 text-xs font-semibold text-sogan-700">
                  Total S
                </td>
                <td className="angka px-3 py-2 text-right text-xs font-semibold text-sogan-800">
                  {angka(penilaian.totalS)}
                </td>
                <td className="angka px-3 py-2 text-right text-xs font-semibold text-sogan-800">
                  {angka(1, 4)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ---- Aksi kirim ---- */}
        <div className="border-t border-sogan-200 px-5 py-4">
          {terkunci ? (
            <div className="rounded-md border border-[#9CCBAE] bg-[#EAF5EE] px-3 py-2.5">
              <p className="text-sm font-medium text-selesai">
                ✓ Penilaian Anda sudah terkirim dan terkunci.
              </p>
              <p className="mt-1 text-xs leading-relaxed text-selesai/85">
                Waktu kirim:{' '}
                <span className="angka">
                  {penilaian.waktuKirim
                    ? new Date(penilaian.waktuKirim).toLocaleString('id-ID')
                    : '—'}
                </span>
                . Untuk mengubah, ubah bobot Anda di halaman Atur Bobot — pengiriman akan batal
                otomatis.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-md text-xs leading-relaxed text-netral-600">
                Setelah dikirim, penilaian <span className="font-semibold">tidak dapat diubah</span>{' '}
                kecuali bobot diubah lebih dulu. Pastikan bobot sudah sesuai.
              </p>
              <button
                type="button"
                onClick={kirim}
                disabled={mengirim || hasil.length === 0}
                className="rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-4 py-2 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mengirim ? 'Mengirim…' : 'Kirim penilaian'}
              </button>
            </div>
          )}

          {pesan && (
            <p role="status" className={`mt-3 rounded-md border px-3 py-2 text-xs ${gayaPesan}`}>
              {pesan.isi}
            </p>
          )}
        </div>
      </Kartu>

      {/* ================= STATUS KONSENSUS ================= */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Kartu>
          <JudulKartu keterangan="Konsensus dihitung setelah ketiga DM mengirim">
            Status Pengiriman
          </JudulKartu>
          <ul className="divide-y divide-sogan-200/70">
            {DECISION_MAKERS.map((d) => {
              const sudah = Boolean(statusDm?.[d.key]);
              return (
                <li key={d.key} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ${
                        sudah
                          ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                          : 'bg-netral-100 text-netral-400 ring-netral-300'
                      }`}
                    >
                      {sudah ? '✓' : '—'}
                    </span>
                    <span className="min-w-0 truncate text-sm text-sogan-800">{d.nama}</span>
                  </span>
                  <span className="shrink-0 text-xs text-netral-500">
                    {sudah ? 'terkirim' : 'belum'}
                  </span>
                </li>
              );
            })}
          </ul>
        </Kartu>

        <Kartu varian={semuaKirim ? 'emas' : 'biasa'}>
          <JudulKartu gelap={semuaKirim} keterangan="Ringkasan pilihan Anda">
            Peringkat Teratas Anda
          </JudulKartu>
          <div className="p-5">
            {pemenang ? (
              <>
                <p
                  className={`text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${
                    semuaKirim ? 'text-emas-300/70' : 'text-netral-500'
                  }`}
                >
                  Peringkat 1 versi Anda
                </p>
                <p
                  className={`mt-1.5 font-judul text-xl font-semibold ${
                    semuaKirim ? 'text-emas-100' : 'text-sogan-800'
                  }`}
                >
                  Kandidat {pemenang.kode}
                </p>
                <p className={`mt-1 text-sm ${semuaKirim ? 'text-krem-200/75' : 'text-netral-600'}`}>
                  {petaKandidat[pemenang.kode] ? (
                    <BadgeWeton
                      hari={petaKandidat[pemenang.kode].hari}
                      pasaran={petaKandidat[pemenang.kode].pasaran}
                      neptu={petaKandidat[pemenang.kode].neptuWetonH}
                      gelap={semuaKirim}
                    />
                  ) : (
                    '—'
                  )}
                </p>
                <p
                  className={`angka mt-3 text-xs ${semuaKirim ? 'text-krem-200/70' : 'text-netral-500'}`}
                >
                  S = {angka(pemenang.s)} · V = {angka(pemenang.v)}
                </p>
              </>
            ) : (
              <p className="text-sm text-netral-500">Belum ada hasil.</p>
            )}

            {semuaKirim && (
              <Link
                to="/hasil"
                className="mt-4 inline-block rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-2 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500"
              >
                Lihat konsensus →
              </Link>
            )}
          </div>
        </Kartu>
      </div>

      <BlokTeks judul="Acara" ikon="◈">
        {acara?.nama_acara} · status{' '}
        <span className="font-semibold text-sogan-800">{acara?.status}</span>.{' '}
        {semuaKirim
          ? 'Ketiga DM sudah mengirim; konsensus Weighted Borda sudah dihitung.'
          : `Menunggu ${URUTAN_DM.length - sudahKirim} DM lagi.`}
      </BlokTeks>
    </div>
  );
}
