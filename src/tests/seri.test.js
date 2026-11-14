/**
 * ============================================================================
 *  Dina Becik — UNIT TEST T6: ATURAN SERI
 * ============================================================================
 *  Mengunci aturan "seri dimenangkan ranking Sesepuh" memakai data uji
 *  sintetis di `src/fixtures/dataUjiSeri.js`.
 *
 *  Jalankan: npm test
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

import { hitungBorda } from '../shared/borda.js';
import {
  RANKING_SERI_PER_DM,
  ACUAN_SERI_BORDA,
  PASANGAN_SERI,
  PEMENANG_UJI_SERI,
  KALAH_KARENA_SERI,
} from '../fixtures/dataUjiSeri.js';

describe('T6: data uji seri — hitungBorda', () => {
  const hasil = hitungBorda(RANKING_SERI_PER_DM);
  const peta = Object.fromEntries(hasil.rincian.map((r) => [r.kode, r]));

  it('jumlah kandidat n = 6', () => {
    expect(hasil.jumlahKandidat).toBe(6);
  });

  it('A dan B benar-benar seri dengan total poin yang sama', () => {
    expect(peta.A.totalPoin).toBe(PASANGAN_SERI.totalPoin);
    expect(peta.B.totalPoin).toBe(PASANGAN_SERI.totalPoin);
    expect(peta.A.totalPoin).toBe(peta.B.totalPoin);
  });

  it('hanya A dan B yang ditandai seri', () => {
    const seri = hasil.rincian.filter((r) => r.seri).map((r) => r.kode).sort();
    expect(seri).toEqual([...PASANGAN_SERI.kandidat].sort());
    expect(hasil.seriTeratasi).toBe(true);
  });

  it('seri dimenangkan A karena ranking Sesepuh lebih tinggi', () => {
    expect(hasil.pemenang).toBe(PEMENANG_UJI_SERI.kode);
    expect(peta.A.rankingFinal).toBe(1);
    expect(peta.B.rankingFinal).toBe(2);
    expect(peta.A.rankingPerDm.sesepuh).toBeLessThan(peta.B.rankingPerDm.sesepuh);
  });

  it('B unggul di WO tetapi tetap kalah karena aturan seri', () => {
    expect(peta.B.rankingPerDm.wo).toBe(KALAH_KARENA_SERI.rankingWo);
    expect(peta.B.rankingPerDm.wo).toBeLessThan(peta.A.rankingPerDm.wo);
    expect(peta.B.rankingFinal).toBeGreaterThan(peta.A.rankingFinal);
  });

  it('ranking final berurutan A, B, C, D, E, F', () => {
    const urut = [...hasil.rincian]
      .sort((a, b) => a.rankingFinal - b.rankingFinal)
      .map((r) => r.kode);
    expect(urut).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });

  it('total seluruh poin = (3+2+1) x jumlah poin Borda (6+5+4+3+2+1)', () => {
    const total = hasil.rincian.reduce((a, r) => a + r.totalPoin, 0);
    expect(total).toBe(6 * 21);
  });

  for (const acuan of ACUAN_SERI_BORDA) {
    it(`kandidat ${acuan.kode}: poin sesepuh=${acuan.poinSesepuh}, ortu=${acuan.poinOrtu}, wo=${acuan.poinWo}, total=${acuan.totalPoin}, rank=${acuan.rankingFinal}`, () => {
      const r = peta[acuan.kode];
      expect(r.poinSesepuh).toBe(acuan.poinSesepuh);
      expect(r.poinOrtu).toBe(acuan.poinOrtu);
      expect(r.poinWo).toBe(acuan.poinWo);
      expect(r.totalPoin).toBe(acuan.totalPoin);
      expect(r.rankingFinal).toBe(acuan.rankingFinal);
    });
  }
});
