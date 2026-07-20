const BLOB_PATHNAME = 'feedback/juegos-aire.json';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.end(JSON.stringify(body));
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function normalizeEntry(input) {
  const message = String(input.message || '').trim().slice(0, 4000);
  return {
    id: String(input.id || makeId()).slice(0, 120),
    created_at: input.created_at || new Date().toISOString(),
    app: String(input.app || 'sin-app').slice(0, 80),
    type: String(input.type || 'otro').slice(0, 80),
    role: String(input.role || '').slice(0, 80),
    sessionTime: String(input.sessionTime || '').slice(0, 80),
    message,
    contact: String(input.contact || '').trim().slice(0, 240),
    page: String(input.page || '').slice(0, 500),
    userAgent: String(input.userAgent || '').slice(0, 500),
    elapsedMs: Number.isFinite(Number(input.elapsedMs)) ? Number(input.elapsedMs) : null,
    version: String(input.version || 'juegos-aire-feedback-v1').slice(0, 80),
    status: String(input.status || 'pendiente').slice(0, 40),
    reviewed_at: input.reviewed_at || null,
  };
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function readEntries(blob) {
  const { list } = blob;
  const { blobs } = await list({ prefix: BLOB_PATHNAME });
  if (!blobs.length) return [];
  const separator = blobs[0].downloadUrl.includes('?') ? '&' : '?';
  const response = await fetch(`${blobs[0].downloadUrl}${separator}ts=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) return [];
  const data = await response.json().catch(() => []);
  return Array.isArray(data) ? data : [];
}

async function writeEntries(blob, entries) {
  const { put } = blob;
  await put(BLOB_PATHNAME, JSON.stringify(entries, null, 2), {
    access: 'public',
    contentType: 'application/json',
    cacheControlMaxAge: 0,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return json(res, 200, { ok: true });

  let blob;
  try {
    blob = await import('@vercel/blob');
  } catch (error) {
    return json(res, 500, { ok: false, error: 'Blob dependency unavailable', detail: String(error) });
  }

  if (req.method === 'GET') {
    try {
      const entries = await readEntries(blob);
      return json(res, 200, entries.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))));
    } catch (error) {
      return json(res, 500, { ok: false, error: String(error) });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await readBody(req);
      const entry = normalizeEntry(body);
      if (!entry.message) return json(res, 400, { ok: false, error: 'Mensaje vacío' });

      const prev = await readEntries(blob);
      const exists = prev.some((item) => item.id === entry.id);
      const next = exists ? prev : [entry, ...prev].slice(0, 1000);
      if (!exists) await writeEntries(blob, next);
      return json(res, 200, { ok: true, total: next.length, storage: 'vercel-blob' });
    } catch (error) {
      return json(res, 500, { ok: false, error: String(error) });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = await readBody(req);
      const id = String(body.id || '').trim();
      if (!id) return json(res, 400, { ok: false, error: 'Falta id' });

      const prev = await readEntries(blob);
      let updated = null;
      const next = prev.map((item) => {
        if (item.id !== id) return item;
        updated = {
          ...item,
          status: String(body.status || 'revisado').slice(0, 40),
          reviewed_at: body.reviewed_at || new Date().toISOString(),
        };
        return updated;
      });

      if (!updated) return json(res, 404, { ok: false, error: 'Feedback no encontrado' });
      await writeEntries(blob, next);
      return json(res, 200, { ok: true, item: updated, total: next.length });
    } catch (error) {
      return json(res, 500, { ok: false, error: String(error) });
    }
  }

  return json(res, 405, { ok: false, error: 'Method not allowed' });
}
