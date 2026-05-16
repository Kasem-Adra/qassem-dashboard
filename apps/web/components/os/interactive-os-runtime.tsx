"use client"

import { useEffect, useMemo, useState } from "react"

const commands = [
  { id: "ai", label: "Open AI Assistant", hint: "Streaming generation and workspace context" },
  { id: "theme", label: "Open Theme Studio", hint: "Live tokens, glow, glass, and motion" },
  { id: "realtime", label: "Open Realtime Presence", hint: "Durable Objects collaboration state" },
  { id: "media", label: "Open Media Library", hint: "R2 assets and semantic tagging" },
]

export function InteractiveOSRuntime() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const filtered = useMemo(() => {
    return commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase()))
  }, [query])

  return (
    <section className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl flex items-center justify-between">
          <div className="font-black tracking-tight">Qassem AI OS / Interactive Runtime</div>
          <button onClick={() => setOpen(true)} className="rounded-2xl bg-emerald-300 px-4 py-2 font-black text-slate-950">CMD K</button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/15 via-cyan-300/10 to-white/[0.03] p-6">
            <RuntimeWindow className="left-8 top-8" title="Command Center" body="Universal keyboard navigation and AI commands." />
            <RuntimeWindow className="right-8 top-24" title="Floating AI Assistant" body="Streaming interface with contextual memory." />
            <RuntimeWindow className="left-20 bottom-10" title="Live Theme Studio" body="Realtime cinematic token editing." />
            <RuntimeWindow className="right-12 bottom-16" title="Realtime Presence" body="Durable Objects room and CRDT contracts." />
          </div>
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6">
            <div className="text-5xl font-black tracking-tighter">Phase 3</div>
            <p className="mt-3 text-slate-300">Interactive AI OS shell with visible workspace surfaces.</p>
          </aside>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 p-8 pt-24 backdrop-blur-xl" onClick={() => setOpen(false)}>
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/15 bg-slate-950 p-4" onClick={(e) => e.stopPropagation()}>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search commands or ask AI..." className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-xl outline-none" />
            <div className="mt-3 grid gap-2">
              {filtered.map((command) => <div key={command.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><b>{command.label}</b><p className="text-sm text-slate-400">{command.hint}</p></div>)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function RuntimeWindow({ title, body, className }: { title: string; body: string; className: string }) {
  return <div className={`absolute w-72 rounded-3xl border border-white/15 bg-slate-950/75 p-5 shadow-2xl backdrop-blur-xl ${className}`}><div className="mb-2 text-xs tracking-[.35em] text-emerald-300">● ● ●</div><h3 className="font-black">{title}</h3><p className="mt-2 text-sm text-slate-300">{body}</p></div>
}
