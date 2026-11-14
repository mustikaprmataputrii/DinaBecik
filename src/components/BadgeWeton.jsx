/**
 * ============================================================================
 *  Komponen: Badge weton (hari + pasaran)
 * ============================================================================
 *  Menampilkan "Sabtu Legi" dengan penekanan visual pada pasaran,
 *  karena pasaran yang membedakan satu tanggal Jawa dari tanggal lain.
 *
 *  Varian `gelap` untuk dipakai di dalam kartu-emas.
 * ============================================================================
 */

export default function BadgeWeton({ hari, pasaran, neptu, ukuran = 'md', gelap = false }) {
  const kecil = ukuran === 'sm';

  return (
    <span
      className={`inline-flex items-baseline gap-1.5 whitespace-nowrap ${
        kecil ? 'text-xs' : 'text-sm'
      }`}
    >
      <span className={gelap ? 'text-krem-200/85' : 'text-netral-700'}>{hari}</span>
      <span
        className={`font-semibold ${
          gelap ? 'text-emas-300' : 'text-sogan-800'
        }`}
      >
        {pasaran}
      </span>
      {neptu != null && (
        <span
          className={`angka ml-0.5 rounded px-1.5 py-0.5 text-[0.7em] font-semibold ring-1 ${
            gelap
              ? 'bg-emas-500/20 text-emas-200 ring-emas-500/40'
              : 'bg-krem-200 text-sogan-800 ring-sogan-200'
          }`}
        >
          {neptu}
        </span>
      )}
    </span>
  );
}
