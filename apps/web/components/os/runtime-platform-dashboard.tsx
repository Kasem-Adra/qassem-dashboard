"use client"

import { apiEventSource, apiJson } from "../../lib/api-client"
import { useEffect, useMemo, useState, type ReactNode } from "react"

type RuntimeTask = {
  id: string
  title: string
  goal: string
  priority: string
  state: string
  assignedAgent?: string
  attempts: number
  maxAttempts: number
  updatedAt: string
}

type RuntimeLog = {
  id: string
  taskId: string
  eventType: string
  agent?: string
  message: string
  payload?: Record<string, unknown>
  createdAt: string
}

type RuntimeMemory = {
  id: string
  kind: string
  content: string
  entityType?: string
  entityId?: string
}

type RuntimeOverview = {
  tasks: RuntimeTask[]
  logs: RuntimeLog[]
  metrics: {
    queued?: number
    running?: number
    completed?: number
    failures?: number
    agentTiming?: Array<{ agent?: string; taskId: string; durationMs: number; createdAt: string }>
  }
  memories: RuntimeMemory[]
  snapshots?: Array<Record<string, unknown>>
  workflows?: Array<Record<string, unknown>>
  tools?: Array<Record<string, unknown>>
  agentDefinitions?: Array<Record<string, unknown>>
  hooks?: Array<Record<string, unknown>>
  roles?: Array<Record<string, unknown>>
}

const fallbackOverview: RuntimeOverview = {
  tasks: [],
  logs: [],
  metrics: { queued: 0, running: 0, completed: 0, failures: 0, agentTiming: [] },
  memories: [],
  snapshots: [],
  workflows: [],
  tools: [],
  agentDefinitions: [],
  hooks: [],
  roles: [],
}

const controls = ["pause", "resume", "retry", "cancel", "replay"] as const
const streamEventTypes = ["task.created", "task.started", "agent.completed", "task.completed", "task.failed", "task.controlled", "memory.created", "error"]

async function fetchOverview() {
  return apiJson<RuntimeOverview>("/api/abos/runtime/overview?workspaceId=default", { fallback: fallbackOverview })
}

function shortTime(value: string) {
  return value ? value.replace("T", " ").slice(0, 19) : "pending"
}

