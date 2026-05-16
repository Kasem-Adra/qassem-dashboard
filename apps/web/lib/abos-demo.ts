export const demoAgents = [
  { name: "Risk Monitor", status: "active", mission: "Tracks delivery and revenue risk" },
  { name: "Revenue Guard", status: "active", mission: "Flags exposure before it grows" },
  { name: "Ops Lead", status: "active", mission: "Turns signals into next steps" },
]

export const demoRisks = [
  { title: "Client onboarding", severity: "critical", probability: 100 },
  { title: "Revenue recovery", severity: "high", probability: 72 },
  { title: "Escalation queue", severity: "medium", probability: 54 },
]

export const demoRecommendations = [
  "Assign one owner to client onboarding",
  "Remove one approval handoff",
  "Move blocked approvals to leadership review",
]

export const demoMemoryEvents = [
  {
    title: "Client escalation logged",
    description: "A high-priority onboarding issue needs attention",
    time: "Pending live sync",
  },
  {
    title: "Revenue recovery started",
    description: "Recovery work is now in motion",
    time: "Pending live sync",
  },
]

export function createDemoMemoryEvents(time: string) {
  return demoMemoryEvents.map((event) => ({
    ...event,
    time,
  }))
}

export const demoHealth = {
  operationalHealth: 87,
  criticalRisks: 3,
  revenueExposure: 330000,
  aiActions: 8,
  status: "demo",
}

export const demoLiveScore = {
  operationalScore: 87,
  riskScore: 32,
}

export const demoDecisions = [
  {
    priority: "critical",
    title: "Start recovery plan",
    reason: "Client onboarding is at high risk without a clear owner.",
    action: "Assign a senior owner and pause non-essential work.",
  },
  {
    priority: "high",
    title: "Shift team capacity",
    reason: "Delivery work is overloaded and blocked by dependencies.",
    action: "Move two available teammates to revenue recovery.",
  },
  {
    priority: "medium",
    title: "Review approvals",
    reason: "Delayed approvals are slowing downstream work.",
    action: "Send pending approvals to leadership review.",
  },
]

export interface DemoStreamEvent {
  type: "operational_update"
  health: number
  risk: number
  message: string
  timestamp: string
}

export function createDemoStreamEvent(health: number, risk: number, timestamp: string): DemoStreamEvent {
  return {
    type: "operational_update",
    health,
    risk,
    message: "New operating signals are ready.",
    timestamp,
  }
}
