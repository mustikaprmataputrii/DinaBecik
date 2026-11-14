/**
 * ============================================================================
 *  Komponen: Panel Bukti Akurasi
 * ============================================================================
 *  Menampilkan angka contoh Tabel 7.1 / 7.2 / 7.3 sebagai BUKTI bahwa mesin
 *  hitung bekerja benar — bukan sekadar angka yang ditulis mati di halaman.
 *
 *  Cara kerjanya (ini yang membedakan "bukti" dari "hiasan"):
 *    1. Ambil data contoh dari fixture yang dikunci 50 unit test.
 *    2. Hitung ULANG dengan hitungWP() + hitungBorda() — fungsi yang sama
 *       persis dengan yang dipakai halaman Penilaian dan Konsensus.
 *    3. Bandingkan hasil hitung dengan angka yang tertulis di laporan.
 *    4. Tampilkan keduanya berdampingan + tanda cocok / tidak cocok.
 *
 *  Kalau ada yang merusak rumus, panel ini langsung merah. Jadi ia berfungsi
 *  sebagai alarm, bukan sekadar pajangan.
 *
 *  PENTING: panel ini SELALU memakai data contoh Tabel 7.1, tidak terpengaruh
 *  data yang diisi pengguna lewat halaman Kelola Data. Dengan begitu angka
 *  pembanding di laporan tetap bisa dibuktikan kapan saja.
 * ============================================================================
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu } from './Kartu.jsx';
import BadgeWeton from './BadgeWeton.jsx';
import {
  ACARA_CONTOH,
  ACUAN_TABEL_72,
  ACUAN_TABEL_73,
  BOBOT_DEMO,
  KANDIDAT_TABEL_71,
  KANDIDAT_UNTUK_WP,
  PEMENANG_ACUAN,
} from '../fixtures/dataAcuan.js';
import { hitungWP, rankingDariWP } from '../shared/wp.js';
import { hitungBorda } from '../shared/borda.js';
import { DECISION_MAKERS, URUTAN_DM } from '../shared/constants.js';

/** Toleransi pembanding nilai S: angka laporan ditulis 4 desimal. */
const TOLERANSI_S = 0.00005;

/** Nama pendek DM untuk kepala kolom. */
const NAMA_PENDEK = { sesepuh: 'Sesepuh', orangtua: 'Orang Tua', wo: 'WO' };

