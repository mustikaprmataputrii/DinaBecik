/**
 * ============================================================================
 *  Komponen: Layout utama (navbar + isi + footer)
 * ============================================================================
 *  Navigasi menyesuaikan peran yang sedang login.
 * ============================================================================
 */

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../auth/index.js';
import { URUTAN_DM, DECISION_MAKERS } from '../shared/constants.js';

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
    <div className="flex min-h-screen flex-col bg-krem-100">
      {/* ---------------- HEADER ---------------- */}
      <header className="tanpa-cetak sticky top-0 z-20 border-b border-sogan-200 bg-krem-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/dashboard" className="group flex items-center gap-3">
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-sogan-700 font-judul text-lg font-bold text-emas-200 shadow-sm transition group-hover:bg-sogan-800"
            >
              DB
            </span>
            <span>
              <span className="block font-judul text-lg font-semibold leading-tight text-sogan-800">
                Dina Becik
              </span>
              <span className="block text-[0.7rem] uppercase tracking-wider text-netral-500">
                Penentuan Hari Baik Hajatan
              </span>
            </span>
          </Link>

          {sesi && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-sogan-800">{dm?.nama ?? sesi.username}</div>
                <div className="text-xs text-netral-500">
                  Bobot suara{' '}
                  <span className="angka font-semibold text-emas-700">{dm?.bobotSuara ?? '-'}</span>
                </div>
              </div>
              <button
                onClick={tanganiLogout}
                className="rounded-md border border-sogan-300 px-3 py-1.5 text-sm font-medium text-sogan-700 transition hover:bg-sogan-50"
              >
                Keluar
              </button>
            </div>
          )}
        </div>

        {sesi && (
          <nav className="mx-auto max-w-6xl overflow-x-auto px-4">
            <ul className="flex gap-1 pb-2">
              {MENU.map((m) => (
                <li key={m.ke}>
                  <NavLink
                    to={m.ke}
                    className={({ isActive }) =>
                      `inline-block whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        isActive
                          ? 'bg-sogan-700 text-krem-50'
                          : 'text-netral-600 hover:bg-sogan-100 hover:text-sogan-800'
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
      </header>

      {/* ---------------- ISI ---------------- */}
      <main className="latar-batik flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="tanpa-cetak border-t border-sogan-200 bg-krem-50">
        <div className="mx-auto max-w-6xl px-4 py-5 text-xs text-netral-500">
          <p className="font-medium text-sogan-700">
            Dina Becik — GDSS Penentuan Hari Baik Hajatan Berbasis Weton dan Logika Modern
          </p>
          <p className="mt-1">
            Praktikum Sistem Informasi · {URUTAN_DM.length} decision maker · Metode: Weighted
            Product + Weighted Borda
          </p>
          <p className="mt-1 text-netral-400">
            Neptu hari dan pasaran bersifat pasti; tafsir kecocokan dapat berbeda antar daerah.
          </p>
        </div>
      </footer>
    </div>
  );
}
