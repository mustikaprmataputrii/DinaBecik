/**
 * ============================================================================
 *  Halaman: Dashboard
 * ============================================================================
 *  Menampilkan status acara dan status tiap DM (sudah/belum menilai).
 *  Revisi pasca-presentasi:
 *    - Semua DM memiliki pintasan Kelola Data (dengan hak kelola per peran).
 *    - Menu Konsensus & perhitungan Weighted Borda (termasuk Panel Bukti
 *      Akurasi Borda) hanya tampil pada akun Sesepuh.
 *    - Semua DM dapat membuka Riwayat untuk melihat tanggal terpilih dan
 *      komentar masing-masing keputusan.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import PanelBuktiAkurasi from '../components/PanelBuktiAkurasi.jsx';
import { getAcara, getKandidat, getStatusSemuaDm, getHasilVoting, mulaiPenilaian } from '../data/index.js';
import { DECISION_MAKERS, URUTAN_DM, STATUS_ACARA, METODE } from '../shared/constants.js';

function daftarPintasan(peran) {
  const keteranganKelola =
    peran === 'sesepuh'
      ? 'Identitas, kandidat & nilai C1/C3/C4/C5'
      : peran === 'wo'
        ? 'Biaya C2 & nilai C1/C3/C4/C5'
        : 'Nilai C1, C3, C4, C5 saya';

  const dasar = [
    { ke: '/kelola', judul: 'Kelola Data', isi: keteranganKelola, ikon: '✎' },
    { ke: '/kandidat', judul: 'Data Acara', isi: 'Kandidat & weton', ikon: '▤' },
    { ke: '/bobot', judul: 'Atur Bobot', isi: '5 kriteria, total 100%', ikon: '⚖' },
    { ke: '/penilaian', judul: 'Penilaian Saya', isi: 'S, V, ranking WP', ikon: '◈' },
  ];

  if (peran === 'sesepuh') {
    dasar.push({ ke: '/hasil', judul: 'Konsensus', isi: 'Hasil Weighted Borda', ikon: '★' });
  }

  dasar.push({ ke: '/riwayat', judul: 'Riwayat', isi: 'Keputusan selesai & komentar', ikon: '◷' });
  return dasar;
}

/** Format tanggal Indonesia dari string ISO. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HalamanDashboard({ sesi }) {
  const adalahSesepuh = sesi?.peran === 'sesepuh';
  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [statusDm, setStatusDm] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);
  const [mulaiSibuk, setMulaiSibuk] = useState(false);
  const [galatMulai, setGalatMulai] = useState('');

  async function tanganiMulaiPenilaian() {
    setMulaiSibuk(true);
    setGalatMulai('');
    try {
      await mulaiPenilaian();
      setAcara(await getAcara());
    } catch (error) {
      setGalatMulai(error.message || 'Acara gagal dimulai.');
    } finally {
      setMulaiSibuk(false);
    }
  }

  useEffect(() => {
    let batal = false;
    (async () => {
      const [a, k, s, h] = await Promise.all([
        getAcara(),
        getKandidat(),
        getStatusSemuaDm(),
        getHasilVoting().catch(() => null),
      ]);
      if (batal) return;
      setAcara(a);
      setKandidat(k);
      setStatusDm(s);
      setHasil(h);
      setMemuat(false);
    })();
    return () => {
      batal = true;
    };
  }, []);

  const jumlahSudah = statusDm ? URUTAN_DM.filter((d) => statusDm[d]).length : 0;
  const dmSaya = DECISION_MAKERS.find((d) => d.key === sesi?.peran);
  const pintasan = daftarPintasan(sesi?.peran);

  // Pemenang dibaca dari hasil konsensus atau ringkasan acara, lalu dicocokkan ke data kandidat.
  const pemenangFinal = hasil?.rincian?.[0] ?? null;
  const kodePemenang = pemenangFinal?.kode ?? acara?.pemenang_kode ?? null;
  const kandidatPemenang = kodePemenang
    ? kandidat.find((k) => k.kode === kodePemenang) ?? null
    : null;

  return (
    <div className="space-y-6">
      {/* ================= HERO: SAMBUTAN ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Dashboard
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Selamat datang, {sesi?.nama}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              Anda masuk sebagai{' '}
              <span className="font-semibold text-emas-200">{dmSaya?.jabatan}</span>. Penilaian Anda
              akan diberi bobot suara{' '}
              <span className="angka font-semibold text-emas-200">{dmSaya?.bobotSuara}</span> dalam
              pengambilan keputusan kelompok.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="chip-emas">
              <span aria-hidden="true">◈</span>
              {adalahSesepuh
                ? `${METODE.penilaianIndividual} → ${METODE.konsensus.split(' (')[0]}`
                : METODE.penilaianIndividual}
            </span>
            {acara?.status && <BadgeStatus status={acara.status} gelap ukuran="sm" />}
            {acara?.status === STATUS_ACARA.DRAFT && adalahSesepuh && (
              <button
                type="button"
                onClick={tanganiMulaiPenilaian}
                disabled={mulaiSibuk}
                className="rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-3 py-1.5 text-xs font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mulaiSibuk ? 'Memulai…' : 'Mulai penilaian'}
              </button>
            )}
            {adalahSesepuh && (
              <a
                href="#bukti-akurasi"
                className="rounded-md border border-emas-500/60 px-2.5 py-1 text-xs font-medium text-emas-200 transition hover:bg-emas-500/15 hover:text-emas-100"
              >
                Bukti akurasi ↓
              </a>
            )}
          </div>
        </div>
      </Kartu>

      {galatMulai && (
        <p role="alert" className="rounded-md border border-bahaya-200 bg-bahaya-50 px-3 py-2 text-sm text-bahaya">
          {galatMulai}
        </p>
      )}

      {memuat ? (
        <Kartu className="p-6 text-sm text-netral-500">Memuat data acara…</Kartu>
      ) : (
        <>
          {/* ================= STATUS ACARA ================= */}
          <Kartu varian="tebal" bingkai>
            <JudulKartu
              keterangan="Satu hajatan yang sedang diputuskan"
              aksi={<BadgeStatus status={acara?.status} />}
            >
              {acara?.nama_acara}
            </JudulKartu>

            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                  Jenis hajatan
                </div>
                <div className="mt-1 font-medium capitalize text-sogan-800">{acara?.jenis}</div>
              </div>
              <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                  Neptu mempelai
                </div>
                <div className="angka mt-1 font-medium text-sogan-800">
                  {acara?.neptu_pria} + {acara?.neptu_wanita} ={' '}
                  <span className="font-semibold text-emas-700">
                    {(acara?.neptu_pria ?? 0) + (acara?.neptu_wanita ?? 0)}
                  </span>
                </div>
              </div>
              <div className="rounded-lg border border-sogan-200 bg-krem-100/60 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-wide text-netral-500">
                  Metode
                </div>
                <div className="mt-1 text-sm font-medium text-sogan-800">
                  {adalahSesepuh
                    ? `${METODE.penilaianIndividual} → ${METODE.konsensus.split(' (')[0]}`
                    : METODE.penilaianIndividual}
                </div>
              </div>
            </div>
          </Kartu>

          {/* ================= BUKTI AKURASI (khusus Sesepuh, memuat tabel Borda) ================= */}
          {adalahSesepuh && <PanelBuktiAkurasi />}

          {/* ================= STATUS DM + PINTASAN ================= */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Kartu varian="tebal" className="lg:col-span-2">
              <JudulKartu
                keterangan="Keputusan final diproses hanya setelah ketiga DM mengirim penilaian"
                aksi={
                  <span className="chip-krem">
                    <span className="angka font-semibold text-sogan-800">{jumlahSudah}</span>
                    <span className="text-netral-400">/</span>
                    <span className="angka">{URUTAN_DM.length}</span>
                    <span>menilai</span>
                  </span>
                }
              >
                Status Penilaian
              </JudulKartu>

              <ul className="divide-y divide-sogan-200/70">
                {DECISION_MAKERS.map((dm) => {
                  const sudah = Boolean(statusDm?.[dm.key]);
                  const saya = dm.key === sesi?.peran;
                  return (
                    <li
                      key={dm.key}
                      className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${
                        saya ? 'bg-emas-500/10' : ''
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-sm ring-1 ${
                            sudah
                              ? 'bg-gradient-to-b from-selesai-50 to-selesai-100 text-selesai ring-selesai-300'
                              : 'bg-gradient-to-b from-netral-50 to-netral-200 text-netral-400 ring-netral-300'
                          }`}
                        >
                          {sudah ? '✓' : '—'}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-sogan-800">
                            {dm.nama}
                            {saya && (
                              <span className="rounded bg-emas-200 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-emas-900 ring-1 ring-emas-400">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-netral-500">
                            Bobot suara <span className="angka font-semibold">{dm.bobotSuara}</span>{' '}
                            · {dm.kriteriaDitekankan}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ring-1 ${
                          sudah
                            ? 'bg-gradient-to-b from-selesai-50 to-selesai-100 text-selesai ring-selesai-300'
                            : 'bg-gradient-to-b from-netral-50 to-netral-200 text-netral-500 ring-netral-300'
                        }`}
                      >
                        {sudah ? 'Sudah menilai' : 'Belum menilai'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Gerbang voting */}
              <div className="border-t border-sogan-200 px-5 py-3.5">
                {jumlahSudah === URUTAN_DM.length ? (
                  <p className="rounded-md border border-selesai-300 bg-selesai-50 px-3 py-2 text-sm text-selesai">
                    {adalahSesepuh
                      ? '✓ Ketiga DM sudah menilai. Konsensus Weighted Borda sudah tersedia di menu Konsensus.'
                      : '✓ Ketiga DM sudah menilai. Keputusan final dan ruang komentar tersedia di menu Riwayat.'}
                  </p>
                ) : (
                  <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2 text-sm text-netral-600">
                    <span aria-hidden="true">🔒</span> Voting terkunci. Menunggu{' '}
                    <span className="font-semibold text-sogan-800">
                      {URUTAN_DM.length - jumlahSudah} DM
                    </span>{' '}
                    lagi mengirim penilaian.
                  </p>
                )}
              </div>
            </Kartu>

            {/* Pintasan */}
            <Kartu varian="tebal">
              <JudulKartu keterangan="Menu utama">Pintasan</JudulKartu>
              <div className="space-y-2 p-4">
                {pintasan.map((p) => (
                  <Link
                    key={p.ke}
                    to={p.ke}
                    className="group flex items-center gap-3 rounded-lg border border-sogan-200 bg-gradient-to-br from-netral-0 to-krem-200 px-3 py-2.5 shadow-sm transition hover:border-emas-400 hover:from-emas-50 hover:to-krem-100"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-sogan-700 text-sm text-emas-200 shadow-sm transition group-hover:bg-sogan-800"
                    >
                      {p.ikon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-sogan-800">{p.judul}</span>
                      <span className="block truncate text-xs text-netral-500">{p.isi}</span>
                    </span>
                    <span
                      aria-hidden="true"
                      className="ml-auto text-emas-600 transition group-hover:translate-x-0.5"
                    >
                      ›
                    </span>
                  </Link>
                ))}
              </div>
            </Kartu>
          </div>

          {/* ================= HASIL RINGKAS ================= */}
          {kodePemenang && (
            <Kartu varian="emas" bingkai>
              <JudulKartu
                gelap
                keterangan={
                  adalahSesepuh
                    ? 'Hasil final dibaca dari database yang sama; rincian Borda khusus Sesepuh'
                    : 'Ringkasan tanggal terpilih; komentar keputusan tersedia di menu Riwayat'
                }
                aksi={<BadgeStatus status={STATUS_ACARA.SELESAI} ukuran="sm" gelap />}
              >
                Tanggal Terpilih
              </JudulKartu>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-emas-300/70">
                    Kandidat {kodePemenang}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 font-judul text-xl font-semibold text-emas-100">
                    {kandidatPemenang ? (
                      <>
                        <BadgeWeton
                          hari={kandidatPemenang.hari}
                          pasaran={kandidatPemenang.pasaran}
                          gelap
                        />
                        <span className="text-sm font-normal text-krem-200/80">
                          {tanggalPanjang(kandidatPemenang.tanggal)}
                        </span>
                      </>
                    ) : (
                      <span className="text-base font-normal text-krem-200/70">
                        Data kandidat terpilih tidak ditemukan
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-xs text-krem-200/70">
                    {adalahSesepuh && pemenangFinal && (
                      <>
                        <span className="angka font-semibold text-emas-200">
                          {pemenangFinal.totalPoin} poin
                        </span>
                        {kandidatPemenang && ' · '}
                      </>
                    )}
                    {kandidatPemenang && (
                      <span className="angka">Rp {kandidatPemenang.biaya} juta</span>
                    )}
                  </div>
                </div>
                {adalahSesepuh ? (
                  <Link
                    to="/hasil"
                    className="rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-2 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500"
                  >
                    Lihat rincian konsensus →
                  </Link>
                ) : (
                  <Link
                    to="/riwayat"
                    className="rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-4 py-2 text-sm font-semibold text-sogan-900 shadow-md transition hover:from-emas-300 hover:to-emas-500"
                  >
                    Lihat riwayat &amp; komentar →
                  </Link>
                )}
              </div>
            </Kartu>
          )}
        </>
      )}
    </div>
  );
}
