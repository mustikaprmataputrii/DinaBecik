/**
 * ============================================================================
 *  Halaman: Data Acara & Kandidat
 * ============================================================================
 *  Panduan bagian 7 + 10: menampilkan identitas acara, neptu mempelai, dan
 *  6 kandidat tanggal beserta nilai 5 kriteria.
 *
 *  Poin penting yang sengaja ditampilkan terbuka: skor C1 (weton) TIDAK
 *  diinput manual, melainkan dihitung dari tanggal lewat aturan sisa-bagi-5.
 *  Halaman ini memperlihatkan sisa dan skornya, sehingga bisa diperiksa ulang.
 *
 *  Acuan: Tabel 7.1. Skor yang tampil harus sama dengan hitungan fungsi
 *  hitungSkorWeton(), bukan angka yang ditulis di tampilan.
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import Kartu, { JudulKartu, BlokTeks } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import { getAcara, getKandidat } from '../data/index.js';
import { hitungSkorWeton } from '../shared/weton.js';
import { KRITERIA, ATURAN_WETON, TOTAL_BOBOT_WAJIB } from '../shared/constants.js';

/** Format tanggal Indonesia. */
function tanggalPanjang(iso) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HalamanKandidat({ sesi }) {
  const [acara, setAcara] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [kodeTerpilih, setKodeTerpilih] = useState(null);

  useEffect(() => {
    let batal = false;
    (async () => {
      const [a, k] = await Promise.all([getAcara(), getKandidat()]);
      if (batal) return;
      setAcara(a);
      setKandidat(k);
      setMemuat(false);
    })();
    return () => {
      batal = true;
    };
  }, []);

  /**
   * Hitung ulang weton tiap kandidat dari tanggalnya, lalu bandingkan dengan
   * data yang tersimpan. Kalau berbeda, tampilan memberi tanda agar tidak
   * diam-diam salah.
   */
  const verifikasi = useMemo(() => {
    if (!acara || kandidat.length === 0) return [];
    return kandidat.map((k) => {
      const hitung = hitungSkorWeton(k.tanggal, acara.neptu_pria, acara.neptu_wanita);
      return {
        kode: k.kode,
        hitung,
        cocok:
          hitung.hari === k.hari &&
          hitung.pasaran === k.pasaran &&
          hitung.neptuWeton === k.neptuWetonH &&
          hitung.skor === k.skorWeton,
      };
    });
  }, [acara, kandidat]);

  const jumlahCocok = verifikasi.filter((v) => v.cocok).length;
  const semuaCocok = verifikasi.length > 0 && jumlahCocok === verifikasi.length;
  const detail = verifikasi.find((v) => v.kode === kodeTerpilih) ?? null;
  const kandidatTerpilih = kandidat.find((k) => k.kode === kodeTerpilih) ?? null;

  if (memuat) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat data acara…</Kartu>;
  }

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Data Acara
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              {acara?.nama_acara}
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              {kandidat.length} kandidat tanggal. Skor weton (C1) dihitung otomatis dari tanggal —
              tidak pernah diinput manual.
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

      {/* ================= IDENTITAS ACARA ================= */}
      <Kartu varian="tebal" bingkai>
        <JudulKartu keterangan="Neptu mempelai menjadi masukan tetap untuk semua kandidat">
          Identitas Hajatan
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
            <div className="angka mt-1 font-semibold text-emas-700">
              {(acara?.neptu_pria ?? 0) + (acara?.neptu_wanita ?? 0)}
            </div>
          </div>
        </div>
      </Kartu>

      {/* ================= TABEL KANDIDAT ================= */}
      <Kartu varian="tebal">
        <JudulKartu
          keterangan="Klik satu baris untuk melihat perhitungan weton-nya"
          aksi={
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm ring-1 ${
                semuaCocok
                  ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                  : 'bg-[#FDECEA] text-bahaya ring-[#F2C4C0]'
              }`}
            >
              {semuaCocok ? '✓ ' : '! '}
              {jumlahCocok}/{verifikasi.length} weton cocok
            </span>
          }
        >
          Kandidat Tanggal
        </JudulKartu>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-sm">
            <caption className="sr-only">
              Daftar kandidat tanggal beserta weton dan nilai lima kriteria
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
                  Neptu
                </th>
                {KRITERIA.map((k) => (
                  <th
                    key={k.key}
                    scope="col"
                    title={k.nama}
                    className="px-2 py-2.5 text-right text-xs font-semibold text-sogan-700"
                  >
                    {k.kode}
                    <span className="ml-0.5 text-[0.6rem] font-normal text-netral-400">
                      {k.tipe === 'cost' ? '−' : '+'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kandidat.map((k) => {
                const v = verifikasi.find((x) => x.kode === k.kode);
                const aktif = k.kode === kodeTerpilih;
                return (
                  <tr
                    key={k.kode}
                    onClick={() => setKodeTerpilih(aktif ? null : k.kode)}
                    className={`cursor-pointer border-b border-sogan-200/60 transition ${
                      aktif ? 'bg-emas-500/12' : 'odd:bg-krem-50/50 hover:bg-emas-50/60'
                    }`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                        {k.kode}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-netral-700">
                      {tanggalPanjang(k.tanggal)}
                    </td>
                    <td className="px-3 py-2.5">
                      <BadgeWeton hari={k.hari} pasaran={k.pasaran} ukuran="sm" />
                    </td>
                    <td className="angka px-3 py-2.5 text-right text-xs text-netral-600">
                      {k.neptuWetonH}
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs">
                      <span
                        className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-semibold ring-1 ${
                          k.skorWeton >= 4
                            ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                            : k.skorWeton >= 3
                              ? 'bg-emas-100 text-emas-800 ring-emas-300'
                              : 'bg-netral-100 text-netral-600 ring-netral-300'
                        }`}
                      >
                        {k.skorWeton}
                        {v && !v.cocok && <span title="Tidak cocok dengan hitungan ulang">!</span>}
                      </span>
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">
                      {k.biaya}
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">
                      {k.gedung}
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">
                      {k.cuaca}
                    </td>
                    <td className="angka px-2 py-2.5 text-right text-xs text-netral-600">
                      {k.tamu}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-sogan-200 px-5 py-3">
          <p className="text-xs text-netral-500">
            C1 = skor weton (1–5, benefit) · C2 = biaya dalam juta rupiah (cost) · C3 = gedung ·
            C4 = cuaca · C5 = tamu. Klik baris untuk melihat perhitungannya.
          </p>
        </div>
      </Kartu>

      {/* ================= DETAIL PERHITUNGAN WETON ================= */}
      {detail && kandidatTerpilih && (
        <Kartu varian="emas" bingkai>
          <JudulKartu
            gelap
            keterangan="Skor C1 berasal dari rumus, bukan dari isian manual"
            aksi={
              <button
                type="button"
                onClick={() => setKodeTerpilih(null)}
                className="rounded border border-emas-500/50 px-2 py-1 text-xs text-emas-200 transition hover:bg-emas-500/15"
              >
                Tutup
              </button>
            }
          >
            Perhitungan Weton — Kandidat {detail.kode}
          </JudulKartu>

          <div className="space-y-4 p-5">
            <p className="text-sm text-krem-200/85">
              <BadgeWeton
                hari={detail.hitung.hari}
                pasaran={detail.hitung.pasaran}
                neptu={detail.hitung.neptuWeton}
                gelap
              />{' '}
              · {tanggalPanjang(kandidatTerpilih.tanggal)}
            </p>

            {/* Langkah rumus, ditulis apa adanya agar bisa dicek ulang */}
            <div className="grid gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-emas-500/25 bg-[rgba(26,18,16,0.35)] px-3 py-2.5">
                <div className="text-[0.62rem] uppercase tracking-wide text-emas-300/70">
                  Neptu pria
                </div>
                <div className="angka mt-0.5 text-lg font-semibold text-emas-100">
                  {acara.neptu_pria}
                </div>
              </div>
              <div className="rounded-lg border border-emas-500/25 bg-[rgba(26,18,16,0.35)] px-3 py-2.5">
                <div className="text-[0.62rem] uppercase tracking-wide text-emas-300/70">
                  Neptu wanita
                </div>
                <div className="angka mt-0.5 text-lg font-semibold text-emas-100">
                  {acara.neptu_wanita}
                </div>
              </div>
              <div className="rounded-lg border border-emas-500/25 bg-[rgba(26,18,16,0.35)] px-3 py-2.5">
                <div className="text-[0.62rem] uppercase tracking-wide text-emas-300/70">
                  Neptu weton tanggal
                </div>
                <div className="angka mt-0.5 text-lg font-semibold text-emas-100">
                  {detail.hitung.neptuWeton}
                </div>
              </div>
              <div className="rounded-lg border border-emas-500/40 bg-emas-500/15 px-3 py-2.5">
                <div className="text-[0.62rem] uppercase tracking-wide text-emas-300/70">
                  Sisa bagi 5 → skor
                </div>
                <div className="angka mt-0.5 text-lg font-semibold text-emas-200">
                  {detail.hitung.sisa} → {detail.hitung.skor}
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-emas-500/25 bg-[rgba(26,18,16,0.45)] px-3 py-2.5">
              <p className="angka text-xs leading-relaxed text-krem-200/85">
                sisa = ({acara.neptu_pria} + {acara.neptu_wanita} + {detail.hitung.neptuWeton}) mod
                5 ={' '}
                <span className="font-semibold text-emas-200">{detail.hitung.sisa}</span> → skor{' '}
                <span className="font-semibold text-emas-200">{detail.hitung.skor}</span>
              </p>
            </div>

            <div
              className={`rounded-md border px-3 py-2 text-xs ${
                detail.cocok
                  ? 'border-[#7FC49B]/50 bg-[#2E7D4F]/20 text-[#C6E8D3]'
                  : 'border-[#F2C4C0]/60 bg-[#B3261E]/20 text-[#F8D7D3]'
              }`}
            >
              {detail.cocok
                ? '✓ Hasil hitung ulang sama dengan data tersimpan (hari, pasaran, neptu, dan skor).'
                : '! Hasil hitung ulang BERBEDA dari data tersimpan. Laporkan ke pemilik data.'}
            </div>
          </div>
        </Kartu>
      )}

      {/* ================= ATURAN WETON ================= */}
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
                    <span className="min-w-0 truncate text-sm text-sogan-800">
                      {a.keterangan}
                    </span>
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
          <JudulKartu keterangan="Nilai yang dipakai metode Weighted Product">Kriteria & Tipe</JudulKartu>
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

      <BlokTeks judul="Catatan data" ikon="◈">
        Data ini adalah data acuan Tabel 7.1 dan dikunci oleh 50 unit test. Total bobot tiap DM
        harus {TOTAL_BOBOT_WAJIB}%; bila tidak, penyimpanan ditolak. Neptu hari dan pasaran
        bersifat pasti, tetapi tafsir kecocokan dapat berbeda antar daerah.
      </BlokTeks>
    </div>
  );
}
