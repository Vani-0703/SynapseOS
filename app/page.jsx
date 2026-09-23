"use client";

import { useEffect, useMemo, useState } from "react";

const tabs = ["chat", "documents", "tasks", "system"];

export default function Home() {
  const [tab, setTab] = useState("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [docs, setDocs] = useState([]);
  const [tasks, setTasks] = useState([]);
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

  const pending = useMemo(() => tasks.filter((task) => !task.done).length, [tasks]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setInput("");
    setMessages((items) => [...items, { role: "user", content: text }]);
    setBusy(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          documents: docs.map((doc) => ({
            name: doc.name,
            text: String(doc.text || "").slice(0, 12000)
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed.");

      setMessages((items) => [...items, { role: "assistant", content: data.answer }]);

      if (Array.isArray(data.tasks)) {
        setTasks((items) => [
          ...items,
          ...data.tasks.map((task) => ({
            id: crypto.randomUUID(),
            title: task.title,
            done: false
          }))
        ]);
      }
    } catch (error) {
      setMessages((items) => [
        ...items,
        {
          role: "assistant",
          content: error instanceof Error ? error.message : "Request failed."
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  function addFile(file) {
    if (!/\.(txt|md|csv|json)$/i.test(file.name)) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocs((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          name: file.name,
          text: String(reader.result || "")
        }
      ]);
    };
    reader.readAsText(file);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SYNAPSEOS</div>
          <div className="brand-subtitle">Personal AI operating system</div>
        </div>

        <nav className="nav">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={"nav-button " + (tab === item ? "active" : "")}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          Local workspace · {docs.length} docs · {pending} pending tasks
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <div className="topbar-title">SynapseOS</div>
            <div className="topbar-tab">{tab}</div>
          </div>
          <div className={"status " + (busy ? "working" : "")}>
            {busy ? "PROCESSING" : "READY"}
          </div>
        </header>

        <div className="content">
          {tab === "chat" && (
            <div className="content-column">
              <section className="hero-card">
                <div className="eyebrow">AI WORKSPACE</div>
                <h1>Think with your own knowledge.</h1>
                <p>
                  Upload notes, ask grounded questions, and turn conversations
                  into actionable tasks. Add an OpenAI API key in Vercel for
                  live AI responses.
                </p>
              </section>

              {messages.map((message, index) => (
                <article
                  key={index}
                  className={"message " + (message.role === "user" ? "user" : "assistant")}
                >
                  <div className="message-role">{message.role}</div>
                  <div className="message-content">{message.content}</div>
                </article>
              ))}

              <section className="composer">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      send();
                    }
                  }}
                  rows={4}
                  placeholder="Ask about your documents or describe a task..."
                />
                <div className="composer-actions">
                  <span>Enter to send · Shift+Enter for a new line</span>
                  <button onClick={send} disabled={busy || !input.trim()}>
                    {busy ? "Working…" : "Send"}
                  </button>
                </div>
              </section>
            </div>
          )}

          {tab === "documents" && (
            <div className="content-column">
              <section className="section-heading">
                <h2>Knowledge base</h2>
                <p>Text files are kept in this browser and included in future AI requests.</p>
              </section>

              <label className="upload-zone">
                <strong>Choose a knowledge file</strong>
                <span>.txt · .md · .csv · .json</span>
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) addFile(file);
                    event.target.value = "";
                  }}
                />
              </label>

              <div className="list">
                {docs.map((doc) => (
                  <div className="list-row" key={doc.id}>
                    <div>
                      <strong>{doc.name}</strong>
                      <span>{doc.text.length.toLocaleString()} characters</span>
                    </div>
                    <button
                      className="danger"
                      onClick={() => setDocs((items) => items.filter((item) => item.id !== doc.id))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {!docs.length && <div className="empty">No documents uploaded yet.</div>}
              </div>
            </div>
          )}

          {tab === "tasks" && (
            <div className="content-column">
              <section className="section-heading">
                <h2>Action queue</h2>
                <p>Tasks extracted from your AI conversations are stored locally.</p>
              </section>

              <div className="list">
                {tasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <button
                      className={"checkbox " + (task.done ? "checked" : "")}
                      onClick={() =>
                        setTasks((items) =>
                          items.map((item) =>
                            item.id === task.id ? { ...item, done: !item.done } : item
                          )
                        )
                      }
                      aria-label={task.done ? "Mark task open" : "Complete task"}
                    >
                      {task.done ? "✓" : ""}
                    </button>
                    <span className={task.done ? "task-done" : ""}>{task.title}</span>
                    <button
                      className="danger"
                      onClick={() => setTasks((items) => items.filter((item) => item.id !== task.id))}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {!tasks.length && <div className="empty">No tasks yet.</div>}
              </div>
            </div>
          )}

          {tab === "system" && (
            <div className="content-column">
              <section className="section-heading">
                <h2>System status</h2>
                <p>Current deployment architecture.</p>
              </section>
              <div className="status-card">
                <div><span>Frontend</span><strong>Next.js App Router</strong></div>
                <div><span>Storage</span><strong>Browser localStorage</strong></div>
                <div><span>AI</span><strong>OPENAI_API_KEY</strong></div>
                <div><span>Knowledge</span><strong>Uploaded text attached to AI requests</strong></div>
              </div>
            </div>
          )}
        </div>

        <nav className="mobile-nav">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={tab === item ? "active" : ""}
            >
              {item}
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
