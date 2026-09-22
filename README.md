# SynapseOS

SynapseOS is a personal AI operating system built with Next.js 16.

## Features
- AI chat through a server-side OpenAI API route
- Upload TXT, Markdown, CSV and JSON knowledge files
- Browser-persistent knowledge workspace
- Task extraction into a local action queue
- System/status view
- Responsive control-panel UI

## Run locally
```bash
npm install
npm run dev
```

Create `.env.local`:
```
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5-mini
```

Open http://localhost:3000.

## Vercel
Import this repository as a Next.js project. Vercel detects the framework automatically. Add OPENAI_API_KEY in Project Settings > Environment Variables and redeploy.

Secrets must stay server-side; never commit a real API key.