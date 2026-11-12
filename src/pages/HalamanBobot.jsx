/**
 * ============================================================================
 *  Halaman: Atur Bobot
 * ============================================================================
 *  Panduan bagian 5 + bagian 10: tiap decision maker mengatur bobot 5 kriteria
 *  sendiri. Total WAJIB tepat 100% — bila tidak, penyimpanan ditolak.
 *
 *  Uji T3: "Bobot bukan 100% ditolak"
 *    - Tombol Simpan mati selama total != 100%
 *    - Pesan menyebut selisihnya, bukan hanya "tidak valid"
 *    - Penolakan juga terjadi di lapisan logika (normalisasiBobot), bukan
 *      hanya di tampilan — jadi tidak bisa dilewati lewat console.
 *
 *  Pratinjau: bila bobot valid, ranking WP langsung ditampilkan. Tujuannya
 *  agar pengguna melihat akibat keputusannya sebelum menyimpan.
 * ============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import Kartu, { JudulKartu, BlokTeks } from '../components/Kartu.jsx';
import {
  getAcara,
  getKandidat,
  getBobotDm,
  simpanBobotDm,
  getPenilaianDm,
} from '../data/index.js';
import { hitungWP, validasiBobot } from '../shared/wp.js';
import {
  KRITERIA,
  URUTAN_KRITERIA,
  TOTAL_BOBOT_WAJIB,
  BOBOT_AWAL,
  DECISION_MAKERS,
} from '../shared/constants.js';

/** Batas aman satu kriteria (persen). */
const MIN = 0;
const MAX = 100;

/**
 * Kandidat dari adapter berbentuk baris Tabel 7.1 (`skorWeton`), sedangkan
 * hitungWP() memakai key kriteria (`weton`). Pemetaan dilakukan di sini agar
 * lapisan data tidak perlu diubah.
 */
function keKandidatWP(baris) {
  return baris.map((k) => ({
    kode: k.kode,
    weton: k.skorWeton,
    biaya: k.biaya,
    gedung: k.gedung,
    cuaca: k.cuaca,
    tamu: k.tamu,
  }));
}

/** Batasi nilai ke 0..100 dan bulatkan. */
function rapikan(nilai) {
  const n = Number(nilai);
  if (!Number.isFinite(n)) return MIN;
  return Math.min(MAX, Math.max(MIN, Math.round(n)));
}

/* ---------------------------------------------------------------------------
 * Satu baris kriteria: label + penggeser + kotak angka
 * ------------------------------------------------------------------------- */
