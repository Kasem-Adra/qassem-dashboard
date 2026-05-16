export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type Priority = 'low' | 'medium' | 'high' | 'critical'

export interface ABOSTask {
  id: string
  projectId: string
  title: string
  status: TaskStatus
  priority: Priority
  assignedTo?: string
  dueDate: string
  createdAt: string
  updatedAt?: string
  dependencies?: string[]
}

export interface ABOSProject {
  id: string
  title: string
  status: 'active' | 'paused' | 'completed' | 'at_risk'
  owner?: string
  deadline: string
  revenueImpact?: number
  customerImpact?: number
  createdAt: string
}

export interface ABOSActivity {
  id: string
  entityType: 'project' | 'task' | 'customer' | 'team' | 'finance'
  entityId: string
  action: string
  severity?: 'info' | 'warning' | 'critical'
  createdAt: string
}

export interface ABOSRiskSignal {
  id: string
  projectId?: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  score: number
  explanation: string
  recommendation: string
  evidence: string[]
}

export interface ABOSSnapshot {
  projects: ABOSProject[]
  tasks: ABOSTask[]
  activities: ABOSActivity[]
  generatedAt?: string
}

const priorityWeight: Record<Priority, number> = {
  low: 4,
  medium: 9,
  high: 16,
  critical: 26
}

function daysBetween(a: Date, b: Date) {
  return Math.ceil((a.getTime() - b.getTime()) / 86_400_000)
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function severity(score: number): ABOSRiskSignal['severity'] {
  if (score >= 82) return 'critical'
  if (score >= 64) return 'high'
  if (score >= 38) return 'medium'
  return 'low'
}

export function calculateDelayProbability(project: ABOSProject, tasks: ABOSTask[], now = new Date()) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id)
  if (!projectTasks.length) return 18

  const unfinished = projectTasks.filter((task) => task.status !== 'done')
  const overdue = unfinished.filter((task) => new Date(task.dueDate) < now)
  const blocked = unfinished.filter((task) => task.status === 'blocked')
  const criticalOpen = unfinished.filter((task) => task.priority === 'critical' || task.priority === 'high')
  const dependencyLoad = unfinished.reduce((sum, task) => sum + (task.dependencies?.length ?? 0), 0)
  const deadlinePressure = Math.max(0, 18 - daysBetween(new Date(project.deadline), now))

  const raw =
    12 +
    overdue.length * 15 +
    blocked.length * 18 +
    criticalOpen.reduce((sum, task) => sum + priorityWeight[task.priority], 0) +
    dependencyLoad * 3 +
    deadlinePressure * 2.2 +
    Math.max(0, unfinished.length - 4) * 5

  return clamp(raw)
}

export function calculateOperationalHealth(snapshot: ABOSSnapshot) {
  const risks = generateRiskSignals(snapshot)
  const riskDrag = risks.reduce((sum, risk) => sum + risk.score, 0) / Math.max(1, risks.length)
  const done = snapshot.tasks.filter((task) => task.status === 'done').length
  const completion = snapshot.tasks.length ? (done / snapshot.tasks.length) * 100 : 70
  const criticalActivities = snapshot.activities.filter((activity) => activity.severity === 'critical').length
  return clamp(100 - riskDrag * 0.55 + completion * 0.22 - criticalActivities * 8)
}

export function generateRiskSignals(snapshot: ABOSSnapshot, now = new Date()): ABOSRiskSignal[] {
  const signals: ABOSRiskSignal[] = []

  for (const project of snapshot.projects) {
    const projectTasks = snapshot.tasks.filter((task) => task.projectId === project.id)
    const overdue = projectTasks.filter((task) => task.status !== 'done' && new Date(task.dueDate) < now)
    const blocked = projectTasks.filter((task) => task.status === 'blocked')
    const delayProbability = calculateDelayProbability(project, snapshot.tasks, now)

    if (delayProbability >= 38) {
      signals.push({
        id: `delay-${project.id}`,
        projectId: project.id,
        title: `${project.title} delay probability is ${delayProbability}%`,
        severity: severity(delayProbability),
        score: delayProbability,
        explanation: 'The engine detected deadline pressure, unfinished work, blocked tasks, and priority-weighted delivery risk.',
        recommendation: 'Move critical blocked tasks to executive review, reduce scope, and assign one owner to each dependency within 24 hours.',
        evidence: [
          `${overdue.length} overdue task(s)`,
          `${blocked.length} blocked task(s)`,
          `${projectTasks.filter((task) => task.priority === 'critical').length} critical task(s)`,
          `Deadline: ${project.deadline}`
        ]
      })
    }
  }

  const loadByOwner = new Map<string, number>()
  for (const task of snapshot.tasks) {
    if (task.status === 'done' || !task.assignedTo) continue
    loadByOwner.set(task.assignedTo, (loadByOwner.get(task.assignedTo) ?? 0) + priorityWeight[task.priority])
  }

  for (const [owner, load] of loadByOwner.entries()) {
    if (load >= 46) {
      signals.push({
        id: `load-${owner}`,
        title: `${owner} is becoming an operational bottleneck`,
        severity: severity(load + 20),
        score: clamp(load + 20),
        explanation: 'Workload concentration is creating a single point of failure across high-priority tasks.',
        recommendation: 'Redistribute at least two high-priority tasks and add a backup owner for critical workflows.',
        evidence: [`Weighted workload score: ${load}`, 'Open high-priority assignments detected']
      })
    }
  }

  return signals.sort((a, b) => b.score - a.score)
}

