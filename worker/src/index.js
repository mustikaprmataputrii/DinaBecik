import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import { hitungWP } from '../../src/shared/wp.js';
import { hitungBorda, keBarisVotingHasil } from '../../src/shared/borda.js';
import { BOBOT_AWAL, URUTAN_DM } from '../../src/shared/constants.js';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const FIREBASE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));
let cachedAccessToken = null;
let cachedTokenExpiry = 0;

class HttpError extends Error {
  constructor(status, message, retryable = false) {
    super(message);
    this.status = status;
    this.retryable = retryable;
  }
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(body, status = 200, origin = '') {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json; charset=utf-8' },
  });
}

function firestoreBase(env) {
  if (!env.FIREBASE_PROJECT_ID) throw new HttpError(500, 'Worker belum dikonfigurasi.');
  return `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
}

async function idDariRequest(request, env) {
  const header = request.headers.get('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new HttpError(401, 'Silakan login terlebih dahulu.');
  try {
    const { payload } = await jwtVerify(token, FIREBASE_JWKS, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
    });
    if (typeof payload.sub !== 'string' || !payload.sub) throw new Error('Missing subject');
    return payload.sub;
  } catch {
    throw new HttpError(401, 'Sesi login tidak valid atau kedaluwarsa.');
  }
}

async function tokenAdmin(env) {
  if (cachedAccessToken && Date.now() < cachedTokenExpiry - 60_000) return cachedAccessToken;
  let account;
  try { account = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT ?? ''); }
  catch { throw new HttpError(500, 'Secret service account Worker belum diatur.'); }
  if (!account.client_email || !account.private_key) throw new HttpError(500, 'Secret service account Worker tidak lengkap.');
  const key = await importPKCS8(account.private_key.replaceAll('\\n', '\n'), 'RS256');
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/datastore' })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(account.client_email)
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new HttpError(502, 'Worker gagal memperoleh akses Firestore.');
  cachedAccessToken = data.access_token;
  cachedTokenExpiry = Date.now() + Number(data.expires_in ?? 3600) * 1000;
  return cachedAccessToken;
}

function resource(env, path) {
  return `projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`;
}
function fromValue(value) {
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return Number(value.doubleValue);
  if ('timestampValue' in value) return value.timestampValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromValue);
  if ('mapValue' in value) return fromFields(value.mapValue.fields ?? {});
  return null;
}

function fromFields(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, fromValue(value)]));
}

function toValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toValue) } };
  if (typeof value === 'object') return { mapValue: { fields: toFields(value) } };
  throw new Error(`Tipe Firestore tidak didukung: ${typeof value}`);
}

function toFields(data) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined).map(([key, value]) => [key, toValue(value)]));
}

async function firestoreRequest(env, path, { method = 'GET', body, transaction } = {}) {
  const token = await tokenAdmin(env);
  let url;
  if (path.startsWith(`projects/${env.FIREBASE_PROJECT_ID}/databases/`)) {
    url = new URL(`https://firestore.googleapis.com/v1/${path}`);
  } else if (path.startsWith(':')) {
    // Firestore action endpoints are suffixed directly to /documents.
    url = new URL(`${firestoreBase(env)}${path}`);
  } else {
    url = new URL(`${firestoreBase(env)}/${path}`);
  }
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  if (!response.ok) {
    if (response.status === 409 || text.includes('ABORTED')) throw new HttpError(409, 'Transaksi bentrok; silakan coba lagi.', true);
    if (response.status === 404) return null;
    throw new HttpError(response.status >= 500 ? 502 : response.status, 'Permintaan Firestore gagal.');
  }
  if (!text) return {};
  try { return JSON.parse(text); }
  catch { return text.split('\n').filter(Boolean).map((line) => JSON.parse(line)); }
}

async function startTransaction(env) {
  const result = await firestoreRequest(env, firestoreAction('beginTransaction'), { method: 'POST', body: { options: { readWrite: {} } } });
  return result.transaction;
}

function firestoreAction(action) {
  return `:${action}`;
}

async function readDocuments(env, paths, transaction) {
  const response = await firestoreRequest(env, firestoreAction('batchGet'), {
    method: 'POST',
    body: { documents: paths.map((path) => resource(env, path)), transaction },
  });
  const rows = Array.isArray(response) ? response : [response];
  return new Map(rows.map((row) => {
    const value = row.found;
    return [value?.name ?? row.missing, value ? { name: value.name, data: fromFields(value.fields) } : null];
  }));
}

async function readCollection(env, parent, collectionId, transaction) {
  const response = await firestoreRequest(env, `${parent}:runQuery`, {
    method: 'POST',
    transaction,
    body: { structuredQuery: { from: [{ collectionId }] }, transaction },
  });
  const rows = Array.isArray(response) ? response : [response];
  return rows.filter((row) => row.document).map((row) => ({
    name: row.document.name,
    id: row.document.name.split('/').at(-1),
    data: fromFields(row.document.fields),
  }));
}

