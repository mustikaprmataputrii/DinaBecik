/**
 * ============================================================================
 *  Dina Becik — UNIT TEST ACUAN
 * ============================================================================
 *  Tujuan: MENGUNCI kebenaran perhitungan.
 *  Jika ada yang merusak rumus weton / WP / Borda, test ini langsung GAGAL.
 *
 *  Jalankan: npm test
 *  Acuan: Panduan Proyek bagian 6.1, 6.2, 6.3, 7 (Tabel 7.1, 7.2, 7.3), 14.
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';

import { hitungWeton, hitungSkorWeton, hitungSisaWeton } from '../shared/weton.js';
import { hitungWP, validasiBobot, normalisasiBobot, rankingDariWP } from '../shared/wp.js';
import { hitungBorda, cekGerbangVoting, poinBorda } from '../shared/borda.js';
import { BOBOT_AWAL, ATURAN_WETON, TOTAL_BOBOT_WAJIB } from '../shared/constants.js';
import {
  KANDIDAT_TABEL_71,
  KANDIDAT_UNTUK_WP,
  ACUAN_TABEL_72,
  ACUAN_TABEL_73,
  RANKING_PER_DM_ACUAN,
  PEMENANG_ACUAN,
} from '../fixtures/dataAcuan.js';

/* ==========================================================================
 *  A. WETON & NEPTU — Panduan 6.1
 * ======================================================================== */

describe('hitungWeton — titik acuan panduan 6.1', () => {
  it('17 Agustus 1945 adalah Jumat Legi', () => {
    const w = hitungWeton('1945-08-17');
    expect(w.hari).toBe('Jumat');
    expect(w.pasaran).toBe('Legi');
  });

  it('1 Januari 1970 adalah Kamis Wage', () => {
    const w = hitungWeton('1970-01-01');
    expect(w.hari).toBe('Kamis');
    expect(w.pasaran).toBe('Wage');
  });

  it('7 Agustus 2027 adalah Sabtu Legi dengan neptu 14', () => {
    const w = hitungWeton('2027-08-07');
    expect(w.hari).toBe('Sabtu');
    expect(w.pasaran).toBe('Legi');
    expect(w.neptuWeton).toBe(14);
  });
});

describe('Tabel 7.1 — hari, pasaran, dan neptu weton harus cocok', () => {
  for (const k of KANDIDAT_TABEL_71) {
    it(`kandidat ${k.kode} (${k.tanggal}) = ${k.hari} ${k.pasaran}, neptu ${k.neptuWetonH}`, () => {
      const w = hitungWeton(k.tanggal);
      expect(w.hari).toBe(k.hari);
      expect(w.pasaran).toBe(k.pasaran);
      expect(w.neptuWeton).toBe(k.neptuWetonH);
    });
  }
});

describe('skor C1 weton — Tabel 7.1 kolom C1', () => {
  const neptuPria = 15; // Kamis Pon
  const neptuWanita = 9; // Senin Legi

  it('total neptu mempelai = 24', () => {
    expect(neptuPria + neptuWanita).toBe(24);
  });

  for (const k of KANDIDAT_TABEL_71) {
    it(`kandidat ${k.kode} -> skor C1 = ${k.skorWeton}`, () => {
      const hasil = hitungSkorWeton(k.tanggal, neptuPria, neptuWanita);
      expect(hasil.skor).toBe(k.skorWeton);
    });
  }

  it('pemetaan sisa -> skor mengikuti tabel aturan_weton (tidak natural)', () => {
    const peta = Object.fromEntries(ATURAN_WETON.map((a) => [a.sisa, a.skor]));
    expect(peta[3]).toBe(5);
    expect(peta[1]).toBe(4);
    expect(peta[2]).toBe(3);
    expect(peta[4]).toBe(2);
    expect(peta[0]).toBe(1);
  });

  it('hitungSisaWeton memakai neptu WETON, bukan neptu hari saja', () => {
    // E: Sabtu Legi, neptu weton 14 -> (24 + 14) % 5 = 3 -> skor 5
    expect(hitungSisaWeton(24 - 9, 9, 14)).toBe(3);
    // Jika memakai neptu hari saja (Sabtu = 9): (24 + 9) % 5 = 3 -> juga 3.
    // Uji pembeda: kandidat A (Sabtu Kliwon). Weton 17 -> sisa 1 -> skor 4.
    // Neptu hari saja 9 -> sisa 3 -> skor 5. Tabel 7.1 menulis 4.
    expect(hitungSisaWeton(15, 9, 17)).toBe(1);
  });
});

