/**
 * ============================================================================
 *  Halaman: Konsensus & Hasil
 * ============================================================================
 *  Panduan bagian 6.3 + 8 + 10:
 *    - Voting terkunci sampai KETIGA DM mengirim penilaian (cekGerbangVoting)
 *    - Poin Borda = (n - ranking + 1) x bobot jabatan
 *    - Tertinggi menang; SERI dimenangkan ranking Sesepuh
 *    - Hasil final dihitung sekali lalu dibaca ketiga akun
 *
 *  Halaman ini menampilkan rincian poin per DM supaya hasilnya dapat
 *  diperiksa ulang, bukan hanya menampilkan pemenang.
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import Kartu, { JudulKartu, BlokTeks } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import {
  getAcara,
  getKandidat,
  getStatusSemuaDm,
  getHasilVoting,
} from '../data/index.js';
import { cekGerbangVoting, poinBorda } from '../shared/borda.js';
import {
  BOBOT_JABATAN,
  DECISION_MAKERS,
  URUTAN_DM,
  STATUS_ACARA,
  METODE,
} from '../shared/constants.js';

/** Format tanggal Indonesia. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HalamanHasil({ sesi }) {
  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [statusDm, setStatusDm] = useState(null);
  const [hasil, setHasil] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let batal = false;
    (async () => {
      const [a, k, s, h] = await Promise.all([
        getAcara(),
        getKandidat(),
        getStatusSemuaDm(),
        getHasilVoting(),
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

  const gerbang = useMemo(() => cekGerbangVoting(statusDm ?? {}), [statusDm]);
  const petaKandidat = useMemo(
    () => Object.fromEntries(kandidat.map((k) => [k.kode, k])),
    [kandidat]
  );

  const pemenang = hasil?.rincian?.find((r) => r.rankingFinal === 1) ?? null;
  const jumlahKandidat = hasil?.jumlahKandidat ?? kandidat.length;

  if (memuat) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat hasil konsensus…</Kartu>;
  }

  /* ---------------- voting belum terbuka ---------------- */
  if (!gerbang.terbuka || !hasil) {
    const belum = DECISION_MAKERS.filter((d) => gerbang.belum.includes(d.key));
    return (
      <div className="space-y-6">
        <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
          <div className="relative z-10">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Konsensus
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Voting masih terkunci
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              Hasil Weighted Borda hanya dibuka setelah ketiga decision maker mengirim penilaian.
              Aturan ini mencegah hasil dihitung dari data yang belum lengkap.
            </p>
          </div>
        </Kartu>

        <Kartu varian="tebal" bingkai>
          <JudulKartu
            keterangan="Gerbang voting"
            aksi={
              <span className="chip-krem">
                <span className="angka font-semibold text-sogan-800">{gerbang.sudah}</span>
                <span className="text-netral-400">/</span>
                <span className="angka">{gerbang.total}</span>
                <span>terkirim</span>
              </span>
            }
          >
            Menunggu Penilaian
          </JudulKartu>
          <ul className="divide-y divide-sogan-200/70">
            {DECISION_MAKERS.map((d) => {
              const sudah = Boolean(statusDm?.[d.key]);
              return (
                <li key={d.key} className="flex items-center justify-between gap-3 px-5 py-3">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 ${
                        sudah
                          ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                          : 'bg-netral-100 text-netral-400 ring-netral-300'
                      }`}
                    >
                      {sudah ? '✓' : '—'}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-sogan-800">
                        {d.nama}
                      </span>
                      <span className="block text-xs text-netral-500">
                        Bobot suara <span className="angka font-semibold">{d.bobotSuara}</span>
                      </span>
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                      sudah
                        ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                        : 'bg-netral-50 text-netral-500 ring-netral-300'
                    }`}
                  >
                    {sudah ? 'Sudah menilai' : 'Belum menilai'}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-sogan-200 px-5 py-3.5">
            <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2 text-sm text-netral-600">
              <span aria-hidden="true">🔒</span> Menunggu{' '}
              <span className="font-semibold text-sogan-800">
                {belum.map((d) => d.nama).join(', ') || '—'}
              </span>{' '}
              mengirim penilaian.
            </p>
          </div>
        </Kartu>

        <BlokTeks judul="Kenapa terkunci?" ikon="◈">
          Bila hasil dihitung saat data belum lengkap, pemenang bisa berubah setelah DM terakhir
          mengirim. Karena itu sistem menahan hasil sampai lengkap, lalu menghitungnya sekali dan
          menyimpannya agar ketiga akun membaca angka yang sama.
        </BlokTeks>
      </div>
    );
  }

  /* ---------------- voting terbuka ---------------- */
  const kandidatPemenang = pemenang ? petaKandidat[pemenang.kode] : null;
  const maksPoin = Math.max(...hasil.rincian.map((r) => r.totalPoin));

  return (
    <div className="space-y-6">
      {/* ================= HERO PEMENANG ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Tanggal Terpilih
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Kandidat {pemenang?.kode}
              {kandidatPemenang && (
                <>
                  {' — '}
                  <BadgeWeton
                    hari={kandidatPemenang.hari}
                    pasaran={kandidatPemenang.pasaran}
                    gelap
                  />
                </>
              )}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              {kandidatPemenang ? tanggalPanjang(kandidatPemenang.tanggal) : '—'} ·{' '}
              {kandidatPemenang ? `biaya Rp ${kandidatPemenang.biaya} juta` : ''}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <BadgeStatus status={STATUS_ACARA.SELESAI} gelap ukuran="sm" />
            <span className="chip-emas">
              Total <span className="angka font-semibold">{pemenang?.totalPoin ?? 0}</span> poin
            </span>
          </div>
        </div>

        {/* Tiga poin penyusun kemenangan */}
        {pemenang && (
          <div className="relative z-10 mt-4 grid gap-2 sm:grid-cols-3">
            {URUTAN_DM.map((key) => {
              const dm = DECISION_MAKERS.find((d) => d.key === key);
              const poin =
                key === 'sesepuh'
                  ? pemenang.poinSesepuh
                  : key === 'orangtua'
                    ? pemenang.poinOrtu
                    : pemenang.poinWo;
              const rank = pemenang.rankingPerDm?.[key];
              return (
                <div
                  key={key}
                  className="rounded-lg border border-emas-500/25 bg-[rgba(26,18,16,0.35)] px-3 py-2.5"
                >
                  <div className="text-[0.62rem] uppercase tracking-wide text-emas-300/70">
                    {dm?.nama}
                  </div>
                  <div className="angka mt-0.5 text-lg font-semibold text-emas-100">
                    {poin} <span className="text-xs font-normal text-krem-200/60">poin</span>
                  </div>
                  <div className="text-[0.66rem] text-krem-200/60">
                    ranking {rank} × bobot {BOBOT_JABATAN[key]}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Kartu>

      {/* ================= TABEL BORDA ================= */}
      <Kartu varian="tebal" bingkai>
        <JudulKartu
          keterangan={`n = ${jumlahKandidat} · poin = (n − ranking + 1) × bobot jabatan`}
          aksi={<span className="chip-krem">{METODE.konsensus.split(' (')[0]}</span>}
        >
          Rincian Weighted Borda
        </JudulKartu>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] border-collapse text-sm">
            <caption className="sr-only">
              Rincian poin Weighted Borda tiap kandidat dari tiga decision maker
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
                {DECISION_MAKERS.map((d) => (
                  <th
                    key={d.key}
                    scope="col"
                    className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700"
                    title={`${d.nama} — bobot jabatan ${d.bobotSuara}`}
                  >
                    {d.nama.split(' ')[0]}
                    <span className="ml-0.5 text-[0.6rem] font-normal text-netral-400">
                      ×{d.bobotSuara}
                    </span>
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-sogan-700">
                  Total
                </th>
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-sogan-700">
                  Porsi
                </th>
              </tr>
            </thead>
            <tbody>
              {hasil.rincian.map((r) => {
                const k = petaKandidat[r.kode];
                const juara = r.rankingFinal === 1;
                return (
                  <tr
                    key={r.kode}
                    className={`border-b border-sogan-200/60 ${
                      juara ? 'bg-emas-500/12' : 'odd:bg-krem-50/50'
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
                        {r.rankingFinal}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-semibold text-sogan-800">Kandidat {r.kode}</span>
                      {r.seri && (
                        <span className="ml-1.5 rounded bg-emas-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase text-emas-800 ring-1 ring-emas-300">
                          seri
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      {k ? (
                        <BadgeWeton hari={k.hari} pasaran={k.pasaran} ukuran="sm" />
                      ) : (
                        <span className="text-netral-400">—</span>
                      )}
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs">
                      <span className="font-semibold text-sogan-800">{r.poinSesepuh}</span>
                      <span className="ml-1 text-[0.62rem] text-netral-400">
                        r{r.rankingPerDm?.sesepuh}
                      </span>
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs">
                      <span className="font-semibold text-sogan-800">{r.poinOrtu}</span>
                      <span className="ml-1 text-[0.62rem] text-netral-400">
                        r{r.rankingPerDm?.orangtua}
                      </span>
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs">
                      <span className="font-semibold text-sogan-800">{r.poinWo}</span>
                      <span className="ml-1 text-[0.62rem] text-netral-400">
                        r{r.rankingPerDm?.wo}
                      </span>
                    </td>
                    <td className="angka px-3 py-2.5 text-right font-semibold text-sogan-800">
                      {r.totalPoin}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-sogan-200">
                        <div
                          className={`h-full rounded-full ${
                            juara
                              ? 'bg-gradient-to-r from-emas-500 to-emas-300'
                              : 'bg-gradient-to-r from-sogan-500 to-sogan-400'
                          }`}
                          style={{ width: `${maksPoin ? (r.totalPoin / maksPoin) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-sogan-200 px-5 py-3">
          <p className="text-xs leading-relaxed text-netral-500">
            <span className="font-semibold text-sogan-700">r</span> = ranking dari DM tersebut.
            Poin tiap DM = (n − r + 1) × bobot jabatan. Seri total poin dimenangkan kandidat dengan
            ranking Sesepuh lebih tinggi ({METODE.penentuSeri}).
            {hasil.seriTeratasi && (
              <span className="ml-1 font-medium text-emas-700">
                Terdapat seri pada perhitungan ini dan telah diatasi sesuai aturan.
              </span>
            )}
          </p>
        </div>
      </Kartu>

      {/* ================= PERBANDINGAN RANKING PER DM ================= */}
      <Kartu varian="tebal">
        <JudulKartu keterangan="Memperlihatkan mengapa konsensus bisa berbeda dari pilihan pribadi">
          Perbandingan Ranking Tiap DM
        </JudulKartu>
        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-sm">
            <caption className="sr-only">Ranking tiap kandidat menurut masing-masing DM</caption>
            <thead>
              <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                <th scope="col" className="px-3 py-2.5 text-xs font-semibold text-sogan-700">
                  Kandidat
                </th>
                {DECISION_MAKERS.map((d) => (
                  <th
                    key={d.key}
                    scope="col"
                    className="px-3 py-2.5 text-center text-xs font-semibold text-sogan-700"
                  >
                    {d.nama.split(' ')[0]}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2.5 text-center text-xs font-semibold text-sogan-700">
                  Final
                </th>
              </tr>
            </thead>
            <tbody>
              {hasil.rincian.map((r) => (
                <tr key={r.kode} className="border-b border-sogan-200/60 odd:bg-krem-50/50">
                  <td className="px-3 py-2 font-medium text-sogan-800">Kandidat {r.kode}</td>
                  {URUTAN_DM.map((key) => (
                    <td key={key} className="angka px-3 py-2 text-center text-xs text-netral-600">
                      {r.rankingPerDm?.[key]}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <span
                      className={`angka inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.66rem] font-bold ring-1 ${
                        r.rankingFinal === 1
                          ? 'bg-gradient-to-b from-emas-300 to-emas-500 text-sogan-900 ring-emas-600'
                          : 'bg-netral-100 text-netral-600 ring-netral-300'
                      }`}
                    >
                      {r.rankingFinal}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Kartu>

      {/* ================= JEJAK PERHITUNGAN ================= */}
      <BlokTeks judul="Cara membaca hasil" ikon="◈">
        Kandidat {pemenang?.kode} menang dengan{' '}
        <span className="angka font-semibold text-sogan-800">{pemenang?.totalPoin} poin</span> dari
        maksimum{' '}
        <span className="angka font-semibold text-sogan-800">
          {jumlahKandidat * (BOBOT_JABATAN.sesepuh + BOBOT_JABATAN.orangtua + BOBOT_JABATAN.wo)}
        </span>
        . Poin maksimum terjadi bila satu kandidat menjadi ranking 1 di ketiga DM. Metode:{' '}
        {METODE.penilaianIndividual} untuk penilaian individual, lalu {METODE.konsensus} untuk
        konsensus. {METODE.dilarang} tidak dipakai.
      </BlokTeks>

      <BlokTeks judul="Status acara" ikon="◈">
        {acara?.nama_acara} · status{' '}
        <span className="font-semibold text-sogan-800">{acara?.status}</span>. Hasil final dihitung
        sekali dan dibaca ketiga akun dari sumber yang sama, sehingga angkanya identik di semua
        perangkat.
      </BlokTeks>
    </div>
  );
}