function BarisKriteria({ kriteria, nilai, onUbah, nonaktif }) {
  const id = `bobot-${kriteria.key}`;
  const isi = `${(nilai / MAX) * 100}%`;
  const cost = kriteria.tipe === 'cost';

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="flex flex-wrap items-center gap-2">
            <span className="angka rounded bg-sogan-700 px-1.5 py-0.5 text-[0.66rem] font-bold text-emas-200">
              {kriteria.kode}
            </span>
            <span className="text-sm font-semibold text-sogan-800">{kriteria.nama}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide ring-1 ${
                cost
                  ? 'bg-[#EDF4FA] text-penilaian ring-[#A9C7E0]'
                  : 'bg-emas-100 text-emas-800 ring-emas-300'
              }`}
            >
              {cost ? 'cost' : 'benefit'}
            </span>
          </label>
          <p className="mt-1 text-xs leading-relaxed text-netral-500">
            {kriteria.satuan} · {kriteria.keteranganSkala}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <input
            id={`${id}-angka`}
            aria-label={`Bobot ${kriteria.nama} dalam persen`}
            type="number"
            min={MIN}
            max={MAX}
            step={1}
            value={nilai}
            disabled={nonaktif}
            onChange={(e) => onUbah(kriteria.key, rapikan(e.target.value))}
            className="angka w-16 rounded-md border border-sogan-300 bg-krem-50 px-2 py-1.5 text-right text-sm font-semibold text-sogan-800 shadow-inner outline-none transition focus:border-emas-500 focus:bg-netral-0 focus:ring-2 focus:ring-emas-200 disabled:opacity-60"
          />
          <span className="text-sm font-semibold text-sogan-600">%</span>
        </div>
      </div>

      <input
        id={id}
        type="range"
        min={MIN}
        max={MAX}
        step={1}
        value={nilai}
        disabled={nonaktif}
        onChange={(e) => onUbah(kriteria.key, rapikan(e.target.value))}
        className="penggeser mt-3"
        style={{ '--isi': isi }}
      />
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * Halaman
 * ------------------------------------------------------------------------- */
export default function HalamanBobot({ sesi }) {
  const userId = sesi?.peran;
  const dm = DECISION_MAKERS.find((d) => d.key === userId);

  const [acara, setAcara] = useState(null);
  const [bobot, setBobot] = useState(null);
  const [kandidat, setKandidat] = useState([]);
  const [statusKirim, setStatusKirim] = useState(false);
  const [memuat, setMemuat] = useState(true);
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState(null); // { jenis: 'sukses' | 'galat', isi }

  /* ---- muat data ---- */
  useEffect(() => {
    let batal = false;
    (async () => {
      const [a, b, k, p] = await Promise.all([
        getAcara(),
        getBobotDm('acara-demo-2027', userId),
        getKandidat(),
        getPenilaianDm('acara-demo-2027', userId),
      ]);
      if (batal) return;
      setAcara(a);
      setBobot(b);
      setKandidat(keKandidatWP(k));
      setStatusKirim(Boolean(p?.statusKirim));
      setMemuat(false);
    })();
    return () => {
      batal = true;
    };
  }, [userId]);

  /* ---- validasi total (sumber kebenaran: shared/wp.js) ---- */
  const validasi = useMemo(() => (bobot ? validasiBobot(bobot) : null), [bobot]);
  const total = validasi?.total ?? 0;
  const selisih = Math.round((TOTAL_BOBOT_WAJIB - total) * 100) / 100;
  const valid = Boolean(validasi?.valid);

  /* ---- pratinjau ranking WP, hanya bila bobot valid ---- */
  const pratinjau = useMemo(() => {
    if (!valid || !bobot || kandidat.length === 0) return null;
    try {
      return hitungWP(kandidat, bobot);
    } catch {
      return null; // jangan sampai pratinjau merusak halaman
    }
  }, [valid, bobot, kandidat]);

  const berubah = useMemo(() => {
    if (!bobot) return false;
    return URUTAN_KRITERIA.some((k) => Number(bobot[k]) !== Number(BOBOT_AWAL[userId]?.[k]));
  }, [bobot, userId]);

  function ubah(kunci, nilai) {
    setBobot((lama) => ({ ...lama, [kunci]: nilai }));
    setPesan(null);
  }

  function kembalikanBawaan() {
    setBobot({ ...BOBOT_AWAL[userId] });
    setPesan({ jenis: 'info', isi: 'Bobot dikembalikan ke nilai bawaan. Klik Simpan untuk menyimpan.' });
  }

  /** Simpan bobot. Ditolak bila total bukan 100%. */
  async function simpan() {
    if (!valid) return;
    setMenyimpan(true);
    setPesan(null);
    try {
      await simpanBobotDm('acara-demo-2027', userId, bobot);
      // Bobot berubah -> penilaian lama dibatalkan oleh adapter.
      setStatusKirim(false);
      setPesan({
        jenis: 'sukses',
        isi: `Bobot tersimpan (total ${total}%). Penilaian Anda perlu dikirim ulang di halaman Penilaian Saya.`,
      });
    } catch (err) {
      setPesan({ jenis: 'galat', isi: err.message });
    } finally {
      setMenyimpan(false);
    }
  }

  /* ---------------- tampilan saat memuat ---------------- */
  if (memuat || !bobot) {
    return <Kartu className="p-6 text-sm text-netral-500">Memuat bobot…</Kartu>;
  }

  const gayaPesan =
    pesan?.jenis === 'sukses'
      ? 'border-[#9CCBAE] bg-[#EAF5EE] text-selesai'
      : pesan?.jenis === 'galat'
        ? 'border-[#F2C4C0] bg-[#FDECEA] text-bahaya'
        : 'border-sogan-200 bg-krem-100/80 text-netral-600';

  return (
    <div className="space-y-6">
      {/* ================= HERO ================= */}
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
              Atur Bobot
            </p>
            <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
              Kepentingan Anda terhadap 5 kriteria
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
              Bobot Anda hanya berlaku untuk penilaian Anda sendiri. Setiap DM punya bobot
              berbeda; penggabungan dilakukan lewat Weighted Borda dengan bobot suara jabatan.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
            <span className="chip-emas">
              <span aria-hidden="true">⚖</span>
              {dm?.nama ?? userId}
            </span>
            <span className="chip-emas">
              Bobot suara <span className="angka font-semibold">{dm?.bobotSuara ?? '-'}</span>
            </span>
          </div>
        </div>
      </Kartu>

      {/* ================= PERINGATAN BILA SUDAH MENGIRIM ================= */}
      {statusKirim && (
        <BlokTeks judul="Penilaian Anda sudah dikirim" ikon="🔒">
          Mengubah bobot akan <span className="font-semibold text-sogan-800">membatalkan</span>{' '}
          penilaian yang sudah terkunci, sehingga Anda harus mengirim ulang di halaman Penilaian
          Saya. Hal ini sesuai aturan: bobot berubah berarti hasil WP berubah.
        </BlokTeks>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ================= SLIDER BOBOT ================= */}
        <Kartu varian="tebal" bingkai className="lg:col-span-2">
          <JudulKartu
            keterangan={`Total wajib tepat ${TOTAL_BOBOT_WAJIB}% — bila tidak, penyimpanan ditolak`}
            aksi={
              <span
                className={`angka rounded-full px-3 py-1 text-sm font-bold shadow-sm ring-1 ${
                  valid
                    ? 'bg-gradient-to-b from-[#EAF5EE] to-[#CFE8D8] text-selesai ring-[#9CCBAE]'
                    : 'bg-gradient-to-b from-[#FDECEA] to-[#F8D7D3] text-bahaya ring-[#F2C4C0]'
                }`}
              >
                {total}%
              </span>
            }
          >
            Bobot Kriteria
          </JudulKartu>

          <ul className="divide-y divide-sogan-200/70">
            {KRITERIA.map((k) => (
              <BarisKriteria
                key={k.key}
                kriteria={k}
                nilai={Number(bobot[k.key] ?? 0)}
                onUbah={ubah}
                nonaktif={menyimpan}
              />
            ))}
          </ul>

          {/* ---- Ringkasan total + aksi ---- */}
          <div className="border-t border-sogan-200 px-5 py-4">
            {/* Bar total: memperlihatkan porsi 100% yang sudah terpakai */}
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-sogan-200"
              role="presentation"
            >
              <div
                className={`h-full rounded-full transition-all ${
                  valid
                    ? 'bg-gradient-to-r from-emas-500 to-selesai'
                    : 'bg-gradient-to-r from-emas-600 to-bahaya'
                }`}
                style={{ width: `${Math.min(100, total)}%` }}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                {valid ? (
                  <span className="font-medium text-selesai">
                    ✓ Total {total}% — bobot siap disimpan.
                  </span>
                ) : (
                  <span className="text-bahaya">
                    Total <span className="angka font-semibold">{total}%</span>.{' '}
                    {selisih > 0 ? (
                      <>
                        Kurang <span className="angka font-semibold">{selisih}%</span> lagi.
                      </>
                    ) : (
                      <>
                        Kelebihan <span className="angka font-semibold">{Math.abs(selisih)}%</span>.
                      </>
                    )}
                  </span>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={kembalikanBawaan}
                  disabled={menyimpan}
                  className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-sm font-medium text-sogan-700 shadow-sm transition hover:border-emas-500 hover:bg-emas-50 disabled:opacity-60"
                >
                  Bawaan
                </button>
                <button
                  type="button"
                  onClick={simpan}
                  disabled={!valid || menyimpan}
                  title={valid ? 'Simpan bobot' : `Total harus ${TOTAL_BOBOT_WAJIB}%`}
                  className="rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-4 py-1.5 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {menyimpan ? 'Menyimpan…' : 'Simpan bobot'}
                </button>
              </div>
            </div>

            {pesan && (
              <p role="status" className={`mt-3 rounded-md border px-3 py-2 text-xs ${gayaPesan}`}>
                {pesan.isi}
              </p>
            )}
          </div>
        </Kartu>

        {/* ================= PRATINJAU + BANTUAN ================= */}
        <div className="space-y-6">
          <Kartu varian="tebal">
            <JudulKartu
              keterangan={
                pratinjau
                  ? 'Dihitung ulang setiap kali penggeser bergerak'
                  : 'Aktif setelah total tepat 100%'
              }
            >
              Pratinjau Ranking
            </JudulKartu>

            {pratinjau ? (
              <ol className="divide-y divide-sogan-200/70">
                {[...pratinjau.hasil]
                  .sort((a, b) => a.ranking - b.ranking)
                  .map((h) => (
                    <li
                      key={h.kode}
                      className="flex items-center justify-between gap-3 px-5 py-2.5"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span
                          className={`angka flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.66rem] font-bold shadow-sm ring-1 ${
                            h.ranking === 1
                              ? 'bg-gradient-to-b from-emas-300 to-emas-500 text-sogan-900 ring-emas-600'
                              : 'bg-netral-100 text-netral-600 ring-netral-300'
                          }`}
                        >
                          {h.ranking}
                        </span>
                        <span className="text-sm font-medium text-sogan-800">
                          Kandidat {h.kode}
                        </span>
                      </span>
                      <span className="angka shrink-0 text-xs text-netral-500">
                        V = <span className="font-semibold text-sogan-700">{h.v.toFixed(4)}</span>
                      </span>
                    </li>
                  ))}
              </ol>
            ) : (
              <p className="px-5 py-4 text-sm leading-relaxed text-netral-500">
                Pratinjau muncul saat total bobot sudah tepat {TOTAL_BOBOT_WAJIB}%.
              </p>
            )}
          </Kartu>

          <Kartu>
            <JudulKartu keterangan="Cara kerja halaman ini">Bantuan</JudulKartu>
            <div className="space-y-2.5 px-5 py-4 text-sm leading-relaxed text-netral-600">
              <p>
                Geser atau ketik angka untuk tiap kriteria. Nilai{' '}
                <span className="font-semibold text-sogan-800">cost</span> berarti semakin kecil
                semakin baik (biaya), sedangkan{' '}
                <span className="font-semibold text-sogan-800">benefit</span> berarti semakin besar
                semakin baik.
              </p>
              <p>
                Bila total belum 100%, tombol Simpan mati. Itulah uji{' '}
                <span className="font-semibold text-sogan-800">T3</span> — penolakan terjadi di
                lapisan logika, bukan hanya di tampilan.
              </p>
              {berubah && (
                <p className="rounded-md border border-emas-300 bg-emas-50 px-3 py-2 text-xs text-emas-900">
                  Bobot Anda berbeda dari nilai bawaan. Bawaan:{' '}
                  <span className="angka">
                    {URUTAN_KRITERIA.map((k) => BOBOT_AWAL[userId]?.[k]).join(' / ')}
                  </span>
                  .
                </p>
              )}
            </div>
          </Kartu>
        </div>
      </div>

      {/* ================= ACARA YANG DIATUR ================= */}
      <BlokTeks judul="Acara yang sedang diatur" ikon="◈">
        {acara?.nama_acara} · status{' '}
        <span className="font-semibold text-sogan-800">{acara?.status}</span>. Bobot disimpan per
        acara dan per decision maker.
      </BlokTeks>
    </div>
  );
}
