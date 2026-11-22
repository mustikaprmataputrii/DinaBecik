/**
 * ============================================================================
 *  Halaman: Riwayat keputusan (S11)
 * ============================================================================
 *  Menampilkan acara yang sudah selesai (status "Selesai") beserta pemenangnya.
 *  Datanya diambil dari getRiwayatAcara(); pemenang diambil dari getHasilVoting()
 *  per acara, jadi tidak ada angka yang ditulis mati di halaman.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import { getRiwayatAcara, getHasilVoting } from '../data/index.js';
import { METODE, STATUS_ACARA } from '../shared/constants.js';

export default function HalamanRiwayat() {
  const [daftar, setDaftar] = useState([]);
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const acara = await getRiwayatAcara();
        const lengkap = await Promise.all(
          (acara ?? []).map(async (a) => {
            const hasil = await getHasilVoting(a.id).catch(() => null);
            const juara = hasil?.rincian?.find((r) => r.rankingFinal === 1) ?? null;
            return { ...a, juara };
          })
        );
        if (!batal) setDaftar(lengkap);
      } catch (err) {
        if (!batal) setGalat(err.message || 'Riwayat gagal dimuat.');
      } finally {
        if (!batal) setMemuat(false);
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
            Riwayat
          </p>
          <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
            Riwayat Keputusan
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-krem-200/80">
            Hajatan yang sudah selesai diputuskan, lengkap dengan pemenang dan poin konsensusnya.
            Entri muncul otomatis setelah voting ditutup — tidak diisi manual.
          </p>
        </div>
      </Kartu>

      {galat && (
        <p role="alert" className="rounded-md border border-bahaya-200 bg-bahaya-50 px-3 py-2 text-sm text-bahaya">
          {galat}
        </p>
      )}

      <Kartu varian="tebal" bingkai>
        <JudulKartu
          keterangan="Sumber: acara berstatus Selesai di lapisan data"
          aksi={
            <span className="chip-krem">
              <span className="angka font-semibold text-sogan-800">{daftar.length}</span>
              <span>acara</span>
            </span>
          }
        >
          Acara Selesai
        </JudulKartu>

        {memuat ? (
          <p className="p-5 text-sm text-netral-500">Memuat riwayat…</p>
        ) : daftar.length === 0 ? (
          <div className="p-5">
            <p className="rounded-md border border-sogan-200 bg-krem-100/70 px-3 py-2.5 text-sm text-netral-600">
              Belum ada acara yang selesai. Riwayat akan terisi setelah ketiga decision maker
              mengirim penilaian dan konsensus {METODE.konsensus.split(' (')[0]} dihitung.
            </p>
            <Link
              to="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-emas-700 underline decoration-emas-400/60 hover:text-emas-800"
            >
              Kembali ke dashboard →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-sogan-200/70">
            {daftar.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sogan-800">{a.nama_acara}</span>
                    <BadgeStatus status={a.status ?? STATUS_ACARA.SELESAI} ukuran="sm" />
                  </div>
                  <div className="mt-1 text-xs text-netral-500">
                    <span className="capitalize">{a.jenis}</span>
                    {' · '}Neptu{' '}
                    <span className="angka">
                      {a.neptu_pria} + {a.neptu_wanita} = {(a.neptu_pria ?? 0) + (a.neptu_wanita ?? 0)}
                    </span>
                    {a.juara && (
                      <>
                        {' · '}Pemenang{' '}
                        <span className="font-semibold text-sogan-700">Kandidat {a.juara.kode}</span>{' '}
                        <span className="angka">({a.juara.totalPoin} poin)</span>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  to="/hasil"
                  className="shrink-0 rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-xs font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50"
                >
                  Lihat hasil →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Kartu>
    </div>
  );
}
