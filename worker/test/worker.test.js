import assert from 'node:assert/strict';
import test from 'node:test';
import { exportJWK, exportPKCS8, generateKeyPair, SignJWT } from 'jose';
import worker from '../src/index.js';
import { ACARA_CONTOH, KANDIDAT_TABEL_71 } from '../../src/fixtures/dataAcuan.js';
import { BOBOT_AWAL } from '../../src/shared/constants.js';

test('OPTIONS mengembalikan preflight CORS tanpa kredensial backend', async () => {
  const response = await worker.fetch(new Request('https://api.example.workers.dev/api/submit', { method: 'OPTIONS' }), {});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Methods'), 'GET, POST, OPTIONS');
});

test('endpoint menolak method selain POST', async () => {
  const response = await worker.fetch(new Request('https://api.example.workers.dev/api/submit'), {});
  assert.equal(response.status, 405);
});

test('health endpoint mengonfirmasi Worker aktif tanpa membuka secret', async () => {
  const response = await worker.fetch(new Request('https://api.example.workers.dev/health'), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'dina-becik-api' });
});

test('submit menolak request tanpa Firebase ID token', async () => {
  const response = await worker.fetch(new Request('https://api.example.workers.dev/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ acaraId: 'acara-demo-2027' }),
  }), { FIREBASE_PROJECT_ID: 'dinabecik-e6096' });
  assert.equal(response.status, 401);
  assert.equal((await response.json()).error, 'Silakan login terlebih dahulu.');
});

