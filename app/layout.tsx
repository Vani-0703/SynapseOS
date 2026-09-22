import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"SynapseOS — your personal AI operating system", description:"Upload documents, ask questions grounded in your own knowledge, and let a small team of agents turn conversation into a task list." };
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet"/></head><body>{children}</body></html>;
}