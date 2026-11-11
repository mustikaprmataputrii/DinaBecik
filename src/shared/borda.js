/**
 * ============================================================================
 *  Dina Becik — WEIGHTED BORDA (KONSENSUS)
 * ============================================================================
 *  Mengubah ranking tiap DM menjadi poin, dikali bobot jabatan.
 *  Acuan: Panduan Proyek bagian 6.3.
 *
 *  Aturan:
 *   - Poin ranking: dengan n kandidat, ranking 1 = n poin, ranking 2 = n-1, ...
 *     ranking terakhir = 1 poin.
 *   - Bobot jabatan: Sesepuh 3, Orang Tua 2, WO 1.
 *   - Total poin = jumlah poin berbobot dari ketiga DM. Tertinggi menang.
 *   - SERI: dimenangkan kandidat yang lebih tinggi di ranking Sesepuh
 *     (jabatan tertinggi).
 * ============================================================================
 */

import { BOBOT_JABATAN, URUTAN_DM, PRESISI_INTERNAL } from './constants.js';

/**
 * Hitung poin Borda mentah dari sebuah ranking.
 * @param {number} ranking ranking kandidat (1 = terbaik)
 * @param {number} jumlahKandidat n
 * @returns {number} poin = n - ranking + 1
 */
export function poinBorda(ranking, jumlahKandidat) {
  if (!Number.isInteger(ranking) || ranking < 1 || ranking > jumlahKandidat) {
    throw new Error(`Ranking tidak valid: ${ranking} (n=${jumlahKandidat})`);
  }
  return jumlahKandidat - ranking + 1;
}

/**
 * Hitung konsensus Weighted Borda.
 *
 * @param {Object<string, Object<string, number>>} rankingPerDm
 *        Peta DM -> { kodeKandidat: ranking }
 *        contoh: { sesepuh: { A:3, B:4, ... }, orangtua: {...}, wo: {...} }
 * @param {object} [opsi]
 * @param {Object<string, number>} [opsi.bobotJabatan] override bobot jabatan
 * @param {Object<string, number>} [opsi.bobotSuara] alias lain untuk bobotJabatan
 * @returns {{
 *   jumlahKandidat: number,
 *   rincian: Array<{
 *     kode: string,
 *     poinSesepuh: number, poinOrtu: number, poinWo: number,
 *     totalPoin: number, rankingFinal: number, seri: boolean,
 *     rankingPerDm: Object<string, number>
 *   }>,
 *   pemenang: string|null,
 *   seriTeratasi: boolean
 * }}
 */
export function hitungBorda(rankingPerDm, opsi = {}) {
  const bobot = opsi.bobotJabatan ?? opsi.bobotSuara ?? BOBOT_JABATAN;

  // Validasi: ketiga DM wajib ada
  for (const dm of URUTAN_DM) {
    if (!rankingPerDm?.[dm]) {
      throw new Error(`Ranking untuk decision maker "${dm}" belum tersedia. Voting terkunci.`);
    }
  }

  // Kumpulan kode kandidat (ambil dari DM pertama, lalu pastikan konsisten)
  const kodeList = Object.keys(rankingPerDm[URUTAN_DM[0]]);
  const n = kodeList.length;
  if (n === 0) throw new Error('Tidak ada kandidat untuk dihitung.');

  for (const dm of URUTAN_DM) {
    const kunci = Object.keys(rankingPerDm[dm]).sort();
    if (kunci.join(',') !== [...kodeList].sort().join(',')) {
      throw new Error(`Daftar kandidat pada DM "${dm}" tidak sama dengan DM lain.`);
    }
  }

  // Hitung poin tiap kandidat
  const rincian = kodeList.map((kode) => {
    const rSesepuh = rankingPerDm.sesepuh[kode];
    const rOrtu = rankingPerDm.orangtua[kode];
    const rWo = rankingPerDm.wo[kode];

    const poinSesepuh = poinBorda(rSesepuh, n) * (bobot.sesepuh ?? BOBOT_JABATAN.sesepuh);
    const poinOrtu = poinBorda(rOrtu, n) * (bobot.orangtua ?? BOBOT_JABATAN.orangtua);
    const poinWo = poinBorda(rWo, n) * (bobot.wo ?? BOBOT_JABATAN.wo);

    return {
      kode,
      poinSesepuh,
      poinOrtu,
      poinWo,
      totalPoin: poinSesepuh + poinOrtu + poinWo,
      rankingFinal: 0,
      seri: false,
      rankingPerDm: { sesepuh: rSesepuh, orangtua: rOrtu, wo: rWo },
    };
  });

  // Urutkan: total poin menurun; jika seri -> ranking Sesepuh lebih kecil menang
  rincian.sort((a, b) => {
    const selisih = b.totalPoin - a.totalPoin;
    if (Math.abs(selisih) > 1e-9) return selisih;
    return a.rankingPerDm.sesepuh - b.rankingPerDm.sesepuh;
  });

  // Beri ranking final & tandai seri
  rincian.forEach((baris, i) => {
    baris.rankingFinal = i + 1;
  });

  let seriTeratasi = false;
  for (let i = 1; i < rincian.length; i++) {
    if (Math.abs(rincian[i].totalPoin - rincian[i - 1].totalPoin) <= 1e-9) {
      rincian[i].seri = true;
      rincian[i - 1].seri = true;
      seriTeratasi = true;
    }
  }

  return {
    jumlahKandidat: n,
    rincian,
    pemenang: rincian.length ? rincian[0].kode : null,
    seriTeratasi,
  };
}

/**
 * Cek apakah voting boleh dibuka.
 * Voting hanya terbuka jika KETIGA DM sudah mengirim penilaian.
 *
 * @param {Object<string, boolean>} statusKirim contoh: { sesepuh:true, orangtua:false, wo:true }
 * @returns {{terbuka: boolean, sudah: number, total: number, belum: string[]}}
 */
export function cekGerbangVoting(statusKirim) {
  const belum = URUTAN_DM.filter((dm) => statusKirim?.[dm] !== true);
  return {
    terbuka: belum.length === 0,
    sudah: URUTAN_DM.length - belum.length,
    total: URUTAN_DM.length,
    belum,
  };
}

/**
 * Ubah hasil hitungBorda menjadi bentuk tabel `voting_hasil` untuk disimpan.
 * Hasil final dihitung SEKALI, disimpan, lalu dibaca ketiga akun.
 *
 * @param {ReturnType<typeof hitungBorda>} hasilBorda
 * @returns {Array<object>}
 */
export function keBarisVotingHasil(hasilBorda) {
  return hasilBorda.rincian.map((b) => ({
    kandidat_kode: b.kode,
    poin_sesepuh: b.poinSesepuh,
    poin_ortu: b.poinOrtu,
    poin_wo: b.poinWo,
    total_poin: b.totalPoin,
    ranking_final: b.rankingFinal,
  }));
}

/** Pembulatan untuk tampilan. */
export function round(angka, desimal = PRESISI_INTERNAL) {
  const f = Math.pow(10, desimal);
  return Math.round((angka + Number.EPSILON) * f) / f;
}
