/**
 * ============================================================================
 *  Komponen: Badge weton (hari + pasaran)
 * ============================================================================
 *  Menampilkan "Sabtu Legi" dengan penekanan visual pada pasaran,
 *  karena pasaran yang membedakan satu tanggal Jawa dari tanggal lain.
 * ============================================================================
 */

export default function BadgeWeton({ hari, pasaran, neptu, ukuran = 'md' }) {
  const kecil = ukuran === 'sm';

  return (
    <span
      className={`inline-flex items-baseline gap-1 whitespace-nowrap ${
        kecil ? 'text-xs' : 'text-sm'
      }`}
    >
      <span className="text-netral-700">{hari}</span>
      <span className="font-semibold text-sogan-700">{pasaran}</span>
      {neptu != null && (
        <span className="angka ml-1 rounded bg-krem-200 px-1.5 py-0.5 text-[0.7em] text-sogan-800">
          {neptu}
        </span>
      )}
    </span>
  );
}
