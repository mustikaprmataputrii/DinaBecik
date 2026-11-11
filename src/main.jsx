/**
 * ============================================================================
 *  Dina Becik — Titik masuk aplikasi
 * ============================================================================
 */

import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import './index.css';
import Layout from './components/Layout.jsx';
import HalamanLogin from './pages/HalamanLogin.jsx';
import HalamanDashboard from './pages/HalamanDashboard.jsx';
import { sesiAktif } from './auth/index.js';

function Aplikasi() {
  const [sesi, setSesi] = useState(() => sesiAktif());

  return (
    <Routes>
      <Route
        path="/login"
        element={sesi ? <Navigate to="/dashboard" replace /> : <HalamanLogin onLogin={setSesi} />}
      />

      <Route
        path="/*"
        element={
          sesi ? (
            <Layout sesi={sesi} onLogout={() => setSesi(null)}>
              <Routes>
                <Route path="/dashboard" element={<HalamanDashboard sesi={sesi} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Aplikasi />
    </BrowserRouter>
  </StrictMode>
);
