/**
 * ============================================================================
 *  Komponen: Kalender visual dengan weton (S9)
 * ============================================================================
 *  Menampilkan bulan-bulan yang memuat kandidat tanggal, lalu menandai tiap
 *  tanggal kandidat dengan kode, hari, pasaran, dan skor weton-nya.
 *
 *  Tujuannya supaya "weton" tidak hanya jadi kolom tabel: pengguna melihat
 *  langsung posisi tanggal dalam kalender dan bisa membandingkan jaraknya.
 *
 *  Kandidat terpilih (kalau ada) diberi bingkai emas dan tanda ★.
 * ============================================================================
 */

import { useMemo } from 'react';

const HARI_PENDEK = {
  Minggu: 'Min',
  Senin: 'Sen',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Kamis: 'Kam',
  Jumat: 'Jum',
  Sabtu: 'Sab',
};

const KEPALA = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function KalenderWeton({ kandidat = [], kodeTerpilih = null }) {
  const bulan = useMemo(() => {
    const peta = new Map();
    for (const k of kandidat) {
      if (!k?.tanggal) continue;
      const [tahun, bln] = k.tanggal.split('-').map(Number);
      const kunci = `${tahun}-${String(bln).padStart(2, '0')}`;
      if (!peta.has(kunci)) {
        peta.set(kunci, { tahun, bulanIndex: bln - 1, item: [] });
      }
      peta.get(kunci).item.push(k);
    }
    return [...peta.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([kunci, v]) => ({ kunci, ...v }));
  }, [kandidat]);

  if (bulan.length === 0) {
    return (
      <p className="px-4 py-5 text-sm text-netral-500">
        Belum ada kandidat tanggal untuk ditampilkan di kalender.
      </p>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-5">
      {bulan.map((b) => {
        const pertama = new Date(b.tahun, b.bulanIndex, 1);
        const jumlahHari = new Date(b.tahun, b.bulanIndex + 1, 0).getDate();
        // Senin sebagai awal minggu: getDay() 0 = Minggu.
        const geser = (pertama.getDay() + 6) % 7;
        const petaTanggal = new Map(b.item.map((k) => [Number(k.tanggal.slice(-2)), k]));

        const sel = [];
        for (let i = 0; i < geser; i += 1) sel.push(null);
        for (let tgl = 1; tgl <= jumlahHari; tgl += 1) sel.push(tgl);

        return (
          <div key={b.kunci}>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-sogan-800">
                {NAMA_BULAN[b.bulanIndex]} {b.tahun}
              </h3>
              <span className="text-[0.62rem] text-netral-500">
                {b.item.length} kandidat
              </span>
            </div>

            <div
              className="grid grid-cols-7 gap-1"
              aria-label={`Kalender ${NAMA_BULAN[b.bulanIndex]} ${b.tahun}`}
            >
              {KEPALA.map((h) => (
                <div
                  key={h}
                  aria-hidden="true"
                  className="pb-1 text-center text-[0.6rem] font-semibold uppercase tracking-wide text-netral-400"
                >
                  {h}
                </div>
              ))}

              {sel.map((tgl, i) => {
                if (tgl === null) {
                  return <div key={`k${i}`} aria-hidden="true" />;
                }
                const k = petaTanggal.get(tgl);
                if (!k) {
                  return (
                    <div
                      key={tgl}
                      className="flex min-h-[2.6rem] items-start justify-end rounded border border-sogan-200/50 bg-krem-100/40 px-1 py-0.5 text-[0.6rem] text-netral-400"
                    >
                      {tgl}
                    </div>
                  );
                }
                const terpilih = kodeTerpilih && k.kode === kodeTerpilih;
                return (
                  <div
                    key={tgl}
                    className={`flex min-h-[2.6rem] flex-col rounded border px-1 py-1 text-center ${
                      terpilih
                        ? 'border-emas-500 bg-emas-100 ring-1 ring-emas-400'
                        : 'border-sogan-300 bg-gradient-to-b from-krem-50 to-krem-200'
                    }`}
                    title={`Kandidat ${k.kode} — ${k.hari} ${k.pasaran}`}
                  >
                    <span className="flex items-baseline justify-between leading-none">
                      <span className="flex items-center gap-0.5">
                        <span className="angka text-[0.68rem] font-bold text-sogan-800">{k.kode}</span>
                        {terpilih && <span aria-hidden="true" className="text-[0.55rem] text-emas-600">★</span>}
                      </span>
                      <span className="angka text-[0.55rem] text-netral-400">{tgl}</span>
                    </span>
                    <span className="mt-0.5 block leading-tight">
                      <span className="block text-[0.55rem] text-netral-600">
                        {HARI_PENDEK[k.hari] ?? k.hari}
                      </span>
                      <span className="block text-[0.58rem] font-semibold text-sogan-700">{k.pasaran}</span>
                    </span>
                    <span className="mt-auto block text-[0.52rem] text-netral-400">
                      C1 <span className="angka font-semibold text-sogan-700">{k.skorWeton}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-[0.66rem] leading-relaxed text-netral-500">
        Kotak bertanda kode adalah tanggal kandidat. C1 adalah skor weton hasil aturan sisa bagi 5
        (skala 1–5). Tanda ★ menandai tanggal yang menang konsensus.
      </p>
    </div>
  );
}
