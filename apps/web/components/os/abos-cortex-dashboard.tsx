"use client"

import {
  createDemoStreamEvent,
  createDemoMemoryEvents,
  type DemoStreamEvent,
  demoAgents,
  demoDecisions,
  demoHealth,
  demoMemoryEvents,
  demoRecommendations,
  demoRisks,
} from "../../lib/abos-demo"
import { useEffect, useState, type ReactNode } from "react"

type Health = typeof demoHealth
type Agent = (typeof demoAgents)[number]
type Decision = (typeof demoDecisions)[number]
type MemoryEvent = (typeof demoMemoryEvents)[number]
type Risk = (typeof demoRisks)[number]
type LiveEvent = DemoStreamEvent

async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url)
    if (!response.ok) return fallback
    return (await response.json()) as T
  } catch {
    return fallback
  }
}

export function ABOSCortexDashboard() {
  const [health, setHealth] = useState<Health>(demoHealth)
  const [risks, setRisks] = useState<Risk[]>(demoRisks)
  const [recommendations, setRecommendations] = useState<string[]>(demoRecommendations)
  const [memoryEvents, setMemoryEvents] = useState<MemoryEvent[]>(demoMemoryEvents)
  const [agents, setAgents] = useState<Agent[]>(demoAgents)
  const [decisions, setDecisions] = useState<Decision[]>(demoDecisions)
  const [liveEvent, setLiveEvent] = useState<LiveEvent | null>(null)

  useEffect(() => {
    fetchJson<Health>("/api/abos/health", demoHealth).then(setHealth)
    fetchJson<{ risks?: Risk[] }>("/api/abos/risks", { risks: demoRisks }).then((data) => setRisks(data.risks ?? demoRisks))
    fetchJson<{ recommendations?: string[] }>("/api/abos/recommendations", { recommendations: demoRecommendations }).then((data) =>
      setRecommendations(data.recommendations ?? demoRecommendations)
    )
    const currentDemoMemoryEvents = createDemoMemoryEvents("Live sync pending")

    fetchJson<{ events?: MemoryEvent[] }>("/api/abos/memory", { events: currentDemoMemoryEvents }).then((data) =>
      setMemoryEvents(data.events ?? currentDemoMemoryEvents)
    )
    fetchJson<{ agents?: Agent[] }>("/api/abos/agents", { agents: demoAgents }).then((data) => setAgents(data.agents ?? demoAgents))
    fetchJson<{ decisions?: Decision[] }>("/api/abos/decisions", { decisions: demoDecisions }).then((data) =>
      setDecisions(data.decisions ?? demoDecisions)
    )

    const stream = new EventSource("/api/abos/stream")

    stream.onmessage = (event) => {
      try {
        setLiveEvent(JSON.parse(event.data) as LiveEvent)
      } catch {
        setLiveEvent(null)
      }
    }

    stream.onerror = () => {
      setLiveEvent(
        createDemoStreamEvent(
          Math.floor(82 + Math.random() * 12),
          Math.floor(45 + Math.random() * 55),
          new Date().toISOString()
        )
      )
      stream.close()
    }

    return () => stream.close()
  }, [])

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 40 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 24, padding: 40 }}>
          <p style={{ color: "#22d3ee", fontSize: 14 }}>ABOS Cortex V1</p>

          <h1 style={{ fontSize: 64, fontWeight: 900, marginTop: 20, lineHeight: 1 }}>
            Autonomous Business
            <br />
            <span style={{ color: "#67e8f9" }}>Operating System</span>
          </h1>

          <p style={{ color: "#a1a1aa", marginTop: 24, fontSize: 18, maxWidth: 700, lineHeight: 1.7 }}>
            Predictive operational intelligence infrastructure for autonomous companies.
          </p>
        </div>

        {liveEvent && (
          <div
            style={{
              background: "#022c22",
              border: "1px solid #10b981",
              borderRadius: 20,
              padding: 20,
              marginTop: 24,
            }}
          >
            <p style={{ color: "#6ee7b7", fontWeight: 800 }}>LIVE OPERATIONAL STREAM</p>
            <p style={{ marginTop: 10, color: "#d1fae5" }}>{liveEvent.message}</p>
            <p style={{ marginTop: 8, color: "#a7f3d0" }}>
              Health: {liveEvent.health}% — Risk: {liveEvent.risk}%
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 24, marginTop: 32 }}>
          <Card title="Operational Health" value={health ? `${health.operationalHealth}%` : "..."} color="#4ade80" />
          <Card title="Critical Risks" value={health ? String(health.criticalRisks) : "..."} color="#f87171" />
          <Card title="Revenue Exposure" value={health ? `$${health.revenueExposure / 1000}K` : "..."} color="#facc15" />
          <Card title="AI Actions" value={health ? String(health.aiActions) : "..."} color="#22d3ee" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(500px,1fr))", gap: 24, marginTop: 32 }}>
          <Section title="Predicted Operational Failures">
            {risks.map((risk) => (
              <RiskItem
                key={risk.title}
                title={risk.title}
                risk={`${risk.probability}% Risk`}
                color={risk.probability >= 90 ? "#f87171" : risk.probability >= 70 ? "#facc15" : "#fb923c"}
                description={`Severity: ${risk.severity}. Predictive operational risk detected by ABOS Cortex.`}
              />
            ))}
          </Section>

          <Section title="AI Executive Recommendations">
            {recommendations.map((item) => (
              <div
                key={item}
                style={{
                  background: "#020617",
                  border: "1px solid #1f2937",
                  borderRadius: 18,
                  padding: 20,
                  color: "#d4d4d8",
                  lineHeight: 1.6,
                }}
              >
                {item}
              </div>
            ))}
          </Section>
        </div>

        <Section title="Organizational Memory Timeline">
          {memoryEvents.map((event) => (
            <div key={event.title} style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 18, padding: 20 }}>
              <strong>{event.title}</strong>
              <span style={{ float: "right", color: "#22d3ee" }}>{event.time}</span>
              <p style={{ color: "#a1a1aa", marginTop: 12 }}>{event.description}</p>
            </div>
          ))}
        </Section>

        <Section title="Autonomous Agents Network">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
            {agents.map((agent) => (
              <div key={agent.name} style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 20, padding: 24 }}>
                <p style={{ color: "#22d3ee", fontSize: 13 }}>{agent.status.toUpperCase()}</p>
                <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 10 }}>{agent.name}</h3>
                <p style={{ color: "#a1a1aa", lineHeight: 1.7, marginTop: 12 }}>{agent.mission}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Autonomous Decision Engine">
          {decisions.map((decision) => (
            <div
              key={decision.title}
              style={{
                background: "#020617",
                border: "1px solid #1f2937",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800 }}>{decision.title}</h3>

                <span
                  style={{
                    color:
                      decision.priority === "critical"
                        ? "#f87171"
                        : decision.priority === "high"
                        ? "#facc15"
                        : "#60a5fa",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {decision.priority}
                </span>
              </div>

              <p style={{ color: "#a1a1aa", marginTop: 16, lineHeight: 1.7 }}>
                {decision.reason}
              </p>

              <div
                style={{
                  marginTop: 20,
                  background: "#111827",
                  borderRadius: 14,
                  padding: 16,
                  border: "1px solid #1f2937",
                }}
              >
                <strong style={{ color: "#67e8f9" }}>Recommended Action:</strong>

                <p style={{ marginTop: 8, color: "#d4d4d8", lineHeight: 1.7 }}>
                  {decision.action}
                </p>
              </div>
            </div>
          ))}
        </Section>
      </div>
    </main>
  )
}

function Card({ title, value, color }: { title: string; value: string; color: string }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 24, padding: 24 }}>
      <p style={{ color: "#a1a1aa", fontSize: 14 }}>{title}</p>
      <h2 style={{ marginTop: 20, fontSize: 48, fontWeight: 900, color }}>{value}</h2>
    </div>
  )
}

function RiskItem({ title, risk, color, description }: { title: string; risk: string; color: string; description: string }) {
  return (
    <div style={{ background: "#020617", border: "1px solid #1f2937", borderRadius: 20, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 20 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <span style={{ color, fontWeight: 700 }}>{risk}</span>
      </div>
      <p style={{ marginTop: 14, color: "#a1a1aa", lineHeight: 1.7 }}>{description}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 24, padding: 32, marginTop: 32 }}>
      <h2 style={{ fontSize: 30, fontWeight: 800 }}>{title}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24 }}>
        {children}
      </div>
    </div>
  )
}