async function commit(env, transaction, writes) {
  return firestoreRequest(env, firestoreAction('commit'), { method: 'POST', body: { writes, transaction } });
}

function updateWrite(name, data, mustNotExist = false, fieldPaths) {
  return {
    update: { name, fields: toFields(data) },
    ...(fieldPaths ? { updateMask: { fieldPaths } } : {}),
    ...(mustNotExist ? { currentDocument: { exists: false } } : {}),
  };
}

async function rollback(env, transaction) {
  try { await firestoreRequest(env, firestoreAction('rollback'), { method: 'POST', body: { transaction } }); } catch {}
}

function codes(data, id) { return data.kode ?? id; }
function normalizeCandidate(item) {
  const d = item.data;
  return {
    kode: codes(d, item.id),
    weton: d.skor_weton ?? d.skorWeton,
    biaya: d.biaya,
    gedung: d.skor_gedung ?? d.gedung,
    cuaca: d.skor_cuaca ?? d.cuaca,
    tamu: d.skor_tamu ?? d.tamu,
  };
}

async function withTransaction(env, action, attempts = 4) {
  for (let count = 0; count < attempts; count++) {
    const transaction = await startTransaction(env);
    try { return await action(transaction); }
    catch (error) {
      await rollback(env, transaction);
      if (error instanceof HttpError && error.retryable && count < attempts - 1) continue;
      throw error;
    }
  }
  throw new HttpError(409, 'Transaksi gagal setelah dicoba beberapa kali.');
}

async function mulaiPenilaian(env, uid, acaraId) {
  return withTransaction(env, async (transaction) => {
    const profiles = await readDocuments(env, [`users/${uid}`], transaction);
    const events = await readDocuments(env, [`acara/${acaraId}`], transaction);
    const profile = profiles.get(resource(env, `users/${uid}`))?.data;
    const event = events.get(resource(env, `acara/${acaraId}`));
    if (!profile || profile.peran !== 'sesepuh') throw new HttpError(403, 'Hanya Sesepuh yang dapat memulai penilaian.');
    if (!event) throw new HttpError(404, 'Acara tidak ditemukan.');
    if (event.data.status !== 'Draft') throw new HttpError(409, 'Acara bukan berstatus Draft.');
    const candidates = await readCollection(env, event.name, 'kandidat', transaction);
    if (candidates.length < 2) throw new HttpError(409, 'Minimal dua kandidat diperlukan.');
    await commit(env, transaction, [updateWrite(event.name, { status: 'Penilaian', mulai_penilaian_pada: new Date().toISOString() }, false, ['status', 'mulai_penilaian_pada'])]);
    return { status: 'Penilaian' };
  });
}

async function finalisasiVoting(env, acaraId) {
  return withTransaction(env, async (transaction) => {
    const path = `acara/${acaraId}`;
    const events = await readDocuments(env, [path], transaction);
    const assessments = await readCollection(env, resource(env, path), 'penilaian', transaction);
    const results = await readCollection(env, resource(env, path), 'voting_hasil', transaction);
    const event = events.get(resource(env, path));
    if (!event) throw new HttpError(404, 'Acara tidak ditemukan.');
    if (results.length) return { status: 'Selesai' };
    const byRole = new Map();
    for (const item of assessments) {
      if (item.data.status_kirim !== true || !URUTAN_DM.includes(item.data.peran)) continue;
      if (byRole.has(item.data.peran)) throw new HttpError(409, `Penilaian peran ${item.data.peran} duplikat.`);
      byRole.set(item.data.peran, item.data.hasil);
    }
    if (!URUTAN_DM.every((role) => byRole.has(role))) return { status: event.data.status };
    const rankings = Object.fromEntries(URUTAN_DM.map((role) => [role, Object.fromEntries(byRole.get(role).map((row) => [row.kode, row.ranking]))]));
    const result = hitungBorda(rankings);
    const detail = new Map(result.rincian.map((item) => [item.kode, item]));
    const timestamp = new Date().toISOString();
    const writes = keBarisVotingHasil(result).map((row) => {
      const info = detail.get(row.kandidat_kode);
      return updateWrite(`${event.name}/voting_hasil/${encodeURIComponent(row.kandidat_kode)}`, {
        ...row,
        ranking_sesepuh: info.rankingPerDm.sesepuh,
        ranking_orangtua: info.rankingPerDm.orangtua,
        ranking_wo: info.rankingPerDm.wo,
        seri: info.seri,
        dihitung_pada: timestamp,
      }, true);
    });
    writes.push(updateWrite(event.name, { status: 'Selesai', selesai_pada: timestamp }, false, ['status', 'selesai_pada']));
    await commit(env, transaction, writes);
    return { status: 'Selesai', hasil: result };
  });
}

