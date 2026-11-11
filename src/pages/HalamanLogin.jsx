/**
 * ============================================================================
 *  Halaman: Login
 * ============================================================================
 *  Tiga akun, satu akun untuk satu decision maker. Tidak ada akun ke-4.
 *  Uji T1: tiap akun masuk sesuai peran; akun salah ditolak.
 * ============================================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, daftarAkunDemo } from '../auth/index.js';
import { DECISION_MAKERS } from '../shared/constants.js';

export default function HalamanLogin({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [galat, setGalat] = useState('');
  const [memuat, setMemuat] = useState(false);
  const akunDemo = daftarAkunDemo();

  async function kirim(e) {
    e.preventDefault();
    setGalat('');
    setMemuat(true);
    try {
      const sesi = await login(username, password);
      onLogin(sesi);
      navigate('/dashboard');
    } catch (err) {
      setGalat(err.message);
    } finally {
      setMemuat(false);
    }
  }

  function isiCepat(u, p) {
    setUsername(u);
    setPassword(p);
    setGalat('');
  }

  return (
    <div className="latar-batik flex min-h-screen items-center justify-center bg-krem-100 px-4 py-10">
      <div className="w-full max-w-5xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* ---------------- KOLOM KIRI: penjelasan ---------------- */}
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-sogan-700 font-judul text-xl font-bold text-emas-200 shadow-md"
              >
                DB
              </span>
              <div>
                <h1 className="font-judul text-2xl font-semibold leading-tight text-sogan-800">
                  Dina Becik
                </h1>
                <p className="text-xs uppercase tracking-wider text-netral-500">
                  GDSS Penentuan Hari Baik Hajatan
                </p>
              </div>
            </div>

            <p className="garis-emas text-sm leading-relaxed text-netral-600">
              Orang tua menghitung weton, penyelenggara menghitung biaya, WO menghitung jadwal
              gedung. <span className="font-medium text-sogan-800">Dina Becik</span> menggabungkan
              ketiganya lewat penilaian individual dan voting berbobot jabatan, sehingga keputusan
              tanggal hajatan terukur dan adil.
            </p>

            <dl className="mt-6 space-y-3">
              {DECISION_MAKERS.map((dm) => (
                <div
                  key={dm.key}
                  className="kartu flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <dt className="text-sm font-medium text-sogan-800">{dm.nama}</dt>
                    <dd className="text-xs text-netral-500">{dm.kriteriaDitekankan}</dd>
                  </div>
                  <div className="text-right">
                    <div className="angka text-lg font-semibold text-emas-600">
                      ×{dm.bobotSuara}
                    </div>
                    <div className="text-[0.65rem] uppercase tracking-wide text-netral-400">
                      bobot suara
                    </div>
                  </div>
                </div>
              ))}
            </dl>

            <p className="mt-5 rounded-md border border-emas-300 bg-emas-50 px-3 py-2 text-xs text-emas-800">
              <strong>Metode:</strong> Weighted Product (penilaian individual) → Weighted Borda
              (konsensus). Seri ditentukan ranking Sesepuh.
            </p>
          </div>

          {/* ---------------- KOLOM KANAN: form ---------------- */}
          <div className="kartu-tebal p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-sogan-800">Masuk</h2>
            <p className="mt-1 text-sm text-netral-500">
              Satu akun untuk satu decision maker.
            </p>

            <form onSubmit={kirim} className="mt-6 space-y-4" noValidate>
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-netral-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-md border border-netral-300 bg-netral-0 px-3 py-2 text-sm outline-none transition focus:border-emas-500 focus:ring-2 focus:ring-emas-200"
                  placeholder="sesepuh / orangtua / wo"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-netral-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-netral-300 bg-netral-0 px-3 py-2 text-sm outline-none transition focus:border-emas-500 focus:ring-2 focus:ring-emas-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              {galat && (
                <p
                  role="alert"
                  className="rounded-md border border-[#F2C4C0] bg-[#FDECEA] px-3 py-2 text-sm text-bahaya"
                >
                  {galat}
                </p>
              )}

              <button
                type="submit"
                disabled={memuat}
                className="w-full rounded-md bg-sogan-700 px-4 py-2.5 text-sm font-semibold text-krem-50 shadow-sm transition hover:bg-sogan-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {memuat ? 'Memeriksa…' : 'Masuk'}
              </button>
            </form>

            {/* Akun demo — hanya untuk pengembangan, Alia akan mengganti dengan Firebase Auth */}
            <div className="mt-6 border-t border-netral-200 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-netral-400">
                Akun demo (pengembangan)
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {akunDemo.map((a) => {
                  const dm = DECISION_MAKERS.find((d) => d.key === a.peran);
                  return (
                    <button
                      key={a.username}
                      type="button"
                      onClick={() => isiCepat(a.username, a.password)}
                      className="rounded-md border border-netral-200 bg-netral-50 px-2 py-2 text-left text-xs transition hover:border-emas-400 hover:bg-emas-50"
                    >
                      <span className="block font-semibold text-sogan-700">{a.username}</span>
                      <span className="block text-netral-500">{dm?.nama}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
