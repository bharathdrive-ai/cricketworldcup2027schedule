// CAG agent for the schedule: every question is answered from CWC2027_Schedule_Reference.pdf,
// which is sent to Gemini in full as the first part of each request (Cache-Augmented Generation).
// The document always comes first and never changes, so Gemini's implicit caching reuses it.
// Env: GOOGLE_API_KEY (required), GEMINI_MODELS (optional, comma-separated fallback list).
const fs = require("fs");
const path = require("path");

const PDF_NAME = "CWC2027_Schedule_Reference.pdf";
const MODELS = (process.env.GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-3.6-flash").split(",").map(s => s.trim()).filter(Boolean);
const ORIGINS = ["https://bharathdrive-ai.github.io", "https://cricketworldcup2027schedule.vercel.app"];
const MAX_QUESTION = 500;     // characters
const HISTORY_TURNS = 6;      // earlier messages sent along for follow-up questions
const RATE = { windowMs: 60_000, max: 8 };  // per IP, per warm instance (best effort)

const SYSTEM_PROMPT = `You are the schedule assistant for the ICC Men's Cricket World Cup 2027 website.
The attached PDF, "${PDF_NAME}", is your only source of truth.
Rules:
- Answer only from the PDF: fixtures, dates, venues, stadiums, capacities, stages, groups, seeds and start times.
- Be complete: before answering, scan every row of the full fixture list (section 5) and the team's own table (section 6).
  Super 7 rows show seeded teams as "Team (seed)", e.g. "India (A1) v Pakistan (A3)", so a pair of teams can meet more than once.
- Mention match numbers (e.g. "Match 9") and give dates as e.g. "Sun 10 Oct 2027". Times are local SAST (UTC+2).
- Placeholder sides (Qualifier A/B, Super Series 1–3, Super 7 1st–4th, Winner SF1/SF2) are not yet decided; say so when relevant.
- For anything the PDF does not cover (results, players, tickets, weather, predictions, other tournaments), say exactly:
  "I couldn't find that in the schedule." You may add one short line on what the schedule does cover.
- Be concise: a short sentence, a bullet list, or a small list of matches. Use **bold** sparingly. No tables.
- Cite once, at the very end only (never after each line), like [${PDF_NAME}, p. 3], naming the page(s) you used.`;

let pdfB64 = null;
function pdf() {
  if (!pdfB64) pdfB64 = fs.readFileSync(path.join(process.cwd(), PDF_NAME)).toString("base64");
  return pdfB64;
}

const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < RATE.windowMs);
  list.push(now); hits.set(ip, list);
  return list.length > RATE.max;
}

function cors(req, res) {
  const o = req.headers.origin;
  if (o && (ORIGINS.includes(o) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o))) {
    res.setHeader("Access-Control-Allow-Origin", o);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

async function askGemini(key, question, history) {
  const today = new Date().toISOString().slice(0, 10);
  const contents = [
    { role: "user", parts: [{ inlineData: { mimeType: "application/pdf", data: pdf() } }, { text: "This is the schedule document. Answer my questions from it." }] },
    { role: "model", parts: [{ text: "Understood. I will answer from the schedule document only." }] },
    ...history.map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
    { role: "user", parts: [{ text: `(Today's date: ${today}.)\n${question}` }] },
  ];
  const body = JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, generationConfig: { temperature: 0, maxOutputTokens: 1024 } });
  let last = null;
  for (const model of MODELS) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body,
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
      const u = j.usageMetadata || {};
      return { text: text || "I couldn't find that in the schedule.", model,
        usage: { prompt: u.promptTokenCount || 0, cached: u.cachedContentTokenCount || 0, output: u.candidatesTokenCount || 0 } };
    }
    last = { status: r.status, message: j.error?.message || r.statusText };
    if (![404, 429, 500, 503].includes(r.status)) break; // try the next model only for these
  }
  const busy = last && last.status === 429;
  const err = new Error(busy ? "The assistant is busy (rate limit). Please try again in a minute." : "The assistant could not answer right now.");
  err.status = busy ? 429 : 502;
  throw err;
}

module.exports = async (req, res) => {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method === "GET") return res.status(200).json({ ok: true, source: PDF_NAME, key_configured: !!process.env.GOOGLE_API_KEY, models: MODELS });
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST." });

  const key = process.env.GOOGLE_API_KEY;
  if (!key) return res.status(503).json({ error: "The assistant is not configured yet (GOOGLE_API_KEY is missing)." });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "Too many questions in a minute. Please wait a moment." });

  let b = req.body;
  if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
  const question = String(b?.question || "").trim().slice(0, MAX_QUESTION);
  if (!question) return res.status(400).json({ error: "Please type a question." });
  const history = (Array.isArray(b?.history) ? b.history : [])
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-HISTORY_TURNS).map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const t0 = Date.now();
  try {
    const a = await askGemini(key, question, history);
    res.status(200).json({ ...a, seconds: +((Date.now() - t0) / 1000).toFixed(1), source: PDF_NAME });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};
