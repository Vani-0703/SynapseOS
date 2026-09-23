import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const message = String(body?.message || "").trim();
  const documents = Array.isArray(body?.documents) ? body.documents : [];
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "SynapseOS is ready, but OPENAI_API_KEY is not configured in Vercel. Add it under Project Settings → Environment Variables, then redeploy." }, { status: 503 });
  }

  const context = documents.map((d) => "DOCUMENT: " + String(d.name || "untitled") + "
" + String(d.text || "")).join("

").slice(0, 30000);
  const system = "You are SynapseOS, a concise personal AI operating system. Use the supplied document context when relevant. Never invent document facts. If the user asks for tasks, return a normal answer and then a line beginning TASKS: followed by a JSON array of objects with title strings. Otherwise do not include TASKS.";
  const user = "DOCUMENT CONTEXT:
" + (context || "(none)") + "

USER REQUEST:
" + message;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
    body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5-mini", messages: [{role:"system",content:system},{role:"user",content:user}], max_tokens: 900 })
  });
  if (!r.ok) return NextResponse.json({ error: "OpenAI request failed: " + await r.text() }, { status: 502 });
  const data = await r.json();
  const answer = String(data?.choices?.[0]?.message?.content || "").trim();
  let tasks: {title:string}[] = [];
  const marker = answer.indexOf("TASKS:");
  if (marker >= 0) {
    const raw = answer.slice(marker + 6).trim();
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) tasks = parsed.filter(x => x && typeof x.title === "string").slice(0, 10); } catch {}
  }
  return NextResponse.json({ answer: marker >= 0 ? answer.slice(0, marker).trim() : answer, tasks });
}