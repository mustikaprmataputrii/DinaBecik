/** Firestore implementation of the adapter contract. */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, SIAP as FIREBASE_SIAP } from './firebase.js';
import { KRITERIA, BOBOT_AWAL, URUTAN_DM, TOTAL_BOBOT_WAJIB, TOLERANSI_BOBOT } from '../shared/constants.js';
import { hitungWP } from '../shared/wp.js';
import { lengkapiKandidatWeton } from '../shared/weton.js';

const ACARA_DEMO_ID = 'acara-demo-2027';
const WORKER_URL = import.meta.env?.VITE_DINA_API_URL;

export const SIAP = FIREBASE_SIAP;

function requiereFirebase() {
  if (!SIAP) throw new Error('Firebase belum dikonfigurasi. Isi variabel VITE_FIREBASE_* di .env.local.');
  return db;
}
function evento(acaraId) {
  return doc(requiereFirebase(), 'acara', acaraId || ACARA_DEMO_ID);
}
async function usuarioActual(userId) {
  if (auth?.authStateReady) await auth.authStateReady();
  if (!auth?.currentUser) throw new Error('Anda harus login terlebih dahulu.');
  if (userId && userId !== auth.currentUser.uid) {
    if (!URUTAN_DM.includes(userId) || (await profil(auth.currentUser)).peran !== userId) {
      throw new Error('Tidak boleh bertindak atas nama pengguna lain.');
    }
  }
  return auth.currentUser;
}
async function profil(user) {
  const snap = await getDoc(doc(requiereFirebase(), 'users', user.uid));
  if (!snap.exists()) throw new Error('Profil pengguna tidak ditemukan. Hubungi administrator.');
  const data = snap.data();
  if (!URUTAN_DM.includes(data.peran)) throw new Error('Peran akun tidak valid.');
  return data;
}

async function pastikanSesepuh() {
  const user = await usuarioActual();
  const data = await profil(user);
  if (data.peran !== 'sesepuh') throw new Error('Hanya Sesepuh yang boleh mengelola data acara.');
  return user;
}

function kandidatDariFirestore(item) {
  const data = item.data();
  return {
    ...data,
    id: item.id,
    kode: data.kode ?? item.id,
    neptuWetonH: data.neptu_weton_h ?? data.neptuWetonH,
    skorWeton: data.skor_weton ?? data.skorWeton,
    gedung: data.skor_gedung ?? data.gedung,
    cuaca: data.skor_cuaca ?? data.cuaca,
    tamu: data.skor_tamu ?? data.tamu,
  };
}

function kandidatUntukDisimpan(item) {
  return {
    kode: item.kode,
    tanggal: item.tanggal,
    hari: item.hari,
    pasaran: item.pasaran,
    neptu_weton_h: item.neptuWetonH,
    skor_weton: item.skorWeton,
    biaya: Number(item.biaya),
    skor_gedung: Number(item.gedung),
    skor_cuaca: Number(item.cuaca),
    skor_tamu: Number(item.tamu),
  };
}

async function pastikanBisaKelola(acaraId) {
  await pastikanSesepuh();
  const acara = await getAcara(acaraId);
  if (!acara) throw new Error('Acara tidak ditemukan.');
  if (acara.status !== 'Draft') throw new Error('Data acara hanya dapat diubah saat status Draft.');
  const terkirim = await getDocs(collection(evento(acaraId), 'penilaian'));
  if (terkirim.docs.some((item) => item.data().status_kirim === true)) {
    throw new Error('Data tidak dapat diubah setelah ada DM mengirim penilaian.');
  }
  return acara;
}

async function panggilWorker(endpoint, acaraId) {
  const user = await usuarioActual();
  if (!WORKER_URL) throw new Error('URL backend Cloudflare belum dikonfigurasi di VITE_DINA_API_URL.');
  const token = await user.getIdToken();
  const response = await fetch(`${WORKER_URL.replace(/\/$/, '')}/api/${endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ acaraId }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Backend gagal (${response.status}).`);
  return data;
}

function periksaNilaiKandidat(baris) {
  if (!baris?.tanggal || Number.isNaN(new Date(`${baris.tanggal}T00:00:00`).getTime())) {
    throw new Error('Tanggal kandidat tidak valid.');
  }
  if (!Number.isFinite(Number(baris.biaya)) || Number(baris.biaya) <= 0) {
    throw new Error('Biaya harus berupa angka lebih besar dari 0.');
  }
  for (const key of ['gedung', 'cuaca', 'tamu']) {
    const nilai = Number(baris[key]);
    if (!Number.isFinite(nilai) || nilai < 1 || nilai > 5) throw new Error(`Nilai ${key} harus antara 1 dan 5.`);
  }
}

