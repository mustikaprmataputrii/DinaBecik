/**
 * ============================================================================
 *  Komponen: Kartu
 * ============================================================================
 *  Wadah dasar untuk semua konten. Tiga varian:
 *    - "biasa" : gradasi krem, untuk isi umum
 *    - "tebal" : gradasi krem lebih dalam + garis sogan, untuk konten penting
 *    - "emas"  : panel sogan gelap berbatik emas, untuk hero / penekanan
 *
 *  Opsi `bingkai` menambahkan ornamen sudut emas ala bingkai ukiran Jawa.
 * ============================================================================
 */

const KELAS_VARIAN = {
  biasa: 'kartu',
  tebal: 'kartu-tebal',
  emas: 'kartu-emas',
};

export default function Kartu({
  children,
  varian = 'biasa',
  bingkai = false,
  className = '',
  ...sisa
}) {
  const kelas = KELAS_VARIAN[varian] ?? KELAS_VARIAN.biasa;
  const ornamen = bingkai ? 'bingkai-jawa' : '';

  return (
    <div className={`${kelas} ${ornamen} ${className}`} {...sisa}>
      {children}
    </div>
  );
}

/**
 * Judul bagian di dalam kartu.
 * `gelap` dipakai saat kartu bertipe "emas" agar teks tetap kontras.
 */
export function JudulKartu({ children, keterangan, aksi, gelap = false }) {
  return (
    <div
      className={`flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4 ${
        gelap ? 'border-emas-500/30' : 'border-sogan-200'
      }`}
    >
      <div>
        <h2
          className={`text-lg font-semibold ${gelap ? 'text-emas-100' : 'text-sogan-800'}`}
        >
          {children}
        </h2>
        {keterangan && (
          <p className={`mt-1 text-sm ${gelap ? 'text-krem-200/70' : 'text-netral-500'}`}>
            {keterangan}
          </p>
        )}
      </div>
      {aksi}
    </div>
  );
}

/**
 * Blok teks berbingkai — untuk paragraf penjelasan agar tidak "menggantung"
 * di atas latar batik. Selalu berupa kartu, tidak pernah teks telanjang.
 */
export function BlokTeks({ judul, children, ikon, className = '' }) {
  return (
    <div className={`kartu aksen-kiri px-4 py-3 ${className}`}>
      {judul && (
        <div className="mb-1 flex items-center gap-2">
          {ikon && (
            <span aria-hidden="true" className="text-emas-600">
              {ikon}
            </span>
          )}
          <span className="text-xs font-semibold uppercase tracking-wide text-sogan-700">
            {judul}
          </span>
        </div>
      )}
      <div className="text-sm leading-relaxed text-netral-700">{children}</div>
    </div>
  );
}
