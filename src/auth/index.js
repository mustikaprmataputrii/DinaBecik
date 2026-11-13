import * as firebaseAuth from './firebaseAuth.js';
import * as mockAuth from './mockAuth.js';

const gunakanFirebase = Boolean(import.meta.env?.VITE_FIREBASE_API_KEY && import.meta.env?.VITE_FIREBASE_PROJECT_ID);
const authAdapter = gunakanFirebase ? firebaseAuth : mockAuth;

export const login = authAdapter.login;
export const logout = authAdapter.logout;
export const sesiAktif = authAdapter.sesiAktif;
export const daftarAkunDemo = authAdapter.daftarAkunDemo;
export const dmDariPeran = authAdapter.dmDariPeran;
export const pantauSesi = firebaseAuth.pantauSesi;
export const penggunaSaatIni = firebaseAuth.penggunaSaatIni;