/* ==========================================================================
 *  B. VALIDASI BOBOT — Panduan bagian 5 & uji T3
 * ======================================================================== */

describe('validasi bobot — T3: total bukan 100% harus ditolak', () => {
  it('bobot bawaan tiap DM totalnya 100%', () => {
    for (const dm of ['sesepuh', 'orangtua', 'wo']) {
      const v = validasiBobot(BOBOT_AWAL[dm]);
      expect(v.valid).toBe(true);
      expect(v.total).toBe(TOTAL_BOBOT_WAJIB);
    }
  });

  it('bobot 90% ditolak', () => {
    const v = validasiBobot({ weton: 40, biaya: 10, gedung: 15, cuaca: 15, tamu: 10 });
    expect(v.valid).toBe(false);
    expect(v.pesan).toContain('100');
  });

  it('bobot 110% ditolak', () => {
    const v = validasiBobot({ weton: 50, biaya: 10, gedung: 15, cuaca: 15, tamu: 20 });
    expect(v.valid).toBe(false);
  });

  it('normalisasiBobot melempar error jika total bukan 100%', () => {
    expect(() => normalisasiBobot({ weton: 40, biaya: 10, gedung: 15, cuaca: 15, tamu: 10 })).toThrow(/100/);
  });

  it('normalisasiBobot mengubah persen menjadi desimal', () => {
    const b = normalisasiBobot(BOBOT_AWAL.sesepuh);
    expect(b.weton).toBeCloseTo(0.4, 10);
    expect(b.biaya).toBeCloseTo(0.1, 10);
    const total = Object.values(b).reduce((a, x) => a + x, 0);
    expect(total).toBeCloseTo(1, 10);
  });
});

/* ==========================================================================
 *  C. WEIGHTED PRODUCT — Tabel 7.2 (uji T2)
 * ======================================================================== */

describe('hitungWP — T2: harus sama dengan Tabel 7.2 sampai 4 desimal', () => {
  for (const dm of ['sesepuh', 'orangtua', 'wo']) {
    it(`DM ${dm}: nilai S dan ranking cocok dengan Tabel 7.2`, () => {
      const { hasil } = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL[dm]);
      const peta = Object.fromEntries(hasil.map((h) => [h.kode, h]));

      for (const kode of ['A', 'B', 'C', 'D', 'E', 'F']) {
        const acuan = ACUAN_TABEL_72[dm][kode];
        expect(Number(peta[kode].s.toFixed(4))).toBe(acuan.s);
        expect(peta[kode].ranking).toBe(acuan.ranking);
      }
    });
  }

  it('jumlah semua V = 1', () => {
    const { hasil } = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.sesepuh);
    const totalV = hasil.reduce((a, h) => a + h.v, 0);
    expect(totalV).toBeCloseTo(1, 10);
  });

  it('rankingDariWP menghasilkan peta ranking yang benar', () => {
    const { hasil } = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.sesepuh);
    expect(rankingDariWP(hasil)).toEqual(RANKING_PER_DM_ACUAN.sesepuh);
  });

  it('pangkat biaya negatif (kriteria cost) benar-benar diterapkan', () => {
    // Jika biaya diperlakukan benefit, kandidat termahal (F, 44) akan unggul
    // pada kriteria itu, dan S akan berbeda. Pastikan angka acuan tetap cocok.
    const { hasil } = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.orangtua);
    const peta = Object.fromEntries(hasil.map((h) => [h.kode, h]));
    // Orang Tua memberi bobot biaya terbesar (35%). D (30 juta) harus unggul
    // atas F (44 juta) pada kriteria biaya.
    expect(peta.D.s).toBeLessThan(peta.F.s); // tetap kalah overall karena C1 buruk
    expect(Number(peta.E.s.toFixed(4))).toBe(0.757);
  });

  it('WP menolak nilai kriteria <= 0', () => {
    const rusak = [{ kode: 'X', weton: 0, biaya: 30, gedung: 3, cuaca: 3, tamu: 3 }];
    expect(() => hitungWP(rusak, BOBOT_AWAL.sesepuh)).toThrow();
  });

  it('WP menolak daftar kandidat kosong', () => {
    expect(() => hitungWP([], BOBOT_AWAL.sesepuh)).toThrow();
  });
});

