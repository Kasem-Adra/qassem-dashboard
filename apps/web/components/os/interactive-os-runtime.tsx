"use client"

import { useEffect, useMemo, useState } from "react"

const commands = [
  { id: "ai", label: "Open assistant", hint: "Draft with current context" },
  { id: "theme", label: "Edit theme", hint: "Tune color, radius, and motion" },
  { id: "realtime", label: "Open presence", hint: "Review collaboration state" },
  { id: "media", label: "Open media", hint: "Manage assets and tags" },
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

  const filtered = useMemo(() => commands.filter((command) => `${command.label} ${command.hint}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <section className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="font-semibold tracking-tight">Qassem Studio</div>
          <button onClick={() => setOpen(true)} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">⌘K</button>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
          <div className="relative min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <RuntimeWindow className="left-8 top-8" title="Control center" body="Jump to key actions fast." />
            <RuntimeWindow className="right-8 top-24" title="Assistant" body="Stream answers with context." />
            <RuntimeWindow className="left-20 bottom-10" title="Theme editor" body="Tune color, radius, and motion." />
            <RuntimeWindow className="right-12 bottom-16" title="Presence" body="Review live collaboration state." />
          </div>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-4xl font-semibold tracking-tight">Workspace</div>
            <p className="mt-3 text-slate-600">A compact view of content, tools, and activity.</p>
          </aside>
        </div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 p-8 pt-24 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10" onClick={(e) => e.stopPropagation()}>
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actions or ask AI..." className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xl outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100" />
            <div className="mt-3 grid gap-2">
              {filtered.map((command) => <div key={command.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><b>{command.label}</b><p className="text-sm text-slate-500">{command.hint}</p></div>)}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function RuntimeWindow({ title, body, className }: { title: string; body: string; className: string }) {
  return <div className={`absolute w-72 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/70 ${className}`}><div className="mb-2 text-xs tracking-[.35em] text-teal-600">● ● ●</div><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm text-slate-600">{body}</p></div>
}
