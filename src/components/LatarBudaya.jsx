/**
 * ============================================================================
 *  Komponen: LatarBudaya
 * ============================================================================
 *  Latar halaman bernuansa Jawa:
 *
 *    1. Gambar wayang kulit asli (public/latar/wayang-jawa.jpg)
 *       → digerakkan halus seperti dalang memegang cempala
 *    2. Asap dupa yang naik dari bawah
 *    3. Butir emas berkedip
 *
 *  Semua murni dekoratif:
 *    - aria-hidden + pointer-events: none
 *    - animasi hanya transform / opacity
 *    - prefers-reduced-motion dimatikan
 * ============================================================================
 */

import { useEffect, useState } from 'react';

/** Apakah animasi boleh berjalan? (menghormati preferensi pengguna) */
function useGerakAktif() {
  const [aktif, setAktif] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setAktif(!mq.matches);
    const ubah = (e) => setAktif(!e.matches);
    mq.addEventListener('change', ubah);
    return () => mq.removeEventListener('change', ubah);
  }, []);

  return aktif;
}

/* ---------------------------------------------------------------------------
 * Kepulan asap dupa.
 * Ukuran & posisi diatur lewat props supaya bisa disebar di beberapa titik.
 *
 * PENTING: `animation-delay` NEGATIF dipakai agar sebagian kepulan sudah
 * berada di tengah animasi saat halaman dibuka. Tanpa itu, semua asap
 * mulai dari bawah layar dan tidak terlihat pada detik-detik pertama.
 * ------------------------------------------------------------------------- */
function KepulanAsap({ kiri, lebar, tinggi, tunda, durasi, gerak }) {
  return (
    <span
      className="asap"
      style={{
        left: kiri,
        width: lebar,
        height: tinggi,
        // Negatif = animasi sudah berjalan sekian detik saat pertama tampil
        animationDelay: `-${tunda}s`,
        animationDuration: `${durasi}s`,
        animationPlayState: gerak ? 'running' : 'paused',
        opacity: gerak ? undefined : 0.16,
      }}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Komponen utama
 * ------------------------------------------------------------------------- */
export default function LatarBudaya() {
  const gerak = useGerakAktif();

  // Sebaran asap: ukuran, posisi, dan fase berbeda.
  // `tunda` dipakai sebagai animation-delay NEGATIF, sehingga tiap kepulan
  // sudah berada di ketinggian berbeda saat halaman pertama dibuka.
  const asap = [
    { kiri: '5%', lebar: '5rem', tinggi: '5rem', tunda: 0.5, durasi: 16 },
    { kiri: '13%', lebar: '3.5rem', tinggi: '3.5rem', tunda: 6.0, durasi: 13 },
    { kiri: '24%', lebar: '6.5rem', tinggi: '6.5rem', tunda: 2.5, durasi: 18 },
    { kiri: '37%', lebar: '4rem', tinggi: '4rem', tunda: 9.5, durasi: 15 },
    { kiri: '51%', lebar: '6rem', tinggi: '6rem', tunda: 4.5, durasi: 17 },
    { kiri: '65%', lebar: '3.5rem', tinggi: '3.5rem', tunda: 11.5, durasi: 13 },
    { kiri: '77%', lebar: '7rem', tinggi: '7rem', tunda: 7.0, durasi: 19 },
    { kiri: '89%', lebar: '4.5rem', tinggi: '4.5rem', tunda: 13.5, durasi: 14 },
  ];

  return (
    <>
      {/* ---- Latar wayang (gambar asli, bergerak seperti digerakkan dalang) ---- */}
      <div aria-hidden="true" className="latar-wayang" />

      {/* ---- Asap dupa + butir emas di atas latar ---- */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden select-none"
      >
        {/* Asap dupa */}
        {asap.map((a, i) => (
          <KepulanAsap
            key={i}
            kiri={a.kiri}
            lebar={a.lebar}
            tinggi={a.tinggi}
            tunda={a.tunda}
            durasi={a.durasi}
            gerak={gerak}
          />
        ))}

        {/* Butir emas berkedip seperti kunang-kunang */}
        {[
          { k: 'left-[12%] top-[24%] h-1.5 w-1.5', d: 0 },
          { k: 'left-[30%] top-[58%] h-1 w-1', d: 1.3 },
          { k: 'left-[48%] top-[18%] h-1.5 w-1.5', d: 2.6 },
          { k: 'left-[66%] top-[46%] h-1 w-1', d: 0.8 },
          { k: 'left-[82%] top-[30%] h-1.5 w-1.5', d: 2.1 },
          { k: 'left-[92%] top-[64%] h-1 w-1', d: 3.4 },
        ].map((b, i) => (
          <span
            key={i}
            className={`absolute rounded-full bg-emas-200/70 ${b.k}`}
            style={{
              animation: gerak ? `kelip-emas 5s ease-in-out ${b.d}s infinite` : 'none',
              opacity: gerak ? undefined : 0.25,
            }}
          />
        ))}
      </div>

      {/* Keyframes butir emas (ditaruh di sini agar mandiri) */}
      <style>{`
        @keyframes kelip-emas {
          0%, 100% { opacity: 0.15; transform: translateY(0) scale(1); }
          50% { opacity: 0.7; transform: translateY(-14px) scale(1.35); }
        }
      `}</style>
    </>
  );
}