async function submitPenilaian(env, uid, acaraId) {
  const result = await withTransaction(env, async (transaction) => {
    const eventPath = `acara/${acaraId}`;
    const profilePath = `users/${uid}`;
    const ownPath = `${eventPath}/penilaian/${uid}`;
    const bobotPath = `${eventPath}/bobot/${uid}`;
    const profiles = await readDocuments(env, [profilePath], transaction);
    const events = await readDocuments(env, [eventPath], transaction);
    const ownDocuments = await readDocuments(env, [ownPath], transaction);
    const bobotDocuments = await readDocuments(env, [bobotPath], transaction);
    const candidates = await readCollection(env, resource(env, eventPath), 'kandidat', transaction);
    const assessments = await readCollection(env, resource(env, eventPath), 'penilaian', transaction);
    const results = await readCollection(env, resource(env, eventPath), 'voting_hasil', transaction);
    const profile = profiles.get(resource(env, profilePath))?.data;
    const event = events.get(resource(env, eventPath));
    const own = ownDocuments.get(resource(env, ownPath));
    const bobotDoc = bobotDocuments.get(resource(env, bobotPath));
    if (!profile || !URUTAN_DM.includes(profile.peran)) throw new HttpError(403, 'Profil decision maker tidak valid.');
    if (!event) throw new HttpError(404, 'Acara tidak ditemukan.');
    if (own?.data.status_kirim === true) throw new HttpError(409, 'Penilaian sudah dikirim dan terkunci.');
    if (event.data.status !== 'Penilaian') throw new HttpError(409, 'Acara tidak sedang menerima penilaian.');
    if (candidates.length === 0) throw new HttpError(409, 'Belum ada kandidat.');
    if (results.length) throw new HttpError(409, 'Hasil voting sudah final.');
    const bobot = bobotDoc?.data.bobot ?? BOBOT_AWAL[profile.peran];
    const wp = hitungWP(candidates.map(normalizeCandidate), bobot);
    const assessmentWrites = [updateWrite(resource(env, ownPath), {
      user_id: uid,
      peran: profile.peran,
      status_kirim: true,
      hasil: wp.hasil,
      total_s: wp.totalS,
      waktu_kirim: new Date().toISOString(),
    }, !own)];

    const byRole = new Map();
    for (const item of assessments) {
      if (item.id === uid || item.data.status_kirim !== true || !URUTAN_DM.includes(item.data.peran)) continue;
      if (byRole.has(item.data.peran)) throw new HttpError(409, `Penilaian peran ${item.data.peran} duplikat.`);
      byRole.set(item.data.peran, item.data.hasil);
    }
    byRole.set(profile.peran, wp.hasil);
    if (URUTAN_DM.every((role) => byRole.has(role))) {
      assessmentWrites.push(updateWrite(event.name, { status: 'Voting', voting_dimulai_pada: new Date().toISOString() }, false, ['status', 'voting_dimulai_pada']));
    }
    await commit(env, transaction, assessmentWrites);
    return { ...wp, statusKirim: true, semuaTerkirim: URUTAN_DM.every((role) => byRole.has(role)) };
  });

  if (result.semuaTerkirim) {
    const { semuaTerkirim, ...response } = result;
    await finalisasiVoting(env, acaraId);
    return response;
  }
  const { semuaTerkirim, ...response } = result;
  return response;
}

function cekAcaraId(data) {
  const id = String(data?.acaraId ?? '').trim();
  if (!id || id.includes('/') || id === '.' || id === '..') throw new HttpError(400, 'acaraId tidak valid.');
  return id;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') {
      return json({ status: 'ok', service: 'dina-becik-api' }, 200, origin);
    }
    if (request.method !== 'POST') return json({ error: 'Method tidak didukung.' }, 405, origin);
    try {
      const uid = await idDariRequest(request, env);
      const body = await request.json();
      const acaraId = cekAcaraId(body);
      let result;
      if (new URL(request.url).pathname === '/api/start') result = await mulaiPenilaian(env, uid, acaraId);
      else if (new URL(request.url).pathname === '/api/submit') result = await submitPenilaian(env, uid, acaraId);
      else if (new URL(request.url).pathname === '/api/finalize') {
        const profile = await readDocuments(env, [`users/${uid}`]);
        const data = profile.get(resource(env, `users/${uid}`))?.data;
        if (!data || !URUTAN_DM.includes(data.peran)) throw new HttpError(403, 'Profil decision maker tidak valid.');
        result = await finalisasiVoting(env, acaraId);
      } else return json({ error: 'Endpoint tidak ditemukan.' }, 404, origin);
      return json(result, 200, origin);
    } catch (error) {
      const status = error instanceof HttpError ? error.status : 500;
      return json({ error: error instanceof HttpError ? error.message : 'Terjadi kesalahan backend.' }, status, origin);
    }
  },
};