/** Format tanggal Indonesia. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Lencana kecil "cocok / tidak". */
function Tanda({ cocok }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.6rem] font-bold ring-1 ${
        cocok
          ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
          : 'bg-[#FDECEA] text-bahaya ring-[#F2C4C0]'
      }`}
    >
      {cocok ? '✓' : '!'}
    </span>
  );
}

/** Satu kotak angka: nilai hasil hitung, dengan angka laporan di bawahnya. */
function SelAngka({ hitung, acuan, cocok, desimal = 4, rankingHitung, rankingAcuan }) {
  const teksHitung = desimal === 0 ? String(hitung) : Number(hitung).toFixed(desimal);
  const teksAcuan = desimal === 0 ? String(acuan) : Number(acuan).toFixed(desimal);
  return (
    <td className="px-2 py-2 text-right align-middle">
      <div className="flex items-center justify-end gap-1.5">
        <span
          className={`angka text-xs font-semibold ${cocok ? 'text-sogan-800' : 'text-bahaya'}`}
        >
          {teksHitung}
        </span>
        <Tanda cocok={cocok} />
      </div>
      <div className="angka whitespace-nowrap text-[0.62rem] text-netral-400">
        laporan {teksAcuan}
        {rankingHitung != null && (
          <span className={rankingHitung === rankingAcuan ? '' : ' font-semibold text-bahaya'}>
            {' · '}rank {rankingHitung}/{rankingAcuan}
          </span>
        )}
      </div>
    </td>
  );
}

export default function PanelBuktiAkurasi() {
  const [putaran, setPutaran] = useState(0);
  const [waktu, setWaktu] = useState(() => new Date());

  /**
   * Hitung ulang seluruh angka acuan. `putaran` sengaja dipakai sebagai
   * dependensi supaya tombol "Hitung ulang" benar-benar menjalankan mesin lagi.
   */
  const bukti = useMemo(() => {
    // 1. Weighted Product untuk ketiga DM
    const wp = {};
    for (const dm of URUTAN_DM) {
      wp[dm] = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_DEMO[dm]);
    }

    // 2. Ranking tiap DM -> Weighted Borda
    const ranking = {};
    for (const dm of URUTAN_DM) {
      ranking[dm] = rankingDariWP(wp[dm].hasil);
    }
    const borda = hitungBorda(ranking);

    // 3. Bandingkan dengan angka laporan
    let cocokS = 0;
    let cocokRanking = 0;
    const barisWP = KANDIDAT_TABEL_71.map((k) => {
      const sel = URUTAN_DM.map((dm) => {
        const hasilHitung = wp[dm].hasil.find((h) => h.kode === k.kode);
        const angkaLaporan = ACUAN_TABEL_72[dm][k.kode];
        const cocokNilai = Math.abs(hasilHitung.s - angkaLaporan.s) < TOLERANSI_S;
        const cocokPeringkat = hasilHitung.ranking === angkaLaporan.ranking;
        if (cocokNilai) cocokS += 1;
        if (cocokPeringkat) cocokRanking += 1;
        return {
          dm,
          s: hasilHitung.s,
          sAcuan: angkaLaporan.s,
          ranking: hasilHitung.ranking,
          rankingAcuan: angkaLaporan.ranking,
          cocok: cocokNilai,
          cocokRanking: cocokPeringkat,
        };
      });
      return {
        ...k,
        sel,
        semuaCocok: sel.every((s) => s.cocok && s.cocokRanking),
      };
    });

    let cocokPoin = 0;
    let cocokFinal = 0;
    const barisBorda = ACUAN_TABEL_73.map((acuan) => {
      const hitung = borda.rincian.find((r) => r.kode === acuan.kode);
      const cocokPoinBaris = hitung.totalPoin === acuan.totalPoin;
      const cocokFinalBaris = hitung.rankingFinal === acuan.rankingFinal;
      if (cocokPoinBaris) cocokPoin += 1;
      if (cocokFinalBaris) cocokFinal += 1;
      const kandidat = KANDIDAT_TABEL_71.find((k) => k.kode === acuan.kode);
      return {
        kode: acuan.kode,
        hari: kandidat?.hari,
        pasaran: kandidat?.pasaran,
        tanggal: acuan.tanggal,
        poin: hitung.totalPoin,
        poinAcuan: acuan.totalPoin,
        rankingFinal: hitung.rankingFinal,
        rankingAcuan: acuan.rankingFinal,
        cocok: cocokPoinBaris && cocokFinalBaris,
      };
    });

    const jumlahKandidat = KANDIDAT_TABEL_71.length;
    const totalPemeriksaan = jumlahKandidat * URUTAN_DM.length * 2 + ACUAN_TABEL_73.length * 2;
    const totalCocok = cocokS + cocokRanking + cocokPoin + cocokFinal;

    const kandidatPemenang = KANDIDAT_TABEL_71.find((k) => k.kode === borda.pemenang) ?? null;

    return {
      wp,
      borda,
      kandidatPemenang,
      barisWP,
      barisBorda,
      cocokS,
      cocokRanking,
      cocokPoin,
      cocokFinal,
      totalCocok,
      totalPemeriksaan,
      jumlahKandidat,
      semuaCocok: totalCocok === totalPemeriksaan,
    };
  }, [putaran]);

  function hitungUlang() {
    setWaktu(new Date());
    setPutaran((n) => n + 1);
  }

  const kotak = [
    { label: 'Nilai S (WP)', cocok: bukti.cocokS, total: bukti.jumlahKandidat * 3 },
    { label: 'Ranking WP', cocok: bukti.cocokRanking, total: bukti.jumlahKandidat * 3 },
    { label: 'Poin Borda', cocok: bukti.cocokPoin, total: bukti.barisBorda.length },
    { label: 'Ranking final', cocok: bukti.cocokFinal, total: bukti.barisBorda.length },
  ];

  return (
    <Kartu varian="tebal" bingkai id="bukti-akurasi" className="scroll-mt-24">
      <JudulKartu
        keterangan="Data contoh Tabel 7.1 dihitung ulang oleh mesin saat ini, lalu dibandingkan dengan angka di laporan"
        aksi={
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ring-1 ${
                bukti.semuaCocok
                  ? 'bg-[#EAF5EE] text-selesai ring-[#9CCBAE]'
                  : 'bg-[#FDECEA] text-bahaya ring-[#F2C4C0]'
              }`}
            >
              {bukti.semuaCocok ? '✓' : '!'} {bukti.totalCocok}/{bukti.totalPemeriksaan} cocok
            </span>
            <button
              type="button"
              onClick={hitungUlang}
              className="rounded border border-sogan-300 bg-netral-0 px-2 py-1 text-xs font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50"
            >
              Hitung ulang
            </button>
          </div>
        }
      >
        Bukti Akurasi Perhitungan
      </JudulKartu>

      {/* ---------------- ringkasan ---------------- */}
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
        {kotak.map((k) => {
          const penuh = k.cocok === k.total;
          return (
            <div
              key={k.label}
              className={`rounded-lg border px-3 py-2 ${
                penuh ? 'border-[#9CCBAE] bg-[#EAF5EE]' : 'border-[#F2C4C0] bg-[#FDECEA]'
              }`}
            >
              <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-netral-500">
                {k.label}
              </div>
              <div
                className={`angka mt-0.5 text-base font-bold ${
                  penuh ? 'text-selesai' : 'text-bahaya'
                }`}
              >
                {k.cocok}/{k.total}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- pemenang menurut hitungan ---------------- */}
      <div className="border-t border-sogan-200 bg-krem-100/60 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs leading-relaxed text-netral-600">
            Pemenang menurut hitungan:{' '}
            <span className="font-semibold text-sogan-800">
              Kandidat {bukti.borda.pemenang}
            </span>{' '}
            —{' '}
            <BadgeWeton
              hari={bukti.kandidatPemenang?.hari}
              pasaran={bukti.kandidatPemenang?.pasaran}
              ukuran="sm"
            />{' '}
            {tanggalPanjang(bukti.kandidatPemenang?.tanggal)} ·{' '}
            <span className="angka font-semibold text-emas-700">
              {bukti.barisBorda.find((b) => b.kode === bukti.borda.pemenang)?.poin ?? 0} poin
            </span>{' '}
            · Rp {bukti.kandidatPemenang?.biaya ?? PEMENANG_ACUAN.biaya} juta
          </p>
          <span className="text-[0.62rem] text-netral-400">
            dihitung {waktu.toLocaleTimeString('id-ID')}
          </span>
        </div>
      </div>

      {/* ---------------- tabel WP (Tabel 7.2) ---------------- */}
      <div className="border-t border-sogan-200">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-3">
          <h3 className="text-sm font-semibold text-sogan-800">
            Weighted Product — pembanding Tabel 7.2
          </h3>
          <span className="text-[0.62rem] text-netral-400">
            sel: <span className="font-semibold">hasil hitung</span> / angka laporan
          </span>
        </div>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-sm">
            <caption className="sr-only">
              Perbandingan nilai S hasil hitung mesin dengan angka Tabel 7.2 pada laporan
            </caption>
            <thead>
              <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-sogan-700">
                  Kandidat
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-sogan-700">
                  Weton
                </th>
                {DECISION_MAKERS.map((d) => (
                  <th
                    key={d.key}
                    scope="col"
                    className="px-2 py-2 text-right text-xs font-semibold text-sogan-700"
                    title={`Bobot ${d.nama}: weton ${BOBOT_DEMO[d.key].weton}%, biaya ${BOBOT_DEMO[d.key].biaya}%`}
                  >
                    {NAMA_PENDEK[d.key]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bukti.barisWP.map((b) => (
                <tr
                  key={b.kode}
                  className={`border-b border-sogan-200/60 ${
                    b.kode === bukti.borda.pemenang ? 'bg-emas-500/12' : 'odd:bg-krem-50/50'
                  }`}
                >
                  <td className="px-3 py-2">
                    <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                      {b.kode}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <BadgeWeton hari={b.hari} pasaran={b.pasaran} ukuran="sm" />
                  </td>
                  {b.sel.map((s) => (
                    <SelAngka
                      key={s.dm}
                      hitung={s.s}
                      acuan={s.sAcuan}
                      cocok={s.cocok && s.cocokRanking}
                      rankingHitung={s.ranking}
                      rankingAcuan={s.rankingAcuan}
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- tabel Borda (Tabel 7.3) ---------------- */}
      <div className="border-t border-sogan-200">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-3">
          <h3 className="text-sm font-semibold text-sogan-800">
            Weighted Borda — pembanding Tabel 7.3
          </h3>
          <span className="text-[0.62rem] text-netral-400">
            n = {bukti.jumlahKandidat} · poin = (n − ranking + 1) × bobot jabatan
          </span>
        </div>

        <p className="petunjuk-geser" aria-hidden="true">
          <span>⇆</span> Geser tabel ke samping untuk melihat semua kolom
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <caption className="sr-only">
              Perbandingan total poin Weighted Borda hasil hitung dengan angka Tabel 7.3
            </caption>
            <thead>
              <tr className="border-b border-sogan-300 bg-sogan-50/80 text-left">
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-sogan-700">
                  Kandidat
                </th>
                <th scope="col" className="px-3 py-2 text-xs font-semibold text-sogan-700">
                  Weton
                </th>
                <th scope="col" className="px-2 py-2 text-right text-xs font-semibold text-sogan-700">
                  Total poin
                </th>
                <th scope="col" className="px-3 py-2 text-right text-xs font-semibold text-sogan-700">
                  Rank final
                </th>
              </tr>
            </thead>
            <tbody>
              {bukti.barisBorda.map((b) => {
                const juara = b.rankingFinal === 1;
                return (
                  <tr
                    key={b.kode}
                    className={`border-b border-sogan-200/60 ${
                      juara ? 'bg-emas-500/12' : 'odd:bg-krem-50/50'
                    }`}
                  >
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-2">
                        <span className="angka inline-flex h-6 w-6 items-center justify-center rounded bg-sogan-700 text-[0.66rem] font-bold text-emas-200">
                          {b.kode}
                        </span>
                        {juara && (
                          <span className="rounded bg-emas-100 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-emas-800 ring-1 ring-emas-300">
                            terpilih
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <BadgeWeton hari={b.hari} pasaran={b.pasaran} ukuran="sm" />
                    </td>
                    <SelAngka
                      hitung={b.poin}
                      acuan={b.poinAcuan}
                      cocok={b.poin === b.poinAcuan}
                      desimal={0}
                    />
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <span
                          className={`angka text-xs font-semibold ${
                            b.rankingFinal === b.rankingAcuan ? 'text-sogan-800' : 'text-bahaya'
                          }`}
                        >
                          {b.rankingFinal}
                        </span>
                        <Tanda cocok={b.rankingFinal === b.rankingAcuan} />
                      </div>
                      <div className="angka text-[0.62rem] text-netral-400">
                        laporan {b.rankingAcuan}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- keterangan ---------------- */}
      <div className="border-t border-sogan-200 px-4 py-3">
        <p className="text-xs leading-relaxed text-netral-500">
          Panel ini <span className="font-semibold text-sogan-700">menghitung ulang</span> data
          contoh {ACARA_CONTOH.neptu_pria} + {ACARA_CONTOH.neptu_wanita} neptu dengan{' '}
          <span className="font-semibold text-sogan-700">fungsi yang sama</span> dengan halaman
          Penilaian &amp; Konsensus, lalu membandingkannya dengan angka di laporan. Angka di kolom
          laporan tidak pernah dipakai untuk menghitung apa pun — hanya sebagai pembanding. Panel ini
          selalu memakai data contoh, terpisah dari data aktif Anda di{' '}
          <Link to="/kelola" className="font-medium text-emas-700 underline decoration-emas-400/60 hover:text-emas-800">
            Kelola Data
          </Link>
          .
        </p>
      </div>
    </Kartu>
  );
}
