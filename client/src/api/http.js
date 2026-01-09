const BASE = import.meta.env.VITE_API_BASE_URL;

export async function apiGet(path) {
  const r = await fetch(`${BASE}${path}`);
  const text = await r.text();

  if (!r.ok) {
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    throw { status: r.status, body: parsed ?? text };
  }

  return JSON.parse(text);
}