test('T1/T4/T7/T8: auth, gerbang tiga DM, hasil bersama, dan penilaian terkunci', async () => {
  const projectId = 'dinabecik-e6096';
  const acaraId = 'worker-integration-test';
  const { privateKey, publicKey } = await generateKeyPair('RS256', { extractable: true });
  const jwk = await exportJWK(publicKey);
  jwk.kid = 'worker-test-key';
  jwk.alg = 'RS256';
  jwk.use = 'sig';
  const servicePrivateKey = await exportPKCS8(privateKey);
  const originalFetch = globalThis.fetch;
  const documents = new Map();

  const resource = (path) => `projects/${projectId}/databases/(default)/documents/${path}`;
  const toFirestoreValue = (value) => {
    if (value === null) return { nullValue: null };
    if (typeof value === 'string') return { stringValue: value };
    if (typeof value === 'boolean') return { booleanValue: value };
    if (typeof value === 'number') return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, child]) => [key, toFirestoreValue(child)])) } };
  };
  const fromFirestoreValue = (value) => {
    if ('nullValue' in value) return null;
    if ('stringValue' in value) return value.stringValue;
    if ('booleanValue' in value) return value.booleanValue;
    if ('integerValue' in value) return Number(value.integerValue);
    if ('doubleValue' in value) return value.doubleValue;
    if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(fromFirestoreValue);
    if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, child]) => [key, fromFirestoreValue(child)]));
    return value.timestampValue ?? null;
  };
  const fromFields = (fields) => Object.fromEntries(Object.entries(fields ?? {}).map(([key, value]) => [key, fromFirestoreValue(value)]));
  const jsonResponse = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });

  for (const dm of ['sesepuh', 'orangtua', 'wo']) {
    documents.set(resource(`users/uid-${dm}`), { nama: dm, peran: dm });
    documents.set(resource(`acara/${acaraId}/bobot/uid-${dm}`), { user_id: `uid-${dm}`, bobot: BOBOT_AWAL[dm] });
  }
  documents.set(resource(`acara/${acaraId}`), { ...ACARA_CONTOH, id: acaraId, status: 'Draft' });
  for (const candidate of KANDIDAT_TABEL_71) {
    documents.set(resource(`acara/${acaraId}/kandidat/${candidate.kode}`), {
      kode: candidate.kode,
      tanggal: candidate.tanggal,
      hari: candidate.hari,
      pasaran: candidate.pasaran,
      neptu_weton_h: candidate.neptuWetonH,
      skor_weton: candidate.skorWeton,
      biaya: candidate.biaya,
      skor_gedung: candidate.gedung,
      skor_cuaca: candidate.cuaca,
      skor_tamu: candidate.tamu,
    });
  }

  const firestorePaths = [];

  globalThis.fetch = async (input, init = {}) => {
    const url = new URL(input);
    if (url.hostname === 'www.googleapis.com') return jsonResponse({ keys: [jwk] });
    if (url.hostname === 'oauth2.googleapis.com') return jsonResponse({ access_token: 'worker-test-token', expires_in: 3600 });
    if (url.hostname !== 'firestore.googleapis.com') throw new Error(`Unexpected test URL: ${url}`);
    const body = init.body ? JSON.parse(init.body) : {};
    firestorePaths.push(url.pathname);

    // Firestore REST memakai endpoint action bertitik dua (bukan slash).
    if (url.pathname.endsWith('/documents:beginTransaction')) return jsonResponse({ transaction: 'transaction-test' });
    if (url.pathname.endsWith('/documents:rollback')) return jsonResponse({});
    if (url.pathname.endsWith('/documents:batchGet')) {
      return jsonResponse(body.documents.map((name) => documents.has(name)
        ? { found: { name, fields: Object.fromEntries(Object.entries(documents.get(name)).map(([key, value]) => [key, toFirestoreValue(value)])) } }
        : { missing: name }));
    }
    if (url.pathname.endsWith(':runQuery')) {
      const parent = url.pathname.split('/documents/')[1].replace(/:runQuery$/, '');
      const collectionId = body.structuredQuery.from[0].collectionId;
      const prefix = `${resource(`${parent}/${collectionId}`)}/`;
      return jsonResponse([...documents.entries()]
        .filter(([name]) => name.startsWith(prefix))
        .map(([name, data]) => ({ document: { name, fields: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)])) } })));
    }
    if (url.pathname.endsWith('/documents:commit')) {
      for (const write of body.writes) {
        const name = write.update.name;
        const exists = documents.has(name);
        if (write.currentDocument?.exists === false && exists) return jsonResponse({ error: { status: 'ABORTED' } }, 409);
        const incoming = fromFields(write.update.fields);
        let data = incoming;
        if (write.updateMask?.fieldPaths) {
          data = { ...(documents.get(name) ?? {}) };
          for (const field of write.updateMask.fieldPaths) data[field] = incoming[field];
        }
        documents.set(name, data);
      }
      return jsonResponse({ commitTime: new Date().toISOString() });
    }
    throw new Error(`Unexpected Firestore request: ${url.pathname}`);
  };

  async function token(uid, audience = projectId) {
    const now = Math.floor(Date.now() / 1000);
    return new SignJWT({ user_id: uid, firebase: { sign_in_provider: 'password' } })
      .setProtectedHeader({ alg: 'RS256', kid: jwk.kid })
      .setIssuer(`https://securetoken.google.com/${projectId}`)
      .setAudience(audience)
      .setSubject(uid)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(privateKey);
  }

  async function post(path, uid, audience = projectId) {
    const idToken = await token(uid, audience);
    return worker.fetch(new Request(`https://api.example.workers.dev/api/${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ acaraId }),
    }), {
      FIREBASE_PROJECT_ID: projectId,
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ client_email: 'worker-test@dinabecik-e6096.iam.gserviceaccount.com', private_key: servicePrivateKey }),
    });
  }

  try {
    const wrongAudience = await post('start', 'uid-sesepuh', 'wrong-project');
    assert.equal(wrongAudience.status, 401, 'T1: token untuk project lain ditolak');

    const notSesepuh = await post('start', 'uid-wo');
    assert.equal(notSesepuh.status, 403, 'peran selain Sesepuh tidak dapat memulai');
    const start = await post('start', 'uid-sesepuh');
    assert.equal(start.status, 200, await start.text());
    assert.equal(documents.get(resource(`acara/${acaraId}`)).status, 'Penilaian');

    const sesepuh = await post('submit', 'uid-sesepuh');
    assert.equal(sesepuh.status, 200);
    const orangtua = await post('submit', 'uid-orangtua');
    assert.equal(orangtua.status, 200);
    assert.equal(documents.get(resource(`acara/${acaraId}`)).status, 'Penilaian', 'T4: voting tetap terkunci setelah dua kiriman');
    assert.equal([...documents.keys()].filter((name) => name.includes(`/acara/${acaraId}/voting_hasil/`)).length, 0);

    const wo = await post('submit', 'uid-wo');
    assert.equal(wo.status, 200);
    assert.equal(documents.get(resource(`acara/${acaraId}`)).status, 'Selesai');
    const results = [...documents.entries()]
      .filter(([name]) => name.startsWith(`${resource(`acara/${acaraId}/voting_hasil`)}/`))
      .map(([name, data]) => ({ id: name.split('/').at(-1), ...data }))
      .sort((a, b) => a.ranking_final - b.ranking_final);
    assert.equal(results.length, KANDIDAT_TABEL_71.length);
    assert.equal(results[0].id, 'E', 'T7: hasil final memakai Weighted Borda yang sama untuk semua pembaca');
    assert.equal(results[0].total_poin, 35);

    const resend = await post('submit', 'uid-sesepuh');
    assert.equal(resend.status, 409, 'T8: kiriman yang sudah terkunci ditolak');

    // Regresi: Firestore REST memakai endpoint action bertitik dua.
    // Bug sebelumnya membentuk .../documents/commit (slash) sehingga
    // transaksi akan gagal terhadap Firestore sungguhan.
    const aksi = firestorePaths.filter((p) => /\/documents[:/](beginTransaction|batchGet|commit|rollback)$/.test(p));
    assert.ok(aksi.length > 0, 'harus ada panggilan transaksi Firestore');
    for (const path of aksi) {
      assert.match(
        path,
        /\/documents:(beginTransaction|batchGet|commit|rollback)$/,
        `endpoint Firestore harus memakai titik dua, bukan slash: ${path}`
      );
    }
    assert.ok(
      firestorePaths.some((p) => p.endsWith('/documents:commit')),
      'commit harus memakai /documents:commit'
    );
    assert.ok(
      firestorePaths.some((p) => p.endsWith('/documents:batchGet')),
      'batchGet harus memakai /documents:batchGet'
    );
    assert.ok(
      firestorePaths.some((p) => p.endsWith('/documents:beginTransaction')),
      'beginTransaction harus memakai /documents:beginTransaction'
    );
    assert.ok(
      !firestorePaths.some((p) => /\/documents\/(beginTransaction|batchGet|commit|rollback)$/.test(p)),
      'tidak boleh ada endpoint action berbentuk slash'
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
