"use client"

import { useEffect, useMemo, useState } from "react"
import { apiEventSource, apiJson } from "../../lib/api-client"

type Agent = { name: string; status: string; mission: string }
type Risk = { title: string; severity: string; probability: number }
type MemoryEvent = { title: string; description: string; time: string }
type LiveScore = { operationalScore: number; riskScore: number }
type Decision = { priority: string; title: string; reason: string; action: string }

const fallbackAgents: Agent[] = [
  { name: "Launch Ops", status: "online", mission: "Coordinates launch plans and approvals" },
  { name: "Risk Desk", status: "online", mission: "Reviews delivery, revenue, and client health" },
  { name: "Content Lead", status: "online", mission: "Keeps website copy ready to publish" },
]

const fallbackRisks: Risk[] = [
  { title: "Enterprise onboarding", severity: "High", probability: 72 },
  { title: "Launch approvals", severity: "Medium", probability: 54 },
]

const fallbackRecommendations = ["Confirm launch owner for the homepage refresh", "Move blocked approvals into executive review", "Prepare a client-ready summary for this week"]
const fallbackMemory: MemoryEvent[] = [
  { title: "Website brief approved", description: "Positioning, offer, and conversion goals were finalized.", time: "Live sync pending" },
  { title: "Operations review scheduled", description: "Leadership review is ready for the next planning cycle.", time: "Live sync pending" },
]

export function ABOSCortexDashboard() {
  const [agents, setAgents] = useState<Agent[]>(fallbackAgents)
  const [risks, setRisks] = useState<Risk[]>(fallbackRisks)
  const [recommendations, setRecommendations] = useState<string[]>(fallbackRecommendations)
  const [memory, setMemory] = useState<MemoryEvent[]>(fallbackMemory)
  const [score, setScore] = useState<LiveScore>({ operationalScore: 92, riskScore: 18 })
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [streamMessage, setStreamMessage] = useState("Live operating signals are synchronized.")

  useEffect(() => {
    apiJson<{ agents: Agent[] }>("/api/abos/agents", { fallback: { agents: fallbackAgents } }).then((data) => setAgents(data.agents))
    apiJson<{ risks: Risk[] }>("/api/abos/risks", { fallback: { risks: fallbackRisks } }).then((data) => setRisks(data.risks))
    apiJson<{ recommendations: string[] }>("/api/abos/recommendations", { fallback: { recommendations: fallbackRecommendations } }).then((data) => setRecommendations(data.recommendations))
    apiJson<{ events: MemoryEvent[] }>("/api/abos/memory", { fallback: { events: fallbackMemory } }).then((data) => setMemory(data.events))
    apiJson<LiveScore>("/api/abos/live-score", { fallback: { operationalScore: 92, riskScore: 18 } }).then(setScore)
    apiJson<{ decisions: Decision[] }>("/api/abos/decisions", { fallback: { decisions: [] } }).then((data) => setDecisions(data.decisions))
  }, [])

  useEffect(() => {
    const source = apiEventSource("/api/abos/stream")
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { health?: number; risk?: number; message?: string }
      setScore({ operationalScore: payload.health ?? 92, riskScore: payload.risk ?? 18 })
      setStreamMessage(payload.message ?? "New operating signals are ready.")
    }
    return () => source.close()
  }, [])

  const runway = useMemo(() => Math.max(0, 100 - score.riskScore), [score.riskScore])

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid lg:grid-cols-[1fr_380px]">
          <div className="p-6 md:p-8">
            <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-indigo-700">Executive overview</p>
            <h2 className="mt-6 max-w-4xl text-4xl font-black tracking-[-.055em] text-slate-950 md:text-6xl">A premium operating dashboard for content, clients, and AI work.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">Review performance, risks, decisions, agents, and context without leaving a clean SaaS workspace.</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Metric label="Operational score" value={`${score.operationalScore}%`} tone="indigo" />
              <Metric label="Risk exposure" value={`${score.riskScore}%`} tone="rose" />
              <Metric label="Execution runway" value={`${runway}%`} tone="emerald" />
            </div>
          </div>
          <div className="border-t border-slate-200 bg-slate-950 p-6 text-white lg:border-l lg:border-t-0">
            <p className="text-xs font-black uppercase tracking-[.2em] text-indigo-300">Live stream</p>
            <h3 className="mt-4 text-2xl font-black tracking-tight">{streamMessage}</h3>
            <div className="mt-8 space-y-3">
              {memory.slice(0, 3).map((event) => (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4" key={event.title}>
                  <p className="text-sm font-bold text-white">{event.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <Panel title="Work queue" eyebrow="Priority actions">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {recommendations.map((item, index) => (
                  <tr key={item}>
                    <td className="px-4 py-4 font-semibold text-slate-800">{item}</td>
                    <td className="px-4 py-4 text-slate-500">Team {index + 1}</td>
                    <td className="px-4 py-4"><StatusPill label={index === 0 ? "Ready" : "Queued"} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Risk watchlist" eyebrow="Coverage">
          <div className="space-y-3">
            {risks.length === 0 ? <EmptyState title="No risks found" description="The watchlist is clear right now." /> : risks.map((risk) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4" key={risk.title}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">{risk.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">{risk.severity} priority</p>
                  </div>
                  <span className="text-sm font-black text-rose-600">{risk.probability}%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${risk.probability}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="AI agents" eyebrow="Runtime team">
          <div className="space-y-3">
            {agents.map((agent) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4" key={agent.name}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-950">{agent.name}</p>
                  <StatusPill label={agent.status} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{agent.mission}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Decision log" eyebrow="Approvals">
          <div className="space-y-3">
            {(decisions.length ? decisions : [{ priority: "high", title: "Approve launch plan", reason: "Homepage refresh is ready for review.", action: "Route to leadership" }]).slice(0, 3).map((decision) => (
              <div className="rounded-2xl border border-slate-200 bg-white p-4" key={decision.title}>
                <p className="text-xs font-black uppercase tracking-[.14em] text-indigo-600">{decision.priority}</p>
                <h3 className="mt-2 text-sm font-black text-slate-950">{decision.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{decision.reason}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Settings" eyebrow="Workspace">
          <form className="space-y-4">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[.14em] text-slate-400">Workspace name</span>
              <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" defaultValue="Qassem Cloud" />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[.14em] text-slate-400">Approval mode</span>
              <select className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" defaultValue="managed">
                <option value="managed">Managed approvals</option>
                <option value="open">Open publishing</option>
              </select>
            </label>
            <button className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" type="button">Save preferences</button>
          </form>
        </Panel>
      </div>
    </div>
  )
}

function Panel({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Metric({ label, value, tone }: { label: string; value: string; tone: 'indigo' | 'rose' | 'emerald' }) {
  const tones = { indigo: 'text-indigo-600 bg-indigo-50', rose: 'text-rose-600 bg-rose-50', emerald: 'text-emerald-600 bg-emerald-50' }
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className={`inline-flex rounded-full px-2.5 py-1 text-xs font-black ${tones[tone]}`}>{label}</p>
      <p className="mt-4 text-3xl font-black tracking-[-.04em] text-slate-950">{value}</p>
    </div>
  )
}

function StatusPill({ label }: { label: string }) {
  return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black capitalize text-emerald-700">{label}</span>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}
