/**
 * ============================================================================
 *  Komponen: Badge status acara
 * ============================================================================
 *  Warna mengikuti Panduan bagian 8:
 *    Draft = abu, Penilaian = biru, Voting = emas, Selesai = hijau
 * ============================================================================
 */

import { STATUS_ACARA } from '../shared/constants.js';

const GAYA = {
  [STATUS_ACARA.DRAFT]: 'bg-netral-100 text-netral-700 ring-netral-300',
  [STATUS_ACARA.PENILAIAN]: 'bg-[#E8F0F8] text-penilaian ring-[#B8D0E8]',
  [STATUS_ACARA.VOTING]: 'bg-emas-100 text-emas-800 ring-emas-300',
  [STATUS_ACARA.SELESAI]: 'bg-[#E6F2EA] text-selesai ring-[#B3D9C2]',
};

const IKON = {
  [STATUS_ACARA.DRAFT]: '○',
  [STATUS_ACARA.PENILAIAN]: '✎',
  [STATUS_ACARA.VOTING]: '◈',
  [STATUS_ACARA.SELESAI]: '✓',
};

export default function BadgeStatus({ status, ukuran = 'md' }) {
  const gaya = GAYA[status] ?? GAYA[STATUS_ACARA.DRAFT];
  const kecil = ukuran === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 font-medium ${gaya} ${
        kecil ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span aria-hidden="true">{IKON[status] ?? '○'}</span>
      {status}
    </span>
  );
}