export async function getAcara(acaraId = ACARA_DEMO_ID) {
  const snap = await getDoc(evento(acaraId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getKandidat(acaraId = ACARA_DEMO_ID) {
  const snap = await getDocs(collection(evento(acaraId), 'kandidat'));
  return snap.docs.map(kandidatDariFirestore).sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}
export async function getKriteria() { return KRITERIA.map((item) => ({ ...item })); }

export async function simpanAcara(acaraId = ACARA_DEMO_ID, patch = {}) {
  await pastikanBisaKelola(acaraId);
  const ref = evento(acaraId);
  const current = await getDoc(ref);
  const acara = { ...current.data(), ...patch };
  if (!String(acara.nama_acara ?? '').trim()) throw new Error('Nama acara wajib diisi.');
  for (const key of ['neptu_pria', 'neptu_wanita']) {
    if (!Number.isFinite(Number(acara[key])) || Number(acara[key]) <= 0) throw new Error('Neptu mempelai harus berupa angka lebih besar dari 0.');
  }
  const kandidatSnap = await getDocs(collection(ref, 'kandidat'));
  const batch = writeBatch(requiereFirebase());
  batch.update(ref, {
    nama_acara: String(acara.nama_acara).trim(),
    jenis: String(acara.jenis ?? 'pernikahan'),
    neptu_pria: Number(acara.neptu_pria),
    neptu_wanita: Number(acara.neptu_wanita),
    diperbarui_pada: serverTimestamp(),
  });
  for (const item of kandidatSnap.docs) {
    const old = kandidatDariFirestore(item);
    const lengkap = lengkapiKandidatWeton({ kode: old.kode, tanggal: old.tanggal, biaya: old.biaya, gedung: old.gedung, cuaca: old.cuaca, tamu: old.tamu }, acara.neptu_pria, acara.neptu_wanita);
    batch.update(item.ref, kandidatUntukDisimpan(lengkap));
  }
  await batch.commit();
  return { ...acara, id: acaraId };
}

export async function tambahKandidat(acaraId = ACARA_DEMO_ID, baris = {}) {
  const acara = await pastikanBisaKelola(acaraId);
  periksaNilaiKandidat(baris);
  const ref = collection(evento(acaraId), 'kandidat');
  const snap = await getDocs(ref);
  if (snap.docs.some((item) => item.get('tanggal') === baris.tanggal)) throw new Error('Tanggal kandidat sudah digunakan.');
  const used = new Set(snap.docs.map((item) => item.get('kode') ?? item.id));
  const kode = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'].find((value) => !used.has(value)) ?? `K${snap.size + 1}`;
  const kandidat = lengkapiKandidatWeton({
    kode, tanggal: baris.tanggal, biaya: Number(baris.biaya),
    gedung: Number(baris.gedung), cuaca: Number(baris.cuaca), tamu: Number(baris.tamu),
  }, acara.neptu_pria, acara.neptu_wanita);
  await setDoc(doc(ref, kode), kandidatUntukDisimpan(kandidat));
  return kandidat;
}

export async function ubahKandidat(acaraId = ACARA_DEMO_ID, kode, patch = {}) {
  const acara = await pastikanBisaKelola(acaraId);
  const ref = doc(collection(evento(acaraId), 'kandidat'), kode);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error(`Kandidat ${kode} tidak ditemukan.`);
  const current = kandidatDariFirestore(snap);
  const gabung = { ...current, ...patch, kode };
  periksaNilaiKandidat(gabung);
  const all = await getKandidat(acaraId);
  if (all.some((item) => item.kode !== kode && item.tanggal === gabung.tanggal)) throw new Error('Tanggal kandidat sudah digunakan.');
  const lengkap = lengkapiKandidatWeton({ kode, tanggal: gabung.tanggal, biaya: Number(gabung.biaya), gedung: Number(gabung.gedung), cuaca: Number(gabung.cuaca), tamu: Number(gabung.tamu) }, acara.neptu_pria, acara.neptu_wanita);
  await updateDoc(ref, kandidatUntukDisimpan(lengkap));
  return lengkap;
}

export async function hapusKandidat(acaraId = ACARA_DEMO_ID, kode) {
  await pastikanBisaKelola(acaraId);
  const all = await getKandidat(acaraId);
  if (all.length <= 2) throw new Error('Minimal dua kandidat harus tersedia.');
  const candidate = all.find((item) => item.kode === kode);
  if (!candidate) throw new Error(`Kandidat ${kode} tidak ditemukan.`);
  await deleteDoc(doc(collection(evento(acaraId), 'kandidat'), candidate.id));
}

export async function getBobotDm(acaraId, userId) {
  const user = await usuarioActual(userId);
  const snap = await getDoc(doc(evento(acaraId), 'bobot', user.uid));
  if (snap.exists()) return snap.data().bobot;
  const { peran } = await profil(user);
  return { ...BOBOT_AWAL[peran] };
}
export async function simpanBobotDm(acaraId, userId, bobot) {
  const user = await usuarioActual(userId);
  const total = Object.values(bobot ?? {}).reduce((sum, value) => sum + Number(value), 0);
  if (Object.keys(bobot ?? {}).length !== KRITERIA.length || !Object.values(bobot).every((value) => Number.isFinite(Number(value)) && Number(value) >= 0) || Math.abs(total - TOTAL_BOBOT_WAJIB) > TOLERANSI_BOBOT) {
    throw new Error('Bobot harus berupa lima nilai valid dengan total 100%.');
  }
  await setDoc(doc(evento(acaraId), 'bobot', user.uid), { user_id: user.uid, bobot, diperbarui_pada: serverTimestamp() });
}

export async function getPenilaianDm(acaraId, userId) {
  const user = await usuarioActual(userId);
  const ref = doc(evento(acaraId), 'penilaian', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const data = snap.data();
    if (data.status_kirim) return { statusKirim: true, hasil: data.hasil, waktuKirim: data.waktu_kirim };
  }
  const [kandidat, bobot] = await Promise.all([getKandidat(acaraId), getBobotDm(acaraId, user.uid)]);
  const vektor = kandidat.map((item) => ({ kode: item.kode ?? item.id, weton: item.skor_weton ?? item.skorWeton, biaya: item.biaya, gedung: item.skor_gedung ?? item.gedung, cuaca: item.skor_cuaca ?? item.cuaca, tamu: item.skor_tamu ?? item.tamu }));
  const hasil = hitungWP(vektor, bobot);
  return { statusKirim: false, ...hasil, waktuKirim: null };
}

export async function kirimPenilaian(acaraId, userId) {
  await usuarioActual(userId);
  return panggilWorker('submit', acaraId || ACARA_DEMO_ID);
}

export async function getStatusSemuaDm(acaraId = ACARA_DEMO_ID) {
  requiereFirebase();
  const snap = await getDocs(collection(evento(acaraId), 'penilaian'));
  const status = Object.fromEntries(URUTAN_DM.map((role) => [role, false]));
  for (const item of snap.docs) {
    const data = item.data();
    if (URUTAN_DM.includes(data.peran)) status[data.peran] = data.status_kirim === true;
  }
  return status;
}

export async function mulaiPenilaian(acaraId = ACARA_DEMO_ID) {
  await pastikanSesepuh();
  return panggilWorker('start', acaraId);
}

export async function getHasilVoting(acaraId = ACARA_DEMO_ID) {
  let snap = await getDocs(collection(evento(acaraId), 'voting_hasil'));
  if (snap.empty && (await getAcara(acaraId))?.status === 'Voting') {
    await panggilWorker('finalize', acaraId);
    snap = await getDocs(collection(evento(acaraId), 'voting_hasil'));
  }
  if (snap.empty) return null;
  const rincian = snap.docs.map((item) => {
    const row = item.data();
    return {
      kode: item.id,
      poinSesepuh: row.poin_sesepuh,
      poinOrtu: row.poin_ortu,
      poinWo: row.poin_wo,
      totalPoin: row.total_poin,
      rankingFinal: row.ranking_final,
      seri: row.seri === true,
      rankingPerDm: {
        sesepuh: row.ranking_sesepuh,
        orangtua: row.ranking_orangtua,
        wo: row.ranking_wo,
      },
    };
  }).sort((a, b) => a.rankingFinal - b.rankingFinal);
  return {
    jumlahKandidat: rincian.length,
    rincian,
    pemenang: rincian.find((row) => row.rankingFinal === 1)?.kode ?? null,
    seriTeratasi: rincian.some((row) => row.seri),
  };
}
export async function simpanHasilVoting() {
  // Worker finalizes Borda automatically when the third DM submits. Never write from the browser.
  throw new Error('Hasil voting disimpan otomatis oleh backend tepercaya; browser tidak boleh menulis voting_hasil.');
}
export async function getKomentar(acaraId = ACARA_DEMO_ID) {
  const snap = await getDocs(query(collection(evento(acaraId), 'komentar')));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}
export async function simpanKomentar(acaraId = ACARA_DEMO_ID, userId, isi) {
  const user = await usuarioActual(userId);
  const teks = String(isi ?? '').trim();
  if (!teks) throw new Error('Komentar tidak boleh kosong.');
  await addDoc(collection(evento(acaraId), 'komentar'), { user_id: user.uid, isi: teks, waktu: serverTimestamp() });
}
export async function getRiwayatAcara() {
  const user = await usuarioActual();
  await profil(user);
  const snap = await getDocs(query(collection(requiereFirebase(), 'acara'), where('status', '==', 'Selesai')));
  return snap.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function resetDemo() {
  throw new Error('Reset data contoh hanya tersedia pada adapter demo. Data Firebase tidak dihapus otomatis.');
}
