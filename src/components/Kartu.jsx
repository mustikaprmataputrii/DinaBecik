/**
 * ============================================================================
 *  Komponen: Kartu
 * ============================================================================
 *  Wadah dasar untuk semua konten. Dua varian:
 *    - "biasa"  : kartu netral
 *    - "tebal"  : kartu dengan garis sogan, untuk konten penting
 * ============================================================================
 */

export default function Kartu({ children, varian = 'biasa', className = '', ...sisa }) {
  const kelas = varian === 'tebal' ? 'kartu-tebal' : 'kartu';
  return (
    <div className={`${kelas} ${className}`} {...sisa}>
      {children}
    </div>
  );
}

/** Judul bagian di dalam kartu. */
export function JudulKartu({ children, keterangan, aksi }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-netral-200 px-5 py-4">
      <div>
        <h2 className="text-lg font-semibold text-sogan-800">{children}</h2>
        {keterangan && <p className="mt-1 text-sm text-netral-500">{keterangan}</p>}
      </div>
      {aksi}
    </div>
  );
}
