import { CollaborationRoomState } from '@qassem/realtime'

export interface Env {
  DB: D1Database
  BUCKET: R2Bucket
  AI_ROOM: DurableObjectNamespace
}

export class AIRoom {
  private state = new CollaborationRoomState()

  constructor(private durableState: DurableObjectState, private env: Env) {}

  async fetch(request: Request) {
    const url = new URL(request.url)

    if (url.pathname.endsWith('/snapshot')) {
      return Response.json(this.state.snapshot())
    }

    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair)
      server.accept()
      server.send(JSON.stringify({ type: 'room.ready', payload: this.state.snapshot() }))
      server.addEventListener('message', (event) => {
        server.send(JSON.stringify({ type: 'echo', payload: event.data }))
      })
      return new Response(null, { status: 101, webSocket: client })
    }

    return Response.json({ ok: true, room: 'ai-os', durable: true })
  }
}


function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function demoABOSSnapshot() {
  const now = Date.now()
  const day = 86_400_000
  return {
    generatedAt: new Date().toISOString(),
    projects: [
      { id: 'p1', title: 'Enterprise Client Onboarding', status: 'active', deadline: new Date(now + 5 * day).toISOString(), revenueImpact: 120000 },
      { id: 'p2', title: 'Automation Workflow Rollout', status: 'active', deadline: new Date(now + 14 * day).toISOString(), revenueImpact: 80000 },
      { id: 'p3', title: 'Quarterly Revenue Recovery', status: 'at_risk', deadline: new Date(now + 8 * day).toISOString(), revenueImpact: 210000 }
    ],
    tasks: [
      { id: 't1', projectId: 'p1', status: 'blocked', priority: 'critical', assignedTo: 'Maya', dueDate: new Date(now - 2 * day).toISOString(), dependencies: ['crm-export'] },
      { id: 't2', projectId: 'p1', status: 'in_progress', priority: 'high', assignedTo: 'Maya', dueDate: new Date(now + day).toISOString(), dependencies: ['legal'] },
      { id: 't3', projectId: 'p2', status: 'in_progress', priority: 'high', assignedTo: 'Omar', dueDate: new Date(now + 3 * day).toISOString() },
      { id: 't4', projectId: 'p3', status: 'blocked', priority: 'critical', assignedTo: 'Maya', dueDate: new Date(now - day).toISOString(), dependencies: ['pricing-approval'] }
    ]
  }
}

function abosRiskEngine(snapshot = demoABOSSnapshot()) {
  const now = Date.now()
  const priority: Record<string, number> = { low: 4, medium: 9, high: 16, critical: 26 }
  const risks = snapshot.projects.map((project: any) => {
    const tasks = snapshot.tasks.filter((task: any) => task.projectId === project.id && task.status !== 'done')
    const overdue = tasks.filter((task: any) => new Date(task.dueDate).getTime() < now)
    const blocked = tasks.filter((task: any) => task.status === 'blocked')
    const load = tasks.reduce((sum: number, task: any) => sum + (priority[task.priority] || 9), 0)
    const daysToDeadline = Math.ceil((new Date(project.deadline).getTime() - now) / 86_400_000)
    const score = clamp(12 + overdue.length * 15 + blocked.length * 18 + load + Math.max(0, 18 - daysToDeadline) * 2)
    return {
      id: `risk-${project.id}`,
      projectId: project.id,
      title: `${project.title} delay probability is ${score}%`,
      score,
      severity: score >= 82 ? 'critical' : score >= 64 ? 'high' : score >= 38 ? 'medium' : 'low',
      recommendation: 'Escalate blocked tasks, assign one owner per dependency, and reduce scope within 24 hours.',
      evidence: [`${overdue.length} overdue task(s)`, `${blocked.length} blocked task(s)`, `Deadline: ${project.deadline}`]
    }
  }).filter((risk: any) => risk.score >= 38).sort((a: any, b: any) => b.score - a.score)

  const averageRisk = risks.reduce((sum: number, risk: any) => sum + risk.score, 0) / Math.max(1, risks.length)
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    operationalHealth: clamp(100 - averageRisk * 0.6),
    revenueAtRisk: Math.round(risks.reduce((sum: number, risk: any) => {
      const project = snapshot.projects.find((item: any) => item.id === risk.projectId)
      return sum + (project?.revenueImpact || 0) * (risk.score / 100)
    }, 0)),
    risks,
    nextBestActions: risks.slice(0, 3).map((risk: any) => risk.recommendation)
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/realtime')) {
      const id = env.AI_ROOM.idFromName('global-workspace')
      const room = env.AI_ROOM.get(id)
      return room.fetch(request)
    }

    if (url.pathname === '/api/health') {
      return Response.json({ ok: true, edge: true, services: ['D1', 'R2', 'Durable Objects'], product: 'ABOS Cortex V1' })
    }

    if (url.pathname === '/api/abos/health' || url.pathname === '/api/abos/risks') {
      return Response.json(abosRiskEngine())
    }

    return Response.json({ ok: true, name: 'qassem-ai-os-worker' })
  }
}
