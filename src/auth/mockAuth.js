import { DECISION_MAKERS } from '../shared/constants.js';

const KUNCI_SESI = 'dina-becik-sesi';
const AKUN_DEMO = [
  { username: 'sesepuh', password: 'sesepuh123', userId: 'u-sesepuh', peran: 'sesepuh' },
  { username: 'orangtua', password: 'orangtua123', userId: 'u-orangtua', peran: 'orangtua' },
  { username: 'wo', password: 'wo123', userId: 'u-wo', peran: 'wo' },
];

export function dmDariPeran(peran) {
  return DECISION_MAKERS.find((item) => item.key === peran) ?? null;
}

export async function login(username, password) {
  const akun = AKUN_DEMO.find((item) => item.username === String(username).trim().toLowerCase() && item.password === password);
  if (!akun) throw new Error('Username atau password salah.');
  const dm = dmDariPeran(akun.peran);
  const sesi = { userId: akun.userId, username: akun.username, peran: akun.peran, nama: dm.nama, bobotSuara: dm.bobotSuara };
  sessionStorage.setItem(KUNCI_SESI, JSON.stringify(sesi));
  return sesi;
}

export async function logout() { sessionStorage.removeItem(KUNCI_SESI); }
export function sesiAktif() {
  try { return JSON.parse(sessionStorage.getItem(KUNCI_SESI)) ?? null; } catch { return null; }
}
export function daftarAkunDemo() {
  return AKUN_DEMO.map(({ username, password, peran }) => ({ username, password, peran }));
}