export function generateExecutiveInsights(snapshot: ABOSSnapshot) {
  const risks = generateRiskSignals(snapshot)
  const health = calculateOperationalHealth(snapshot)
  const revenueAtRisk = risks.reduce((sum, risk) => {
    const project = snapshot.projects.find((item) => item.id === risk.projectId)
    return sum + (project?.revenueImpact ?? 0) * (risk.score / 100)
  }, 0)

  return {
    generatedAt: snapshot.generatedAt ?? new Date().toISOString(),
    operationalHealth: health,
    riskCount: risks.length,
    criticalRiskCount: risks.filter((risk) => risk.severity === 'critical').length,
    revenueAtRisk: Math.round(revenueAtRisk),
    topRisks: risks.slice(0, 5),
    nextBestActions: risks.slice(0, 3).map((risk) => risk.recommendation),
    narrative:
      health >= 75
        ? 'The organization is stable. Focus on eliminating medium-risk dependencies before they compound.'
        : health >= 50
          ? 'Operational pressure is rising. Executive intervention is recommended for the top risk clusters.'
          : 'Critical operating risk detected. Immediate triage is required to prevent delivery and revenue impact.'
  }
}

const demoNow = '2026-01-15T12:00:00.000Z'
const demoPast30Days = '2025-12-16T12:00:00.000Z'
const demoPast24Days = '2025-12-22T12:00:00.000Z'
const demoPast18Days = '2025-12-28T12:00:00.000Z'
const demoPast2Days = '2026-01-13T12:00:00.000Z'
const demoPast1Day = '2026-01-14T12:00:00.000Z'
const demoFuture1Day = '2026-01-16T12:00:00.000Z'
const demoFuture2Days = '2026-01-17T12:00:00.000Z'
const demoFuture3Days = '2026-01-18T12:00:00.000Z'
const demoFuture5Days = '2026-01-20T12:00:00.000Z'
const demoFuture8Days = '2026-01-23T12:00:00.000Z'
const demoFuture14Days = '2026-01-29T12:00:00.000Z'

export const demoSnapshot: ABOSSnapshot = {
  generatedAt: demoNow,
  projects: [
    { id: 'p1', title: 'Enterprise Client Onboarding', status: 'active', owner: 'Operations', deadline: demoFuture5Days, revenueImpact: 120000, customerImpact: 92, createdAt: demoPast30Days },
    { id: 'p2', title: 'Automation Workflow Rollout', status: 'active', owner: 'Engineering', deadline: demoFuture14Days, revenueImpact: 80000, customerImpact: 72, createdAt: demoPast18Days },
    { id: 'p3', title: 'Quarterly Revenue Recovery', status: 'at_risk', owner: 'Growth', deadline: demoFuture8Days, revenueImpact: 210000, customerImpact: 88, createdAt: demoPast24Days }
  ],
  tasks: [
    { id: 't1', projectId: 'p1', title: 'Finalize customer data migration', status: 'blocked', priority: 'critical', assignedTo: 'Maya', dueDate: demoPast2Days, createdAt: demoNow, dependencies: ['crm-export'] },
    { id: 't2', projectId: 'p1', title: 'Security approval', status: 'in_progress', priority: 'high', assignedTo: 'Maya', dueDate: demoFuture1Day, createdAt: demoNow, dependencies: ['legal'] },
    { id: 't3', projectId: 'p2', title: 'Deploy workflow triggers', status: 'in_progress', priority: 'high', assignedTo: 'Omar', dueDate: demoFuture3Days, createdAt: demoNow },
    { id: 't4', projectId: 'p2', title: 'QA automation paths', status: 'todo', priority: 'medium', assignedTo: 'Omar', dueDate: demoFuture5Days, createdAt: demoNow },
    { id: 't5', projectId: 'p3', title: 'Recover stalled enterprise deal', status: 'blocked', priority: 'critical', assignedTo: 'Maya', dueDate: demoPast1Day, createdAt: demoNow, dependencies: ['pricing-approval', 'exec-call'] },
    { id: 't6', projectId: 'p3', title: 'Executive customer escalation', status: 'todo', priority: 'critical', assignedTo: 'Maya', dueDate: demoFuture2Days, createdAt: demoNow }
  ],
  activities: [
    { id: 'a1', entityType: 'project', entityId: 'p1', action: 'Migration blocked by missing CRM export', severity: 'critical', createdAt: demoNow },
    { id: 'a2', entityType: 'customer', entityId: 'c1', action: 'Enterprise sponsor requested escalation', severity: 'warning', createdAt: demoNow }
  ]
}
