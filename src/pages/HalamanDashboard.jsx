/**
 * ============================================================================
 *  Halaman: Dashboard
 * ============================================================================
 *  Menampilkan status acara dan status tiap DM (sudah/belum menilai).
 *  Panduan bagian 10: "Status acara, status tiap DM, pintasan menu".
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import { getAcara, getStatusSemuaDm, getHasilVoting } from '../data/index.js';
import { DECISION_MAKERS, URUTAN_DM, STATUS_ACARA, METODE } from '../shared/constants.js';

export default function HalamanDashboard({ sesi }) {
  const [acara, setAcara] = useState(null);
  const [statusDm, setStatusDm] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let batal = false;
    (async () => {
      const [a, s, h] = await Promise.all([getAcara(), getStatusSemuaDm(), getHasilVoting()]);
      if (batal) return;
      setAcara(a);
      setStatusDm(s);
      setHasil(h);
      setMemuat(false);
    })();
    return () => {
      batal = true;
    };
  }, []);

  const jumlahSudah = statusDm ? URUTAN_DM.filter((d) => statusDm[d]).length : 0;

  return (
    <div className="space-y-6">
      {/* ---------------- SAMBUTAN ---------------- */}
      <div>
        <h1 className="garis-emas text-2xl font-semibold">
          Selamat datang, {sesi?.nama}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-netral-600">
          Anda masuk sebagai{' '}
          <span className="font-medium text-sogan-800">
            {DECISION_MAKERS.find((d) => d.key === sesi?.peran)?.jabatan}
          </span>
          . Bobot suara Anda{' '}
          <span className="angka font-semibold text-emas-700">
            {DECISION_MAKERS.find((d) => d.key === sesi?.peran)?.bobotSuara}
          </span>
          .
        </p>
      </div>

      {memuat ? (
        <Kartu className="p-6 text-sm text-netral-500">Memuat data acara…</Kartu>
      ) : (
        <>
          {/* ---------------- STATUS ACARA ---------------- */}
          <Kartu varian="tebal">
            <JudulKartu
              keterangan="Satu hajatan yang sedang diputuskan"
              aksi={<BadgeStatus status={acara?.status} />}
            >
              {acara?.nama_acara}
            </JudulKartu>

            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <div className="text-xs uppercase tracking-wide text-netral-400">Jenis hajatan</div>
                <div className="mt-1 font-medium capitalize text-sogan-800">{acara?.jenis}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-netral-400">
                  Neptu mempelai
                </div>
                <div className="angka mt-1 font-medium text-sogan-800">
                  {acara?.neptu_pria} + {acara?.neptu_wanita} ={' '}
                  {(acara?.neptu_pria ?? 0) + (acara?.neptu_wanita ?? 0)}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-netral-400">Metode</div>
                <div className="mt-1 text-sm font-medium text-sogan-800">
                  {METODE.penilaianIndividual} → {METODE.konsensus.split(' (')[0]}
                </div>
              </div>
            </div>
          </Kartu>

          {/* ---------------- STATUS 3 DM ---------------- */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Kartu className="lg:col-span-2">
              <JudulKartu
                keterangan="Voting terbuka hanya setelah ketiga DM mengirim penilaian"
                aksi={
                  <span className="angka text-sm font-semibold text-sogan-700">
                    {jumlahSudah}/{URUTAN_DM.length}
                  </span>
                }
              >
                Status Penilaian
              </JudulKartu>

              <ul className="divide-y divide-netral-200">
                {DECISION_MAKERS.map((dm) => {
                  const sudah = Boolean(statusDm?.[dm.key]);
                  const saya = dm.key === sesi?.peran;
                  return (
                    <li
                      key={dm.key}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            sudah
                              ? 'bg-[#E6F2EA] text-selesai'
                              : 'bg-netral-100 text-netral-400'
                          }`}
                        >
                          {sudah ? '✓' : '—'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-sogan-800">
                            {dm.nama}
                            {saya && (
                              <span className="ml-2 rounded bg-emas-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emas-800">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-netral-500">
                            Bobot suara <span className="angka">{dm.bobotSuara}</span> ·{' '}
                            {dm.kriteriaDitekankan}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                          sudah
                            ? 'bg-[#E6F2EA] text-selesai ring-[#B3D9C2]'
                            : 'bg-netral-50 text-netral-500 ring-netral-200'
                        }`}
                      >
                        {sudah ? 'Sudah menilai' : 'Belum menilai'}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Gerbang voting */}
              <div className="border-t border-netral-200 px-5 py-3">
                {jumlahSudah === URUTAN_DM.length ? (
                  <p className="text-sm text-selesai">
                    ✓ Ketiga DM sudah menilai. Konsensus Weighted Borda sudah dapat dihitung.
                  </p>
                ) : (
                  <p className="text-sm text-netral-500">
                    🔒 Voting terkunci. Menunggu{' '}
                    <span className="font-medium text-sogan-700">
                      {URUTAN_DM.length - jumlahSudah} DM
                    </span>{' '}
                    lagi mengirim penilaian.
                  </p>
                )}
              </div>
            </Kartu>

            {/* ---------------- PINTASAN ---------------- */}
            <Kartu>
              <JudulKartu>Pintasan</JudulKartu>
              <div className="space-y-2 p-5">
                {[
                  { ke: '/kandidat', judul: 'Data Acara', isi: 'Lihat kandidat & weton' },
                  { ke: '/bobot', judul: 'Atur Bobot', isi: '5 kriteria, total 100%' },
                  { ke: '/penilaian', judul: 'Penilaian Saya', isi: 'S, V, ranking WP' },
                  { ke: '/hasil', judul: 'Konsensus', isi: 'Hasil Weighted Borda' },
                ].map((p) => (
                  <Link
                    key={p.ke}
                    to={p.ke}
                    className="block rounded-md border border-netral-200 px-3 py-2 transition hover:border-emas-400 hover:bg-emas-50"
                  >
                    <div className="text-sm font-medium text-sogan-800">{p.judul}</div>
                    <div className="text-xs text-netral-500">{p.isi}</div>
                  </Link>
                ))}
              </div>
            </Kartu>
          </div>

          {/* ---------------- HASIL (jika sudah ada) ---------------- */}
          {hasil && (
            <Kartu varian="tebal">
              <JudulKartu
                keterangan="Hasil final dibaca dari database yang sama oleh ketiga akun"
                aksi={<BadgeStatus status={STATUS_ACARA.SELESAI} ukuran="sm" />}
              >
                Tanggal Terpilih
              </JudulKartu>
              <div className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <div className="angka text-sm text-netral-500">
                    {hasil.rincian?.[0]?.kode ?? ''}
                  </div>
                  <div className="mt-1 font-judul text-xl font-semibold text-sogan-800">
                    {acara?.tanggal_terpilih ? (
                      <BadgeWeton {...acara.tanggal_terpilih} />
                    ) : (
                      'Kandidat E — Sabtu Legi'
                    )}
                  </div>
                </div>
                <Link
                  to="/hasil"
                  className="rounded-md bg-sogan-700 px-4 py-2 text-sm font-semibold text-krem-50 transition hover:bg-sogan-800"
                >
                  Lihat rincian konsensus →
                </Link>
              </div>
            </Kartu>
          )}
        </>
      )}
    </div>
  );
}
