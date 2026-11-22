/**
 * ============================================================================
 *  Komponen: Grafik perbandingan ranking (S8)
 * ============================================================================
 *  Menampilkan total poin Weighted Borda tiap kandidat sebagai batang bertumpuk,
 *  dipecah menurut kontribusi tiap decision maker.
 *
 *  Tidak memakai pustaka grafik: cukup div + lebar persentase, supaya bundle
 *  tidak bertambah dan warnanya tetap ikut design token.
 *
 *  Batang bersifat dekoratif; angka aslinya selalu ditulis di sebelah kanan,
 *  jadi informasi tetap terbaca oleh pembaca layar dan saat dicetak.
 * ============================================================================
 */

const KONTRIBUSI = [
  { key: 'poinSesepuh', label: 'Sesepuh', kelas: 'bg-emas-500' },
  { key: 'poinOrtu', label: 'Orang Tua', kelas: 'bg-sogan-500' },
  { key: 'poinWo', label: 'WO', kelas: 'bg-netral-400' },
];

export default function GrafikBorda({ rincian = [], maksPoin = 0 }) {
  const aman = Math.max(maksPoin, 1);
  const urut = [...rincian].sort((a, b) => b.totalPoin - a.totalPoin);

  return (
    <div className="p-4 sm:p-5">
      {/* Legenda */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.66rem] text-netral-600">
        <span className="font-semibold uppercase tracking-wide text-netral-500">Kontribusi</span>
        {KONTRIBUSI.map((k) => (
          <span key={k.key} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${k.kelas}`} />
            {k.label}
          </span>
        ))}
      </div>

      <ul className="space-y-2.5">
        {urut.map((r) => {
          const juara = r.rankingFinal === 1;
          return (
            <li key={r.kode} className="flex items-center gap-3">
              <span
                className={`angka flex h-6 w-6 shrink-0 items-center justify-center rounded text-[0.66rem] font-bold ${
                  juara ? 'bg-emas-500 text-sogan-900' : 'bg-sogan-700 text-emas-200'
                }`}
                title={`Ranking final ${r.rankingFinal}`}
              >
                {r.rankingFinal}
              </span>
              <span className="w-5 shrink-0 text-sm font-semibold text-sogan-800">{r.kode}</span>

              <span
                className="relative h-5 min-w-0 flex-1 overflow-hidden rounded-sm bg-krem-200 ring-1 ring-inset ring-sogan-200"
                aria-hidden="true"
              >
                <span className="flex h-full">
                  {KONTRIBUSI.map((k) => (
                    <span
                      key={k.key}
                      className={`${k.kelas} h-full`}
                      style={{ width: `${((r[k.key] ?? 0) / aman) * 100}%` }}
                    />
                  ))}
                </span>
              </span>

              <span className="w-16 shrink-0 text-right text-sm">
                <span className={`angka font-semibold ${juara ? 'text-emas-700' : 'text-sogan-800'}`}>
                  {r.totalPoin}
                </span>{' '}
                <span className="text-[0.62rem] text-netral-500">poin</span>
              </span>

              <span className="sr-only">
                Kandidat {r.kode}: Sesepuh {r.poinSesepuh}, Orang Tua {r.poinOrtu}, WO {r.poinWo},
                total {r.totalPoin} poin, ranking {r.rankingFinal}.
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[0.66rem] leading-relaxed text-netral-500">
        Panjang batang sebanding dengan total poin. Bagian berwarna menunjukkan asal poin dari
        masing-masing decision maker; bobot jabatan 3 : 2 : 1 sudah termasuk di dalamnya.
      </p>
    </div>
  );
}
