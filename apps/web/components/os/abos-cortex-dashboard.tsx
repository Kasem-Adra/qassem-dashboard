"use client"

import {
  createDemoMemoryEvents,
  createDemoStreamEvent,
  demoAgents,
  demoDecisions,
  demoHealth,
  demoMemoryEvents,
  demoRecommendations,
  demoRisks,
  type DemoStreamEvent,
} from "../../lib/abos-demo"
import { apiEventSource, apiJson } from "../../lib/api-client"
 codex/continue-implementing-the-dashboard

import { WebsiteStudio } from "./website-studio"
 main
import { useEffect, useState, type ReactNode } from "react"
import { WebsiteStudio } from "./website-studio"

type Health = typeof demoHealth
type Agent = (typeof demoAgents)[number]
type Decision = (typeof demoDecisions)[number]
type MemoryEvent = (typeof demoMemoryEvents)[number]
type Risk = (typeof demoRisks)[number]
type LiveEvent = DemoStreamEvent

 codex/continue-implementing-the-dashboard
const navItems = ["Overview", "Website", "Risks", "Agents", "Notes", "Actions"]

const navItems = ["Overview", "Content", "Risks", "Agents", "Memory", "Decisions"]
 main

export function ABOSCortexDashboard() {
  const [health, setHealth] = useState<Health>(demoHealth)
  const [risks, setRisks] = useState<Risk[]>(demoRisks)
  const [recommendations, setRecommendations] = useState<string[]>(demoRecommendations)
  const [memoryEvents, setMemoryEvents] = useState<MemoryEvent[]>(demoMemoryEvents)
  const [agents, setAgents] = useState<Agent[]>(demoAgents)
  const [decisions, setDecisions] = useState<Decision[]>(demoDecisions)
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null)

  useEffect(() => {
    apiJson<Health>("/api/abos/health", { fallback: demoHealth }).then(setHealth)
    apiJson<{ risks?: Risk[] }>("/api/abos/risks", { fallback: { risks: demoRisks } }).then((data) => setRisks(data.risks ?? demoRisks))
    apiJson<{ recommendations?: string[] }>("/api/abos/recommendations", { fallback: { recommendations: demoRecommendations } }).then((data) =>
      setRecommendations(data.recommendations ?? demoRecommendations)
    )
    const currentDemoMemoryEvents = createDemoMemoryEvents("Live sync pending")

    apiJson<{ events?: MemoryEvent[] }>("/api/abos/memory", { fallback: { events: currentDemoMemoryEvents } }).then((data) =>
      setMemoryEvents(data.events ?? currentDemoMemoryEvents)
    )
    apiJson<{ agents?: Agent[] }>("/api/abos/agents", { fallback: { agents: demoAgents } }).then((data) => setAgents(data.agents ?? demoAgents))
    apiJson<{ decisions?: Decision[] }>("/api/abos/decisions", { fallback: { decisions: demoDecisions } }).then((data) =>
      setDecisions(data.decisions ?? demoDecisions)
    )

    const stream = apiEventSource("/api/abos/stream")

    stream.onmessage = (event) => {
      try {
        setLiveEvent(JSON.parse(event.data) as LiveEvent)
      } catch {
        setLiveEvent(null)
      }
    }

    stream.onerror = () => {
      setLiveEvent(createDemoStreamEvent(Math.floor(82 + Math.random() * 12), Math.floor(45 + Math.random() * 55), new Date().toISOString()))
      stream.close()
    }

    return () => stream.close()
  }, [])

  return (
 codex/continue-implementing-the-dashboard
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white">Q</div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Qassem Studio</p>
              <p className="text-xs text-slate-500">Website and operations</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Dashboard navigation">
            {navItems.map((item, index) => (
              <button
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0 ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"

    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-5 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00b3b8] text-lg font-black text-white shadow-sm">A</div>
            <div>
              <p className="text-sm font-bold text-slate-950">ABOS Cortex</p>
              <p className="text-xs text-slate-500">Autonomous OS</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item, index) => (
              <button
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0 ? "bg-[#ecfeff] text-[#007a7f]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
 main
                }`}
                key={item}
                type="button"
              >
 codex/continue-implementing-the-dashboard
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-700">Dashboard</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Manage the site and daily work.</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden min-w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:block">Search pages, tasks, risks...</div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Live</span>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:p-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
              <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">Overview</p>
                  <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-.045em] lg:text-6xl">A clear view of content, risks, and next steps.</h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">Publish site updates, review key risks, and keep day-to-day work moving from a single dashboard.</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <a className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800" href="#risks">Review risks</a>
                    <a className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50" href="/workspace">Open workspace</a>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold">Latest update</p>
                  {liveEvent ? (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm leading-6 text-slate-600">{liveEvent.message}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <MiniMetric label="Health" value={`${liveEvent.health}%`} />
                        <MiniMetric label="Risk" value={`${liveEvent.risk}%`} />
                      </div>
                    </div>
                  ) : (
                    <EmptyState title="No live update yet" description="New updates appear here automatically." />
                  )}
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Health score" value={health ? `${health.operationalHealth}%` : "..."} helper="Current status" />
              <MetricCard title="Open risks" value={health ? String(health.criticalRisks) : "..."} helper="Needs review" />
              <MetricCard title="Revenue in view" value={health ? `$${health.revenueExposure / 1000}K` : "..."} helper="Monitored value" />
              <MetricCard title="Suggested actions" value={health ? String(health.aiActions) : "..."} helper="Ready to review" />
            </div>

            <WebsiteStudio />

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]" id="risks">
              <Panel eyebrow="Risks" title="Risk watchlist">
                {risks.length === 0 ? <EmptyState title="No open risks" description="Risks appear here when attention is needed." /> : risks.map((risk) => (
                  <RiskRow key={risk.title} title={risk.title} value={`${risk.probability}%`} description={`${risk.severity} priority. Review and choose a next step.`} />
                ))}
              </Panel>

              <Panel eyebrow="Next steps" title="Recommended actions">
                {recommendations.length === 0 ? <EmptyState title="No actions yet" description="Suggested actions appear after analysis." /> : recommendations.map((item, index) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4" key={item}>
                    <div className="flex gap-3">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">{index + 1}</span>
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  </div>
                ))}
              </Panel>
            </div>

            <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
              <Panel eyebrow="Notes" title="Recent context">
                {memoryEvents.length === 0 ? <EmptyState title="No notes yet" description="Important updates will appear here." /> : memoryEvents.map((event) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4" key={event.title}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <strong className="text-sm font-semibold text-slate-950">{event.title}</strong>
                      <span className="text-xs text-slate-500">{event.time}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
                  </div>
                ))}
              </Panel>

              <Panel eyebrow="Team" title="Agents">
                {agents.length === 0 ? <EmptyState title="No agents active" description="Active agents will appear here." /> : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {agents.map((agent) => (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5" key={agent.name}>
                        <p className="text-xs font-semibold uppercase tracking-[.16em] text-teal-700">{agent.status}</p>
                        <h3 className="mt-3 text-lg font-semibold tracking-tight text-slate-950">{agent.name}</h3>

                <span>{item}</span>
                {index === 0 && <span className="h-2 w-2 rounded-full bg-[#00b3b8]" />}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 to-slate-800 p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-cyan-200">Live system</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">Predictive signals and autonomous actions are synchronized across the workspace.</p>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.22em] text-[#00a4aa]">ABOS Cortex V1</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Business Operating Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden min-w-64 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:block">Search workflows, risks, memory...</div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">Online</span>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-6 lg:p-8">
            <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
                <div className="p-6 md:p-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-bold uppercase tracking-[.16em] text-cyan-700">
                    <span className="h-2 w-2 rounded-full bg-[#00b3b8]" /> Command overview
                  </div>
                  <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">Autonomous Business Operating System</h2>
                  <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">Predictive operational intelligence for autonomous companies, organized into clean workspaces, live cards, and executive-ready action queues.</p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <button className="rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" type="button">Review risks</button>
                    <button className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300" type="button">Open workspace</button>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-slate-50 p-6 lg:border-l lg:border-t-0">
                  <p className="text-sm font-bold text-slate-950">Live operational stream</p>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    {liveEvent ? (
                      <>
                        <p className="text-sm leading-6 text-slate-700">{liveEvent.message}</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <MiniMetric label="Health" value={`${liveEvent.health}%`} tone="emerald" />
                          <MiniMetric label="Risk" value={`${liveEvent.risk}%`} tone="amber" />
                        </div>
                      </>
                    ) : (
                      <EmptyState title="Waiting for stream" description="Live events will appear as ABOS publishes updates." />
                    )}
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card title="Operational Health" value={health ? `${health.operationalHealth}%` : "..."} accent="bg-emerald-500" helper="Stability index" />
              <Card title="Critical Risks" value={health ? String(health.criticalRisks) : "..."} accent="bg-rose-500" helper="Needs triage" />
              <Card title="Revenue Exposure" value={health ? `$${health.revenueExposure / 1000}K` : "..."} accent="bg-amber-500" helper="Open exposure" />
              <Card title="AI Actions" value={health ? String(health.aiActions) : "..."} accent="bg-cyan-500" helper="Queued actions" />
            </div>

            <WebsiteStudio />

            <div className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
              <Section eyebrow="Risk center" title="Predicted Operational Failures">
                {risks.length === 0 ? <EmptyState title="No risks detected" description="Operational risk rows will appear here when detected." /> : risks.map((risk) => (
                  <RiskItem
                    key={risk.title}
                    title={risk.title}
                    risk={`${risk.probability}% Risk`}
                    tone={risk.probability >= 90 ? "rose" : risk.probability >= 70 ? "amber" : "orange"}
                    description={`Severity: ${risk.severity}. Predictive operational risk detected by ABOS Cortex.`}
                  />
                ))}
              </Section>

              <Section eyebrow="Executive queue" title="AI Recommendations">
                {recommendations.length === 0 ? <EmptyState title="No recommendations" description="Recommended actions will appear after risk analysis." /> : recommendations.map((item, index) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={item}>
                    <div className="flex gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ecfeff] text-sm font-black text-[#007a7f]">{index + 1}</span>
                      <p className="text-sm leading-6 text-slate-700">{item}</p>
                    </div>
                  </div>
                ))}
              </Section>
            </div>

            <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
              <Section eyebrow="Memory" title="Organizational Timeline">
                {memoryEvents.length === 0 ? <EmptyState title="No memory events" description="Memory events will appear after activity is recorded." /> : memoryEvents.map((event) => (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" key={event.title}>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <strong className="text-sm font-bold text-slate-950">{event.title}</strong>
                      <span className="text-xs font-medium text-slate-500">{event.time}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{event.description}</p>
                  </div>
                ))}
              </Section>

              <Section eyebrow="Agents" title="Autonomous Agents Network">
                {agents.length === 0 ? <EmptyState title="No agents online" description="Registered agents will appear in this network." /> : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {agents.map((agent) => (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={agent.name}>
                        <p className="text-xs font-bold uppercase tracking-[.18em] text-[#00a4aa]">{agent.status}</p>
                        <h3 className="mt-3 text-lg font-black text-slate-950">{agent.name}</h3>
 main
                        <p className="mt-3 text-sm leading-6 text-slate-600">{agent.mission}</p>
                      </div>
                    ))}
                  </div>
                )}
 codex/continue-implementing-the-dashboard
              </Panel>
            </div>

            <Panel eyebrow="Decisions" title="Decision queue">
              {decisions.length === 0 ? <EmptyState title="No decisions queued" description="Decisions appear when action is needed." /> : decisions.map((decision) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-5" key={decision.title}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">{decision.title}</h3>
                    <PriorityBadge priority={decision.priority} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{decision.reason}</p>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <strong className="text-sm font-semibold text-slate-950">Recommended step</strong>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{decision.action}</p>
                  </div>
                </div>
              ))}
            </Panel>

              </Section>
            </div>

            <Section eyebrow="Decision engine" title="Autonomous Decision Engine">
              {decisions.length === 0 ? <EmptyState title="No decisions queued" description="Autonomous decisions will appear when the engine recommends action." /> : decisions.map((decision) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={decision.title}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xl font-black text-slate-950">{decision.title}</h3>
                    <PriorityBadge priority={decision.priority} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{decision.reason}</p>
                  <div className="mt-5 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <strong className="text-sm font-black text-[#007a7f]">Recommended Action</strong>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{decision.action}</p>
                  </div>
                </div>
              ))}
            </Section>
 main
          </div>
        </section>
      </div>
    </main>
  )
}

 codex/continue-implementing-the-dashboard
function MetricCard({ title, value, helper }: { title: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">{value}</h2>

function Card({ title, value, accent, helper }: { title: string; value: string; accent: string; helper: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <span className={`h-3 w-3 rounded-full ${accent}`} />
      </div>
      <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-950">{value}</h2>
 main
      <p className="mt-2 text-xs font-medium uppercase tracking-[.16em] text-slate-400">{helper}</p>
    </div>
  )
}

 codex/continue-implementing-the-dashboard
function RiskRow({ title, value, description }: { title: string; value: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{value}</span>

function RiskItem({ title, risk, tone, description }: { title: string; risk: string; tone: "rose" | "amber" | "orange"; description: string }) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-black text-slate-950">{title}</h3>
        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${tones[tone]}`}>{risk}</span>
 main
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

 codex/continue-implementing-the-dashboard
function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-700">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
=======
function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#00a4aa]">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        </div>
      </div>
 main
      <div className="mt-5 flex flex-col gap-3">{children}</div>
    </section>
  )
}

 codex/continue-implementing-the-dashboard
function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <p className="text-xs font-medium uppercase tracking-[.16em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: "emerald" | "amber" }) {
  const color = tone === "emerald" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"
  return (
    <div className={`rounded-2xl border p-3 ${color}`}>
      <p className="text-xs font-bold uppercase tracking-[.16em]">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center">
      <p className="text-sm font-black text-slate-700">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
 main
    </div>
  )
}

 codex/continue-implementing-the-dashboard
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-5 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" : priority === "high" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${tone}`}>{priority}</span>

function PriorityBadge({ priority }: { priority: string }) {
  const tone = priority === "critical" ? "border-rose-200 bg-rose-50 text-rose-700" : priority === "high" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-blue-200 bg-blue-50 text-blue-700"
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black uppercase ${tone}`}>{priority}</span>
 main
}
