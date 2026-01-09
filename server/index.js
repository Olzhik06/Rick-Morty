import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE = "https://rickandmortyapi.com/api";

function qsFromReq(req) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(req.query)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      p.set(k, String(v));
    }
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function proxy(res, url) {
  const r = await fetch(url);
  const text = await r.text();

  // прокидываем статус и content-type от оригинального ответа
  res.status(r.status);
  res.set("Content-Type", r.headers.get("content-type") || "application/json; charset=utf-8");
  res.send(text);
}

app.get("/api/characters", async (req, res) => {
  try {
    const url = `${BASE}/character${qsFromReq(req)}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

// id может быть "1" или "1,2,3" — это ок для Rick&Morty API
app.get("/api/characters/:id", async (req, res) => {
  try {
    const url = `${BASE}/character/${req.params.id}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.get("/api/episodes", async (req, res) => {
  try {
    const url = `${BASE}/episode${qsFromReq(req)}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.get("/api/episodes/:id", async (req, res) => {
  try {
    const url = `${BASE}/episode/${req.params.id}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.get("/api/locations", async (req, res) => {
  try {
    const url = `${BASE}/location${qsFromReq(req)}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.get("/api/locations/:id", async (req, res) => {
  try {
    const url = `${BASE}/location/${req.params.id}`;
    await proxy(res, url);
  } catch (e) {
    res.status(500).json({ error: "Proxy error", details: String(e) });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
