/**
 * ============================================================================
 *  Halaman: Login
 * ============================================================================
 *  Tiga akun, satu akun untuk satu decision maker. Tidak ada akun ke-4.
 *  Uji T1: tiap akun masuk sesuai peran; akun salah ditolak.
 *
 *  Tata ruang (revisi):
 *    - Latar wayang kulit asli mengisi seluruh layar
 *    - Kartu login dibuat RAMPING di tengah-kanan, tidak menutupi layar
 *    - Motif batik ada DI DALAM kartu, bukan di latar
 * ============================================================================
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, daftarAkunDemo } from '../auth/index.js';
import { DECISION_MAKERS } from '../shared/constants.js';
import LatarBudaya from '../components/LatarBudaya.jsx';

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
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      {/* Latar wayang + asap dupa */}
      <LatarBudaya />

      {/* Kartu dibuat ramping: max-w-md (28rem). Latar wayang tetap
          terlihat lebar di sekelilingnya. */}
      <div className="w-full max-w-md">
        {/* ---------- Identitas di atas kartu ---------- */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <span
            aria-hidden="true"
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-emas-400/70 bg-gradient-to-br from-emas-300 to-emas-600 font-judul text-base font-bold text-sogan-900 shadow-lg"
          >
            DB
          </span>
          <div>
            <h1 className="font-judul text-xl font-semibold leading-tight text-emas-100 drop-shadow">
              Dina Becik
            </h1>
            <p className="text-[0.62rem] uppercase tracking-[0.2em] text-emas-300/85">
              GDSS Hari Baik Hajatan
            </p>
          </div>
        </div>

        {/* ---------- Kartu form (berbatik) ---------- */}
        <div className="kartu-tebal bingkai-jawa p-5 sm:p-6">
          <h2 className="garis-emas text-lg font-semibold text-sogan-800">Masuk</h2>
          <p className="mt-2 text-xs leading-relaxed text-netral-600">
            Satu akun untuk satu decision maker. Penilaian digabung lewat Weighted Product →
            Weighted Borda.
          </p>

          <form onSubmit={kirim} className="mt-5 space-y-3.5" noValidate>
            <div>
              <label
                htmlFor="username"
                className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-sogan-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-md border border-sogan-300 bg-krem-50 px-3 py-2 text-sm text-netral-800 shadow-inner outline-none transition placeholder:text-netral-400 focus:border-emas-500 focus:bg-netral-0 focus:ring-2 focus:ring-emas-200"
                placeholder="sesepuh / orangtua / wo"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-[0.68rem] font-semibold uppercase tracking-wide text-sogan-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-sogan-300 bg-krem-50 px-3 py-2 text-sm text-netral-800 shadow-inner outline-none transition placeholder:text-netral-400 focus:border-emas-500 focus:bg-netral-0 focus:ring-2 focus:ring-emas-200"
                placeholder="••••••••"
                required
              />
            </div>

            {galat && (
              <p
                role="alert"
                className="rounded-md border border-[#F2C4C0] bg-[#FDECEA] px-3 py-2 text-xs text-bahaya"
              >
                {galat}
              </p>
            )}

            <button
              type="submit"
              disabled={memuat}
              className="w-full rounded-md bg-gradient-to-b from-sogan-600 to-sogan-800 px-4 py-2.5 text-sm font-semibold text-krem-50 shadow-md ring-1 ring-sogan-900/25 transition hover:from-sogan-700 hover:to-sogan-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {memuat ? 'Memeriksa…' : 'Masuk'}
            </button>
          </form>

          {/* Akun demo — hanya pengembangan, Alia akan ganti dengan Firebase Auth */}
          <div className="mt-4 rounded-lg border border-sogan-300 bg-krem-100/80 p-2.5">
            <p className="mb-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-netral-500">
              Akun demo
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {akunDemo.map((a) => (
                <button
                  key={a.username}
                  type="button"
                  onClick={() => isiCepat(a.username, a.password)}
                  className="rounded border border-sogan-300 bg-netral-0 px-1.5 py-1.5 text-left text-[0.66rem] shadow-sm transition hover:border-emas-500 hover:bg-emas-50"
                >
                  <span className="block font-semibold leading-tight text-sogan-700">
                    {a.username}
                  </span>
                  <span className="block truncate leading-tight text-netral-500">
                    ×{DECISION_MAKERS.find((d) => d.key === a.peran)?.bobotSuara}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------- Catatan metode di bawah kartu ---------- */}
        <div className="mt-3 rounded-lg border border-emas-500/30 bg-[rgba(26,18,16,0.72)] px-3 py-2 text-center backdrop-blur">
          <p className="text-[0.66rem] leading-relaxed text-krem-200/75">
            Neptu hari dan pasaran bersifat pasti; tafsir kecocokan dapat berbeda antar daerah.
          </p>
        </div>
      </div>
    </div>
  );
}
