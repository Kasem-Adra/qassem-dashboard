"use client"

import { useEffect, useState } from "react"
import { apiEventSource } from "../../lib/api-client"

type StreamEvent = { type?: string; message?: string; health?: number; risk?: number; timestamp?: string }

const initialEvents: StreamEvent[] = [
  { type: "workspace.ready", message: "Studio workspace is ready for guided AI operations.", health: 92, risk: 18, timestamp: new Date().toISOString() },
]

export function AIStreamingPanel() {
  const [events, setEvents] = useState<StreamEvent[]>(initialEvents)
  const [prompt, setPrompt] = useState("Draft a launch plan for the premium SaaS dashboard.")

  useEffect(() => {
    const source = apiEventSource("/api/abos/stream")
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as StreamEvent
      setEvents((current) => [payload, ...current].slice(0, 8))
    }
    return () => source.close()
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-indigo-700">AI studio</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-.05em] text-slate-950 md:text-5xl">Collaborate with AI in a focused production workspace.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Use a clean prompt composer, live event feed, structured outputs, and reusable empty states to keep the interface consistent.</p>
        </div>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Composer</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Production prompt</h3>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Connected</span>
          </div>
          <textarea className="mt-5 min-h-44 w-full resize-none rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium leading-7 text-slate-800 outline-none focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100" onChange={(event) => setPrompt(event.target.value)} value={prompt} />
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" type="button">Run workflow</button>
            <button className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50" type="button">Save as template</button>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Generated plan</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Recommended structure</h3>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {['Brief', 'Create', 'Approve'].map((step, index) => (
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={step}>
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-xs font-black text-indigo-700 shadow-sm">0{index + 1}</span>
                <h4 className="mt-4 text-sm font-black text-slate-950">{step}</h4>
                <p className="mt-2 text-xs leading-5 text-slate-500">{step === 'Brief' ? 'Clarify audience, outcome, and constraints.' : step === 'Create' ? 'Draft assets, tasks, and review notes.' : 'Route to decision makers and publish with confidence.'}</p>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="space-y-6">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Live feed</p>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">Streaming updates</h3>
          <div className="mt-5 space-y-3">
            {events.map((event, index) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={`${event.timestamp}-${index}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-950">{event.type ?? 'operational.update'}</p>
                  <span className="text-xs font-bold text-slate-400">{event.health ?? 92}%</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{event.message ?? 'New operating signals are available.'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Empty state</p>
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-black text-slate-950">No saved templates yet</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">Create a repeatable workflow to see templates here.</p>
          </div>
        </section>
      </aside>
    </div>
  )
}
