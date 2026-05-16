export const demoAgents = [
  { name: "Cortex Sentinel", status: "active", mission: "Monitor operational risks" },
  { name: "Revenue AI", status: "active", mission: "Protect company revenue" },
  { name: "Ops Commander", status: "active", mission: "Coordinate executive recovery" },
]

export const demoRisks = [
  { title: "Enterprise Client Onboarding", severity: "critical", probability: 100 },
  { title: "Revenue Recovery Workflow", severity: "high", probability: 72 },
  { title: "Escalation Queue Delay", severity: "medium", probability: 54 },
]

export const demoRecommendations = [
  "Assign emergency owner to onboarding workflow",
  "Reduce dependency chain length",
  "Escalate blocked approvals immediately",
]

export const demoMemoryEvents = [
  {
    title: "Client escalation detected",
    description: "ABOS detected high-priority onboarding escalation",
    time: "Pending live sync",
  },
  {
    title: "Revenue recovery initiated",
    description: "Recovery workflow activated automatically",
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
    title: "Trigger recovery protocol",
    reason: "Enterprise onboarding has reached maximum predicted failure probability.",
    action: "Assign senior owner and freeze non-critical dependencies.",
  },
  {
    priority: "high",
    title: "Reallocate operations capacity",
    reason: "Delivery workflow shows overload and dependency bottlenecks.",
    action: "Move two available operators to revenue recovery workflow.",
  },
  {
    priority: "medium",
    title: "Escalate approval chain",
    reason: "Approval delays are increasing downstream operational risk.",
    action: "Route pending approvals to executive review.",
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
    message: "ABOS Cortex updated operational intelligence.",
    timestamp,
  }
}