/* ==========================================================================
 *  D. WEIGHTED BORDA — Tabel 7.3 (uji T5)
 * ======================================================================== */

describe('hitungBorda — T5: pemenang E dengan 35 poin, sama dengan Tabel 7.3', () => {
  const hasil = hitungBorda(RANKING_PER_DM_ACUAN);
  const peta = Object.fromEntries(hasil.rincian.map((r) => [r.kode, r]));

  it('jumlah kandidat n = 6', () => {
    expect(hasil.jumlahKandidat).toBe(6);
  });

  it('pemenang adalah E', () => {
    expect(hasil.pemenang).toBe(PEMENANG_ACUAN.kode);
  });

  for (const acuan of ACUAN_TABEL_73) {
    it(`kandidat ${acuan.kode}: poin sesepuh=${acuan.sesepuh.poin}, ortu=${acuan.orangtua.poin}, wo=${acuan.wo.poin}, total=${acuan.totalPoin}, rank=${acuan.rankingFinal}`, () => {
      const r = peta[acuan.kode];
      expect(r.poinSesepuh).toBe(acuan.sesepuh.poin);
      expect(r.poinOrtu).toBe(acuan.orangtua.poin);
      expect(r.poinWo).toBe(acuan.wo.poin);
      expect(r.totalPoin).toBe(acuan.totalPoin);
      expect(r.rankingFinal).toBe(acuan.rankingFinal);
    });
  }

  it('total seluruh poin = 3+2+1 dikali jumlah poin Borda (6+5+4+3+2+1 = 21)', () => {
    const total = hasil.rincian.reduce((a, r) => a + r.totalPoin, 0);
    expect(total).toBe(21 * 6);
  });

  it('WO menempatkan F di ranking 1, tetapi E tetap menang (bukti bobot jabatan)', () => {
    expect(RANKING_PER_DM_ACUAN.wo.F).toBe(1);
    expect(hasil.pemenang).toBe('E');
    expect(peta.E.totalPoin).toBeGreaterThan(peta.F.totalPoin);
  });
});

describe('poinBorda — rumus poin ranking', () => {
  it('n=6: ranking 1 = 6 poin, ranking 6 = 1 poin', () => {
    expect(poinBorda(1, 6)).toBe(6);
    expect(poinBorda(2, 6)).toBe(5);
    expect(poinBorda(6, 6)).toBe(1);
  });

  it('ranking di luar rentang ditolak', () => {
    expect(() => poinBorda(0, 6)).toThrow();
    expect(() => poinBorda(7, 6)).toThrow();
  });
});

/* ==========================================================================
 *  E. ATURAN SERI — uji T6
 * ======================================================================== */

