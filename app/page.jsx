"use client";

import { useEffect, useMemo, useState } from "react";


export default function Home() {
  const [tab, setTab] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setDocs(JSON.parse(localStorage.getItem("synapse-docs") || "[]"));
      setTasks(JSON.parse(localStorage.getItem("synapse-tasks") || "[]"));
      setMessages(JSON.parse(localStorage.getItem("synapse-messages") || "[]"));
    } catch {}
  }, []);
  useEffect(() => localStorage.setItem("synapse-docs", JSON.stringify(docs)), [docs]);
  useEffect(() => localStorage.setItem("synapse-tasks", JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem("synapse-messages", JSON.stringify(messages)), [messages]);

  const pending = useMemo(() => tasks.filter(t => !t.done).length, [tasks]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content: text }]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, documents: docs.map(d => ({ name: d.name, text: d.text.slice(0, 12000) })) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages(m => [...m, { role: "assistant", content: data.answer }]);
      if (Array.isArray(data.tasks)) {
        setTasks(t => [...t, ...data.tasks.map((x) => ({ id: crypto.randomUUID(), title: x.title, done: false }))]);
      }
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: e instanceof Error ? e.message : "Request failed." }]);
    } finally { setBusy(false); }
  }

  function addFile(file) {
    const ok = /\.(txt|md|csv|json)$/i.test(file.name);
    if (!ok) return;
    const reader = new FileReader();
    reader.onload = () => setDocs(d => [...d, { id: crypto.randomUUID(), name: file.name, text: String(reader.result || "") }]);
    reader.readAsText(file);
  }

  return (
    <main className="flex min-h-screen bg-base text-ink-primary">
      <aside className="hidden w-64 shrink-0 border-r border-hairline bg-panel md:flex md:flex-col">
        <div className="border-b border-hairline p-6"><div className="font-mono text-xs tracking-[0.25em] text-signal">SYNAPSEOS</div><div className="mt-1 text-sm text-ink-muted">Personal AI operating system</div></div>
        <nav className="p-3 space-y-1">
          {["chat","documents","tasks","system"].map(x => <button key={x} onClick={()=>setTab(x)} className={"w-full border-l-2 px-4 py-3 text-left text-sm capitalize " + (tab===x ? "border-signal bg-panelRaised" : "border-transparent text-ink-muted hover:bg-panelRaised")}>{x}</button>)}
        </nav>
        <div className="mt-auto border-t border-hairline p-5 text-xs text-ink-faint">Local workspace · {docs.length} docs · {pending} pending tasks</div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-hairline bg-panel px-5 py-4">
          <div className="flex items-center justify-between"><div><div className="text-sm font-medium">SynapseOS</div><div className="font-mono text-[10px] uppercase tracking-wider text-ink-faint">{tab}</div></div><div className="font-mono text-xs text-sage">{busy ? "PROCESSING" : "READY"}</div></div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-8">
          {tab==="chat" && <div className="mx-auto flex max-w-3xl flex-col gap-5">
            <div className="border border-hairline bg-panel p-5"><div className="font-mono text-xs text-knowledge">MULTI-AGENT WORKSPACE</div><h1 className="mt-2 text-2xl">Think with your own knowledge.</h1><p className="mt-2 text-sm leading-6 text-ink-muted">Upload notes, ask grounded questions, or describe work and let the assistant extract actionable tasks. Configure an AI key in Vercel for live model responses.</p></div>
            {messages.map((m,i)=><div key={i} className={"max-w-2xl border p-4 text-sm leading-6 " + (m.role==="user" ? "ml-auto border-hairline bg-panelRaised" : "border-hairline bg-panel")}><div className="mb-1 font-mono text-[10px] uppercase text-ink-faint">{m.role}</div><div className="whitespace-pre-wrap">{m.content}</div></div>)}
            <div className="sticky bottom-0 border border-hairline bg-panel p-3"><textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} rows={3} placeholder="Ask about your documents or describe a task..." className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-ink-faint"/><div className="mt-2 flex justify-end"><button onClick={send} disabled={busy||!input.trim()} className="border border-signal px-4 py-2 text-xs text-signal disabled:opacity-40">{busy?"Working...":"Send"}</button></div></div>
          </div>}

          {tab==="documents" && <div className="mx-auto max-w-3xl"><h2 className="text-xl">Knowledge base</h2><p className="mt-1 text-sm text-ink-muted">Text files are kept in this browser and included in future AI requests.</p><label className="mt-6 flex cursor-pointer flex-col items-center border border-dashed border-hairline p-10 hover:border-signal"><span className="text-sm">Drop is supported via the file picker</span><span className="mt-1 font-mono text-[10px] text-ink-faint">.txt · .md · .csv · .json</span><input type="file" accept=".txt,.md,.csv,.json" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)addFile(f)}}/></label><div className="mt-6 space-y-2">{docs.map(d=><div key={d.id} className="flex items-center justify-between border border-hairline bg-panel p-4"><div><div className="text-sm">{d.name}</div><div className="font-mono text-[10px] text-ink-faint">{d.text.length.toLocaleString()} chars</div></div><button onClick={()=>setDocs(x=>x.filter(y=>y.id!==d.id))} className="text-xs text-wine">Remove</button></div>)}</div></div>}

          {tab==="tasks" && <div className="mx-auto max-w-3xl"><h2 className="text-xl">Action queue</h2><p className="mt-1 text-sm text-ink-muted">Tasks extracted from your conversations are stored locally.</p><div className="mt-6 space-y-2">{tasks.map(t=><div key={t.id} className="flex items-center gap-3 border border-hairline bg-panel p-4"><button onClick={()=>setTasks(x=>x.map(y=>y.id===t.id?{...y,done:!y.done}:y))} className={"h-4 w-4 border " + (t.done?"border-sage bg-sage":"border-hairline")}>{t.done?"✓":""}</button><span className={"flex-1 text-sm "+(t.done?"text-ink-faint line-through":"")}>{t.title}</span><button onClick={()=>setTasks(x=>x.filter(y=>y.id!==t.id))} className="text-xs text-wine">Delete</button></div>)}{!tasks.length&&<div className="border border-hairline p-8 text-center text-sm text-ink-muted">No tasks yet.</div>}</div></div>}

          {tab==="system" && <div className="mx-auto max-w-3xl"><h2 className="text-xl">System status</h2><div className="mt-6 border border-hairline bg-panel">{[["Frontend","Next.js App Router"],["Storage","Browser localStorage"],["AI","Configured through OPENAI_API_KEY"],["Retrieval","Uploaded text is attached to AI requests"]].map(([a,b])=><div key={a} className="flex justify-between border-b border-hairline p-4 last:border-0"><span className="text-sm">{a}</span><span className="font-mono text-xs text-ink-muted">{b}</span></div>)}</div></div>}
        </div>

        <div className="border-t border-hairline bg-panel px-5 py-3 text-center font-mono text-[10px] text-ink-faint md:hidden">
          {["chat","documents","tasks","system"].map(x=><button key={x} onClick={()=>setTab(x)} className={"mx-3 uppercase "+(tab===x?"text-signal":"")}>{x}</button>)}
        </div>
      </section>
    </main>
  );
}