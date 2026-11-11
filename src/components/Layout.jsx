/**
 * ============================================================================
 *  Komponen: Layout utama (navbar + isi + footer)
 * ============================================================================
 *  Tata ruang:
 *    - Latar wayang kulit asli mengisi seluruh layar
 *    - Header & footer memakai panel kaca gelap agar wayang tetap terlihat
 *    - Isi halaman dibatasi lebih sempit supaya latar wayang tidak tertutup
 * ============================================================================
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../auth/index.js';
import { URUTAN_DM, DECISION_MAKERS } from '../shared/constants.js';
import LatarBudaya from './LatarBudaya.jsx';

const MENU = [
  { ke: '/dashboard', label: 'Dashboard' },
  { ke: '/kandidat', label: 'Data Acara' },
  { ke: '/bobot', label: 'Atur Bobot' },
  { ke: '/penilaian', label: 'Penilaian Saya' },
  { ke: '/hasil', label: 'Konsensus' },
];

export default function Layout({ sesi, onLogout, children }) {
  const navigate = useNavigate();
  const dm = DECISION_MAKERS.find((d) => d.key === sesi?.peran);

  async function tanganiLogout() {
    await logout();
    onLogout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Latar wayang + asap dupa */}
      <LatarBudaya />

      {/* ================= HEADER (panel kaca) ================= */}
      <header className="tanpa-cetak sticky top-0 z-20">
        <div className="kaca-gelap border-b">
          <div className="wadah flex flex-wrap items-center justify-between gap-3 py-3">
            {/* Identitas aplikasi */}
            <Link to="/dashboard" className="group flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-emas-500/60 bg-gradient-to-br from-emas-400 to-emas-600 font-judul text-base font-bold text-sogan-900 shadow-md transition group-hover:from-emas-300 group-hover:to-emas-500"
              >
                DB
              </span>
              <span>
                <span className="block font-judul text-lg font-semibold leading-tight text-emas-100">
                  Dina Becik
                </span>
                <span className="block text-[0.66rem] uppercase tracking-[0.18em] text-emas-300/80">
                  Penentuan Hari Baik Hajatan
                </span>
              </span>
            </Link>

            {/* Identitas pengguna */}
            {sesi && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-krem-100">{dm?.nama ?? sesi.username}</div>
                  <div className="text-xs text-emas-300/80">
                    Bobot suara{' '}
                    <span className="angka font-semibold text-emas-300">{dm?.bobotSuara ?? '-'}</span>
                  </div>
                </div>
                <button
                  onClick={tanganiLogout}
                  className="rounded-md border border-emas-500/50 px-3 py-1.5 text-sm font-medium text-emas-200 transition hover:bg-emas-500/15 hover:text-emas-100"
                >
                  Keluar
                </button>
              </div>
            )}
          </div>

          {/* Navigasi */}
          {sesi && (
            <nav className="wadah overflow-x-auto">
              <ul className="flex gap-1 pb-2.5">
                {MENU.map((m) => (
                  <li key={m.ke}>
                    <NavLink
                      to={m.ke}
                      className={({ isActive }) =>
                        `inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-emas-500 text-sogan-900 shadow-sm'
                            : 'text-krem-200/85 hover:bg-emas-500/15 hover:text-emas-100'
                        }`
                      }
                    >
                      {m.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        {/* Pita ukiran emas di bawah header */}
        <div className="pita-emas" aria-hidden="true" />
      </header>

      {/* ================= ISI =================
          Dibuat lebih sempit (max-w-5xl) supaya latar wayang tetap
          terlihat di kiri-kanan layar. */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">{children}</div>
      </main>

      {/* ================= FOOTER (panel kaca) ================= */}
      <footer className="tanpa-cetak mt-auto">
        <div className="pita-emas" aria-hidden="true" />
        <div className="kaca-gelap border-t">
          <div className="wadah flex flex-wrap items-start justify-between gap-4 py-4 text-xs">
            <div>
              <p className="font-judul text-sm font-semibold text-emas-200">
                Dina Becik — GDSS Penentuan Hari Baik Hajatan
              </p>
              <p className="mt-1 text-krem-200/70">
                Berbasis Weton dan Logika Modern · Metode: Weighted Product + Weighted Borda
              </p>
            </div>
            <div className="text-right">
              <span className="chip-emas">
                <span className="angka">{URUTAN_DM.length}</span> decision maker
              </span>
              <p className="mt-2 text-[0.66rem] leading-relaxed text-krem-200/60">
                Neptu hari dan pasaran bersifat pasti; tafsir kecocokan dapat berbeda antar daerah.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
