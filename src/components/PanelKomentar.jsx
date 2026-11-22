/**
 * ============================================================================
 *  Komponen: Komentar decision maker (S12)
 * ============================================================================
 *  Ruang diskusi singkat di halaman Konsensus. Semua DM boleh menulis; isi
 *  komentar disimpan lewat lapisan data (bukan Firestore langsung).
 *
 *  Catatan bentuk data: { id, user_id, isi, waktu }. Di mode Firebase `waktu`
 *  berupa Timestamp, jadi ada penanganan khusus saat diformat.
 * ============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import Kartu, { JudulKartu } from './Kartu.jsx';
import { getKomentar, simpanKomentar } from '../data/index.js';
import { DECISION_MAKERS } from '../shared/constants.js';

const BATAS_ISI = 500;

/** Timestamp Firestore bisa berupa objek dengan toDate(); mode mock memakai ISO. */
function keTanggal(nilai) {
  if (!nilai) return null;
  const hasil = typeof nilai?.toDate === 'function' ? nilai.toDate() : new Date(nilai);
  return Number.isNaN(hasil.getTime()) ? null : hasil;
}

function formatWaktu(nilai) {
  const d = keTanggal(nilai);
  if (!d) return '—';
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Nama penulis dari user_id. Di mode mock user_id berbentuk "u-<username>". */
function namaPenulis(userId, sesi) {
  if (sesi?.userId && userId === sesi.userId) return `${sesi.nama} (Anda)`;
  const cocok = DECISION_MAKERS.find((d) => `u-${d.username}` === userId);
  return cocok?.nama ?? 'Decision Maker';
}

export default function PanelKomentar({ acaraId, sesi }) {
  const [komentar, setKomentar] = useState([]);
  const [isi, setIsi] = useState('');
  const [memuat, setMemuat] = useState(true);
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState('');

  const muat = useCallback(async () => {
    try {
      const data = await getKomentar(acaraId);
      setKomentar(Array.isArray(data) ? data : []);
      setGalat('');
    } catch (err) {
      setGalat(err.message || 'Komentar gagal dimuat.');
    } finally {
      setMemuat(false);
    }
  }, [acaraId]);

  useEffect(() => {
    let batal = false;
    (async () => {
      const data = await getKomentar(acaraId).catch(() => []);
      if (!batal) {
        setKomentar(Array.isArray(data) ? data : []);
        setMemuat(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, [acaraId]);

  async function kirim(e) {
    e.preventDefault();
    const teks = isi.trim();
    if (!teks || mengirim) return;
    setMengirim(true);
    setGalat('');
    try {
      await simpanKomentar(acaraId, sesi?.userId, teks);
      setIsi('');
      await muat();
    } catch (err) {
      setGalat(err.message || 'Komentar gagal dikirim.');
    } finally {
      setMengirim(false);
    }
  }

  const urut = [...komentar].sort((a, b) => {
    const ta = keTanggal(a.waktu)?.getTime() ?? 0;
    const tb = keTanggal(b.waktu)?.getTime() ?? 0;
    return ta - tb;
  });

  return (
    <Kartu varian="tebal">
      <JudulKartu
        keterangan="Catatan dan pertimbangan tambahan dari ketiga decision maker"
        aksi={
          <span className="chip-krem">
            <span className="angka font-semibold text-sogan-800">{komentar.length}</span>
            <span>komentar</span>
          </span>
        }
      >
        Komentar Decision Maker
      </JudulKartu>

      <div className="p-4 sm:p-5">
        {memuat ? (
          <p className="text-sm text-netral-500">Memuat komentar…</p>
        ) : urut.length === 0 ? (
          <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2.5 text-sm text-netral-600">
            Belum ada komentar. Tulis pertimbangan Anda di bawah supaya keputusan ini punya jejak
            diskusi, bukan hanya angka.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {urut.map((k) => (
              <li
                key={k.id}
                className="rounded-lg border border-sogan-200 bg-krem-50/80 px-3 py-2.5"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-xs font-semibold text-sogan-800">
                    {namaPenulis(k.user_id, sesi)}
                  </span>
                  <span className="angka text-[0.62rem] text-netral-400">
                    {formatWaktu(k.waktu)}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-netral-700">
                  {k.isi}
                </p>
              </li>
            ))}
          </ul>
        )}

        {galat && (
          <p role="alert" className="mt-3 rounded-md border border-bahaya-200 bg-bahaya-50 px-3 py-2 text-xs text-bahaya">
            {galat}
          </p>
        )}

        <form onSubmit={kirim} className="tanpa-cetak mt-4">
          <label
            htmlFor="komentar-baru"
            className="mb-1 block text-[0.62rem] font-semibold uppercase tracking-wide text-sogan-700"
          >
            Tulis komentar
          </label>
          <textarea
            id="komentar-baru"
            value={isi}
            onChange={(e) => setIsi(e.target.value.slice(0, BATAS_ISI))}
            rows={2}
            placeholder="Misalnya: tanggal E cocok secara adat, tapi perlu cek ulang kesiapan gedung."
            className="w-full resize-y rounded-md border border-sogan-300 bg-krem-50 px-3 py-2 text-sm text-netral-800 shadow-inner outline-none transition placeholder:text-netral-400 focus:border-emas-500 focus:bg-netral-0 focus:ring-2 focus:ring-emas-200"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <span className="angka text-[0.62rem] text-netral-400">
              {isi.length}/{BATAS_ISI}
            </span>
            <button
              type="submit"
              disabled={mengirim || isi.trim().length === 0}
              className="rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-3.5 py-1.5 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mengirim ? 'Mengirim…' : 'Kirim komentar'}
            </button>
          </div>
        </form>
      </div>
    </Kartu>
  );
}