describe('hitungBorda — T6: seri dimenangkan ranking Sesepuh', () => {
  it('dua kandidat dengan total poin sama -> ranking Sesepuh menentukan', () => {
    // Rancang seri: X dan Y total poin sama, tetapi X lebih tinggi di Sesepuh.
    // Sesepuh: X=1, Y=2 ; Ortu: X=2, Y=1 ; WO: X=2, Y=1  (n=2)
    // X = 2*3 + 1*2 + 1*1 = 9 ; Y = 1*3 + 2*2 + 2*1 = 9  -> seri
    const ranking = {
      sesepuh: { X: 1, Y: 2 },
      orangtua: { X: 2, Y: 1 },
      wo: { X: 2, Y: 1 },
    };
    const hasil = hitungBorda(ranking);
    const peta = Object.fromEntries(hasil.rincian.map((r) => [r.kode, r]));

    expect(peta.X.totalPoin).toBe(peta.Y.totalPoin); // benar-benar seri
    expect(hasil.seriTeratasi).toBe(true);
    expect(hasil.pemenang).toBe('X'); // X unggul di ranking Sesepuh
  });

  it('seri tetap diatasi walau Sesepuh lebih rendah di DM lain', () => {
    const ranking = {
      sesepuh: { P: 1, Q: 2 },
      orangtua: { P: 2, Q: 1 },
      wo: { P: 2, Q: 1 },
    };
    const hasil = hitungBorda(ranking);
    expect(hasil.pemenang).toBe('P');
  });
});

/* ==========================================================================
 *  F. GERBANG VOTING — uji T4
 * ======================================================================== */

describe('cekGerbangVoting — T4: voting terkunci sebelum ketiga DM mengirim', () => {
  it('baru 2 DM kirim -> terkunci', () => {
    const g = cekGerbangVoting({ sesepuh: true, orangtua: true, wo: false });
    expect(g.terbuka).toBe(false);
    expect(g.sudah).toBe(2);
    expect(g.belum).toEqual(['wo']);
  });

  it('baru 1 DM kirim -> terkunci', () => {
    const g = cekGerbangVoting({ sesepuh: true, orangtua: false, wo: false });
    expect(g.terbuka).toBe(false);
    expect(g.belum).toEqual(['orangtua', 'wo']);
  });

  it('ketiga DM kirim -> terbuka', () => {
    const g = cekGerbangVoting({ sesepuh: true, orangtua: true, wo: true });
    expect(g.terbuka).toBe(true);
    expect(g.sudah).toBe(3);
  });

  it('hitungBorda menolak jika ranking DM belum lengkap', () => {
    expect(() =>
      hitungBorda({ sesepuh: { A: 1 }, orangtua: { A: 1 } })
    ).toThrow(/wo/);
  });
});

/* ==========================================================================
 *  G. UJI T9 — bobot satu DM berubah, DM lain tidak terpengaruh
 * ======================================================================== */

describe('T9: ganti bobot satu DM hanya mengubah ranking DM itu', () => {
  it('bobot WO diubah -> ranking Sesepuh & Orang Tua tetap', () => {
    const sebelumSesepuh = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.sesepuh);
    const sebelumOrtu = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.orangtua);
    const sebelumWo = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.wo);

    // WO mengubah bobot: prioritaskan biaya (cost) besar
    const bobotWoBaru = { weton: 10, biaya: 60, gedung: 10, cuaca: 10, tamu: 10 };
    const sesudahWo = hitungWP(KANDIDAT_UNTUK_WP, bobotWoBaru);
    const sesudahSesepuh = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.sesepuh);
    const sesudahOrtu = hitungWP(KANDIDAT_UNTUK_WP, BOBOT_AWAL.orangtua);

    // DM lain tidak berubah sama sekali
    expect(rankingDariWP(sesudahSesepuh.hasil)).toEqual(rankingDariWP(sebelumSesepuh.hasil));
    expect(rankingDariWP(sesudahOrtu.hasil)).toEqual(rankingDariWP(sebelumOrtu.hasil));

    // DM yang diubah berubah rankingnya
    expect(rankingDariWP(sesudahWo.hasil)).not.toEqual(rankingDariWP(sebelumWo.hasil));
  });
});
