/**
 * ============================================================================
 *  Halaman: Riwayat Keputusan (S11) + Komentar per Keputusan (S12)
 * ============================================================================
 *  Revisi pasca-presentasi dosen:
 *    - Semua DM (Sesepuh, Orang Tua, WO) dapat membuka halaman Riwayat untuk
 *      melihat daftar keputusan selesai (ringkasan tanggal terpilih) serta
 *      membaca dan menulis komentar DM pada masing-masing keputusan.
 *    - Poin & tautan menuju halaman Konsensus / perhitungan Weighted Borda
 *      (`/hasil/:acaraId`) HANYA ditampilkan untuk akun Sesepuh.
 * ============================================================================
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Kartu, { JudulKartu } from '../components/Kartu.jsx';
import BadgeStatus from '../components/BadgeStatus.jsx';
import BadgeWeton from '../components/BadgeWeton.jsx';
import PanelKomentar from '../components/PanelKomentar.jsx';
import { getRiwayatAcara, getHasilVoting, getKandidat } from '../data/index.js';
import { STATUS_ACARA } from '../shared/constants.js';

/** Format tanggal Indonesia dari string ISO. */
function tanggalPanjang(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HalamanRiwayat({ sesi }) {
  const adalahSesepuh = sesi?.peran === 'sesepuh';
  const [daftar, setDaftar] = useState([]);
  const [komentarTerbuka, setKomentarTerbuka] = useState({});
  const [memuat, setMemuat] = useState(true);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const acara = await getRiwayatAcara();
        const lengkap = await Promise.all(
          (acara ?? []).map(async (a) => {
            const [hasil, kandidat] = await Promise.all([
              getHasilVoting(a.id).catch(() => null),
              getKandidat(a.id).catch(() => []),
            ]);
            const juara = hasil?.rincian?.find((r) => r.rankingFinal === 1) ?? null;
            const kodeTerpilih = juara?.kode ?? a.pemenang_kode ?? null;
            const kandidatJuara = kodeTerpilih
              ? (kandidat ?? []).find((k) => k.kode === kodeTerpilih) ?? null
              : null;
            return { ...a, juara, kodeTerpilih, kandidatJuara };
          })
        );
        if (!batal) {
          setDaftar(lengkap);
          // Buka otomatis panel komentar pada keputusan pertama agar langsung terlihat.
          if (lengkap.length > 0) {
            setKomentarTerbuka({ [lengkap[0].id]: true });
          }
        }
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

  function toggleKomentar(id) {
    setKomentarTerbuka((lama) => ({ ...lama, [id]: !lama[id] }));
  }

  return (
    <div className="space-y-6">
      <Kartu varian="emas" bingkai className="relative overflow-hidden p-5 sm:p-6">
        <div className="relative z-10">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-emas-300/75">
            Riwayat &amp; Diskusi
          </p>
          <h1 className="mt-1.5 font-judul text-2xl font-semibold text-emas-100">
            Riwayat Keputusan
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-krem-200/80">
            Hajatan yang sudah selesai diputuskan, lengkap dengan tanggal terpilih dan ruang
            komentar decision maker pada masing-masing keputusan.
            {adalahSesepuh && ' Sebagai Sesepuh, Anda juga dapat membuka rincian perhitungan Borda.'}
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
          keterangan="Sumber: acara berstatus Selesai di lapisan data · komentar dipisahkan per keputusan"
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
              Belum ada acara yang selesai. Riwayat beserta ruang komentar keputusan akan muncul
              otomatis setelah ketiga decision maker mengirim penilaian dan keputusan ditetapkan.
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
            {daftar.map((a) => {
              const terbuka = Boolean(komentarTerbuka[a.id]);
              return (
                <li key={a.id} className="space-y-4 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-judul text-base font-semibold text-sogan-800">
                          {a.nama_acara}
                        </span>
                        <BadgeStatus status={a.status ?? STATUS_ACARA.SELESAI} ukuran="sm" />
                      </div>
                      <div className="mt-1 text-xs text-netral-500">
                        <span className="capitalize">{a.jenis}</span>
                        {' · '}Neptu{' '}
                        <span className="angka">
                          {a.neptu_pria} + {a.neptu_wanita} ={' '}
                          {(a.neptu_pria ?? 0) + (a.neptu_wanita ?? 0)}
                        </span>
                      </div>

                      {a.kodeTerpilih && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg border border-emas-300 bg-emas-50/70 px-3 py-2 text-xs">
                          <span className="font-semibold text-sogan-800">
                            Terpilih: Kandidat {a.kodeTerpilih}
                          </span>
                          {a.kandidatJuara && (
                            <>
                              <BadgeWeton
                                hari={a.kandidatJuara.hari}
                                pasaran={a.kandidatJuara.pasaran}
                                ukuran="sm"
                              />
                              <span className="text-netral-600">
                                {tanggalPanjang(a.kandidatJuara.tanggal)}
                              </span>
                              <span className="angka text-netral-600">
                                · Rp {a.kandidatJuara.biaya} juta
                              </span>
                            </>
                          )}
                          {adalahSesepuh && a.juara && (
                            <span className="angka font-semibold text-emas-700">
                              · {a.juara.totalPoin} poin Borda
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleKomentar(a.id)}
                        className="rounded-md border border-sogan-300 bg-netral-0 px-3 py-1.5 text-xs font-medium text-sogan-700 transition hover:border-emas-500 hover:bg-emas-50"
                      >
                        {terbuka ? 'Sembunyikan komentar' : 'Buka komentar'}
                      </button>
                      {adalahSesepuh && (
                        <Link
                          to={`/hasil/${encodeURIComponent(a.id)}`}
                          className="rounded-md bg-gradient-to-b from-emas-400 to-emas-600 px-3 py-1.5 text-xs font-semibold text-sogan-900 shadow-sm transition hover:from-emas-300 hover:to-emas-500"
                        >
                          Lihat rincian konsensus →
                        </Link>
                      )}
                    </div>
                  </div>

                  {terbuka && <PanelKomentar acaraId={a.id} sesi={sesi} embedded />}
                </li>
              );
            })}
          </ul>
        )}
      </Kartu>
    </div>
  );
}
