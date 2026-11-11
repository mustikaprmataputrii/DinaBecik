/**
 * ============================================================================
 *  Komponen: Badge status acara
 * ============================================================================
 *  Warna mengikuti Panduan bagian 8:
 *    Draft = abu, Penilaian = biru, Voting = emas, Selesai = hijau
 *
 *  Varian `gelap` dipakai di dalam kartu-emas (panel sogan) agar tetap kontras.
 * ============================================================================
 */

import { STATUS_ACARA } from '../shared/constants.js';

const GAYA = {
  [STATUS_ACARA.DRAFT]:
    'bg-gradient-to-b from-netral-50 to-netral-200 text-netral-700 ring-netral-300',
  [STATUS_ACARA.PENILAIAN]:
    'bg-gradient-to-b from-[#EDF4FA] to-[#D9E8F4] text-penilaian ring-[#A9C7E0]',
  [STATUS_ACARA.VOTING]:
    'bg-gradient-to-b from-emas-100 to-emas-300 text-emas-900 ring-emas-400',
  [STATUS_ACARA.SELESAI]:
    'bg-gradient-to-b from-[#EAF5EE] to-[#CFE8D8] text-selesai ring-[#9CCBAE]',
};

const GAYA_GELAP = {
  [STATUS_ACARA.DRAFT]: 'bg-netral-0/10 text-krem-100 ring-krem-200/30',
  [STATUS_ACARA.PENILAIAN]: 'bg-[#2F6FA8]/25 text-[#CFE4F5] ring-[#7FAFD6]/50',
  [STATUS_ACARA.VOTING]: 'bg-emas-500/20 text-emas-200 ring-emas-400/60',
  [STATUS_ACARA.SELESAI]: 'bg-[#2E7D4F]/25 text-[#C6E8D3] ring-[#7FC49B]/50',
};

const IKON = {
  [STATUS_ACARA.DRAFT]: '○',
  [STATUS_ACARA.PENILAIAN]: '✎',
  [STATUS_ACARA.VOTING]: '◈',
  [STATUS_ACARA.SELESAI]: '✓',
};

export default function BadgeStatus({ status, ukuran = 'md', gelap = false }) {
  const peta = gelap ? GAYA_GELAP : GAYA;
  const gaya = peta[status] ?? peta[STATUS_ACARA.DRAFT];
  const kecil = ukuran === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium shadow-sm ring-1 ${gaya} ${
        kecil ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <span aria-hidden="true">{IKON[status] ?? '○'}</span>
      {status}
    </span>
  );
}