export function RuntimePlatformDashboard() {
  const [overview, setOverview] = useState<RuntimeOverview>(fallbackOverview)
  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [adminToken, setAdminToken] = useState("")
  const [streamEvents, setStreamEvents] = useState<RuntimeLog[]>([])
  const [status, setStatus] = useState("Idle")

  useEffect(() => {
    let mounted = true

    fetchOverview().then((data) => {
      if (!mounted) return
      setOverview(data)
      setSelectedTaskId((current) => current || data.tasks[0]?.id || "")
    })

    const interval = window.setInterval(() => {
      fetchOverview().then((data) => {
        if (mounted) setOverview(data)
      })
    }, 8000)

    return () => {
      mounted = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!selectedTaskId) return

    const stream = apiEventSource(`/api/abos/runtime/stream?taskId=${encodeURIComponent(selectedTaskId)}`)
    const handleEvent = (event: MessageEvent<string>) => {
      try {
        setStreamEvents((current) => [JSON.parse(event.data) as RuntimeLog, ...current].slice(0, 24))
      } catch {
        setStatus("Stream event could not be parsed")
      }
    }

    streamEventTypes.forEach((eventType) => stream.addEventListener(eventType, handleEvent))
    stream.addEventListener("error", () => setStatus("Stream waiting for events"))

    return () => {
      streamEventTypes.forEach((eventType) => stream.removeEventListener(eventType, handleEvent))
      stream.close()
    }
  }, [selectedTaskId])

  const selectedTask = useMemo(
    () => overview.tasks.find((task) => task.id === selectedTaskId) ?? overview.tasks[0],
    [overview.tasks, selectedTaskId]
  )

  async function sendControl(action: (typeof controls)[number]) {
    if (!selectedTask?.id) return
    setStatus(`${action} requested`)

    const response = await fetch("/api/abos/runtime/control", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(adminToken ? { "x-abos-admin-token": adminToken } : {}),
      },
      body: JSON.stringify({ taskId: selectedTask.id, action }),
    })

    setStatus(response.ok ? `${action} accepted` : `${action} failed`)
    setOverview(await fetchOverview())
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[.25em] text-[#00a4aa]">Runtime Platform</p>
        <h2 className="mt-2 text-2xl font-bold">Developer Console</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Tasks, agents, memory, logs, controls, and live execution events.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Metric label="Queued" value={overview.metrics.queued ?? 0} />
        <Metric label="Running" value={overview.metrics.running ?? 0} />
        <Metric label="Done" value={overview.metrics.completed ?? 0} />
        <Metric label="Failed" value={overview.metrics.failures ?? 0} />
      </div>

      <Panel title="Runtime Controls">
        <input
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          onChange={(event) => setAdminToken(event.target.value)}
          placeholder="ABOS admin token for protected actions"
          type="password"
          value={adminToken}
        />
        <div className="mt-3 grid grid-cols-2 gap-2">
          {controls.map((control) => (
            <button
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm capitalize text-slate-700 transition hover:bg-slate-100"
              disabled={!selectedTask}
              key={control}
              onClick={() => sendControl(control)}
              type="button"
            >
              {control}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">{status}</p>
      </Panel>

      <Panel title="Task Queue">
        <div className="space-y-2">
          {overview.tasks.length === 0 && <EmptyLine text="No runtime tasks yet." />}
          {overview.tasks.map((task) => (
            <button
              className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                task.id === selectedTask?.id ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-slate-50 hover:bg-slate-50"
              }`}
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-950">{task.title}</span>
                <span className="rounded-full border border-slate-200 px-2 py-1 text-[11px] uppercase text-slate-600">{task.state}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{task.goal}</p>
              <p className="mt-2 text-[11px] text-slate-500">
                {task.priority} · {task.assignedAgent ?? "auto"} · {task.attempts}/{task.maxAttempts}
              </p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Agent Execution Monitor">
        <div className="space-y-2">
          {(overview.metrics.agentTiming ?? []).slice(0, 8).map((timing) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={`${timing.taskId}-${timing.createdAt}-${timing.agent}`}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-950">{timing.agent ?? "agent"}</span>
                <span className="text-[#007a7f]">{timing.durationMs}ms</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{shortTime(timing.createdAt)}</p>
            </div>
          ))}
          {(overview.metrics.agentTiming ?? []).length === 0 && <EmptyLine text="Agent timing appears after task execution." />}
        </div>
      </Panel>

      <Panel title="Memory Graph Inspector">
        <div className="space-y-2">
          {overview.memories.slice(0, 8).map((memory) => (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={memory.id}>
              <p className="text-xs uppercase tracking-[.2em] text-emerald-700">{memory.kind}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{memory.content}</p>
              <p className="mt-2 text-xs text-slate-500">{memory.entityType ?? "entity"}:{memory.entityId ?? memory.id}</p>
            </div>
          ))}
          {overview.memories.length === 0 && <EmptyLine text="No memory nodes found." />}
        </div>
      </Panel>

      <Panel title="Runtime Logs">
        <LogList logs={overview.logs} />
      </Panel>

      <Panel title="Streaming Events">
        <LogList logs={streamEvents} />
        {!selectedTask && <EmptyLine text="Select a task to open its event stream." />}
      </Panel>

      <Panel title="Developer APIs">
        <div className="grid gap-2 text-xs text-slate-600">
          <ApiRow label="Workflows" value={overview.workflows?.length ?? 0} />
          <ApiRow label="Custom tools" value={overview.tools?.length ?? 0} />
          <ApiRow label="Agent definitions" value={overview.agentDefinitions?.length ?? 0} />
          <ApiRow label="Runtime hooks" value={overview.hooks?.length ?? 0} />
          <ApiRow label="Snapshots" value={overview.snapshots?.length ?? 0} />
          <ApiRow label="Roles" value={overview.roles?.length ?? 0} />
        </div>
      </Panel>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-[.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  )
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">{text}</p>
}

function LogList({ logs }: { logs: RuntimeLog[] }) {
  return (
    <div className="space-y-2">
      {logs.slice(0, 10).map((log) => (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3" key={log.id}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-[#007a7f]">{log.eventType}</p>
            <p className="text-[11px] text-slate-500">{shortTime(log.createdAt)}</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{log.message}</p>
        </div>
      ))}
      {logs.length === 0 && <EmptyLine text="No events yet." />}
    </div>
  )
}

function ApiRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <span>{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  )
}
