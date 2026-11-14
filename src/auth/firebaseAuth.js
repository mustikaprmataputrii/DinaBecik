import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, SIAP } from '../data/firebase.js';
import { BOBOT_JABATAN, DECISION_MAKERS, URUTAN_DM } from '../shared/constants.js';

const KUNCI_SESI = 'dina-becik-sesi';
const env = import.meta.env ?? {};
const EMAIL_PERAN = {
  sesepuh: env.VITE_FIREBASE_EMAIL_SESEPUH,
  orangtua: env.VITE_FIREBASE_EMAIL_ORANGTUA,
  wo: env.VITE_FIREBASE_EMAIL_WO,
};

function cekSiap() {
  if (!SIAP || !auth || !db) throw new Error('Firebase belum dikonfigurasi. Isi variabel VITE_FIREBASE_* di .env.local.');
}

function emailUntukLogin(identifier) {
  const input = String(identifier ?? '').trim().toLowerCase();
  if (input.includes('@')) return input;
  const email = EMAIL_PERAN[input];
  if (!email) throw new Error('Masukkan username peran atau email akun Firebase.');
  return email;
}

function bentukSesi(user, profile) {
  const peran = profile.peran;
  const anggota = DECISION_MAKERS.find((item) => item.key === peran);
  return {
    userId: user.uid,
    uid: user.uid,
    email: user.email,
    username: peran,
    peran,
    nama: profile.nama || anggota?.nama || peran,
    bobotSuara: profile.bobot_suara ?? BOBOT_JABATAN[peran],
  };
}

export function dmDariPeran(peran) {
  return DECISION_MAKERS.find((item) => item.key === peran) ?? null;
}

export async function login(username, password) {
  cekSiap();
  try {
    const credential = await signInWithEmailAndPassword(auth, emailUntukLogin(username), password);
    const profileSnap = await getDoc(doc(db, 'users', credential.user.uid));
    if (!profileSnap.exists() || !URUTAN_DM.includes(profileSnap.get('peran'))) {
      await signOut(auth);
      throw new Error('Akun belum memiliki profil decision maker yang sah.');
    }
    const sesi = bentukSesi(credential.user, profileSnap.data());
    sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
    return sesi;
  } catch (error) {
    if (error.code?.startsWith('auth/')) throw new Error('Username atau password salah.');
    throw error;
  }
}

export async function logout() {
  cekSiap();
  sessionStorage.removeItem(KUNCI_SESI);
  await signOut(auth);
}

/** Pemulihan sesi UI; operasi Firestore tetap divalidasi oleh token Auth dan rules. */
export function sesiAktif() {
  try {
    const raw = sessionStorage.getItem(KUNCI_SESI);
    if (!raw) return null;
    const sesi = JSON.parse(raw);
    if (!URUTAN_DM.includes(sesi.peran) || !sesi.userId) return null;
    return sesi;
  } catch {
    return null;
  }
}

export function daftarAkunDemo() { return []; }

export function pantauSesi(callback, onError = () => {}) {
  cekSiap();
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      sessionStorage.removeItem(KUNCI_SESI);
      callback(null);
      return;
    }
    try {
      const profile = await getDoc(doc(db, 'users', user.uid));
      if (!profile.exists() || !URUTAN_DM.includes(profile.get('peran'))) {
        await signOut(auth);
        sessionStorage.removeItem(KUNCI_SESI);
        callback(null);
        return;
      }
      const sesi = bentukSesi(user, profile.data());
      sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
      callback(sesi);
    } catch (error) {
      onError(error);
    }
  }, onError);
}

export function penggunaSaatIni() {
  cekSiap();
  return auth.currentUser;
}
