"use client"

import { useEffect, useMemo, useState } from "react"
import { apiEventSource, apiJson } from "../../lib/api-client"

type RuntimeTask = {
  id: string
  title: string
  goal: string
  priority: string
  state: string
  assignedAgent?: string
  attempts: number
  maxAttempts: number
  updatedAt?: string
}

type RuntimeLog = { id: string; eventType: string; agent?: string; message: string; createdAt: string }
type RuntimeMemory = { id: string; kind: string; content: string; createdAt: string }
type RuntimeOverview = {
  metrics: { queued?: number; running?: number; completed?: number; failures?: number; agentTiming?: Array<{ taskId: string; agent?: string; durationMs: number; createdAt: string }> }
  tasks: RuntimeTask[]
  logs: RuntimeLog[]
  memory: RuntimeMemory[]
}

const fallbackOverview: RuntimeOverview = {
  metrics: { queued: 8, running: 3, completed: 128, failures: 1, agentTiming: [] },
  tasks: [
    { id: "task_launch", title: "Prepare launch checklist", goal: "Confirm content, approvals, and publish window.", priority: "high", state: "running", assignedAgent: "Launch Ops", attempts: 1, maxAttempts: 3 },
    { id: "task_copy", title: "Review homepage copy", goal: "Finalize professional SaaS positioning for the public site.", priority: "medium", state: "queued", assignedAgent: "Content Lead", attempts: 0, maxAttempts: 2 },
  ],
  logs: [{ id: "log_1", eventType: "task.updated", agent: "Launch Ops", message: "Publish checklist moved into review.", createdAt: new Date().toISOString() }],
  memory: [{ id: "mem_1", kind: "note", content: "Executive dashboard redesign is connected to runtime status.", createdAt: new Date().toISOString() }],
}

export function RuntimePlatformDashboard() {
  const [overview, setOverview] = useState<RuntimeOverview>(fallbackOverview)
  const [selectedTaskId, setSelectedTaskId] = useState(fallbackOverview.tasks[0]?.id)
  const [adminToken, setAdminToken] = useState("")
  const [status, setStatus] = useState("Runtime controls are ready.")
  const [eventStatus, setEventStatus] = useState("Listening for execution events.")

  useEffect(() => {
    fetchOverview().then((data) => {
      setOverview(data)
      setSelectedTaskId((current) => current ?? data.tasks[0]?.id)
    })
  }, [])

  useEffect(() => {
    const source = apiEventSource("/api/abos/runtime/stream")
    source.onmessage = (event) => {
      const payload = JSON.parse(event.data) as { message?: string; type?: string }
      setEventStatus(payload.message ?? payload.type ?? "Runtime event received.")
      fetchOverview().then(setOverview)
    }
    source.onerror = () => setEventStatus("Realtime stream is reconnecting.")
    return () => source.close()
  }, [])

  const selectedTask = useMemo(() => overview.tasks.find((task) => task.id === selectedTaskId) ?? overview.tasks[0], [overview.tasks, selectedTaskId])

  async function sendControl(action: string) {
    if (!selectedTask?.id) return
    setStatus(`${action} requested for ${selectedTask.title}.`)
    const response = await fetch("/api/abos/runtime/control", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(adminToken ? { "x-abos-admin-token": adminToken } : {}),
      },
      body: JSON.stringify({ taskId: selectedTask.id, action }),
    })
    setStatus(response.ok ? `${action} accepted.` : `${action} could not be completed.`)
    setOverview(await fetchOverview())
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-indigo-700">Runtime console</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-.05em] text-slate-950 md:text-5xl">Monitor agents, task queues, and automation health.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">A redesigned developer-grade operations console with premium cards, clear controls, tables, and connected runtime data.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            <Metric label="Queued" value={overview.metrics.queued ?? 0} />
            <Metric label="Running" value={overview.metrics.running ?? 0} />
            <Metric label="Completed" value={overview.metrics.completed ?? 0} />
            <Metric label="Failed" value={overview.metrics.failures ?? 0} />
          </div>
        </div>

        <Panel title="Task pipeline" eyebrow="Queue">
          <div className="overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[.14em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Attempts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {overview.tasks.length === 0 ? (
                  <tr><td className="px-4 py-8 text-center text-sm text-slate-500" colSpan={4}>No runtime tasks yet.</td></tr>
                ) : overview.tasks.map((task) => (
                  <tr className={`cursor-pointer transition hover:bg-slate-50 ${task.id === selectedTask?.id ? "bg-indigo-50/60" : ""}`} key={task.id} onClick={() => setSelectedTaskId(task.id)}>
                    <td className="px-4 py-4">
                      <p className="font-black text-slate-950">{task.title}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.goal}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{task.assignedAgent ?? "Auto"}</td>
                    <td className="px-4 py-4"><Status label={task.state} /></td>
                    <td className="px-4 py-4 text-slate-500">{task.attempts}/{task.maxAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Execution logs" eyebrow="Events">
            <div className="space-y-3">
              {overview.logs.slice(0, 6).map((log) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-4" key={log.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-slate-950">{log.eventType}</p>
                    <span className="text-xs text-slate-400">{shortTime(log.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{log.message}</p>
                </div>
              ))}
              {overview.logs.length === 0 && <EmptyState title="No logs yet" description="Execution details appear after agents run." />}
            </div>
          </Panel>

          <Panel title="Runtime memory" eyebrow="Context">
            <div className="space-y-3">
              {overview.memory.slice(0, 6).map((memory) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-4" key={memory.id}>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-indigo-600">{memory.kind}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{memory.content}</p>
                </div>
              ))}
              {overview.memory.length === 0 && <EmptyState title="No memory stored" description="Important context will be saved here." />}
            </div>
          </Panel>
        </div>
      </section>

      <aside className="space-y-6">
        <Panel title="Task controls" eyebrow="Admin">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">{selectedTask?.title ?? "Select a task"}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{selectedTask?.goal ?? "Choose a task from the pipeline to enable controls."}</p>
          </div>
          <input className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" onChange={(event) => setAdminToken(event.target.value)} placeholder="Admin token" type="password" value={adminToken} />
          <div className="mt-3 grid grid-cols-2 gap-2">
            {['pause', 'resume', 'cancel', 'retry'].map((action) => (
              <button className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-black capitalize text-slate-700 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50" disabled={!selectedTask} key={action} onClick={() => sendControl(action)} type="button">
                {action}
              </button>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{status}</p>
        </Panel>

        <Panel title="Realtime status" eyebrow="Stream">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-black">{eventStatus}</p>
            <p className="mt-2 text-xs leading-5 text-slate-300">Runtime updates refresh this console automatically when connected.</p>
          </div>
        </Panel>

        <Panel title="Empty state pattern" eyebrow="Design system">
          <EmptyState title="No approvals pending" description="When a workflow needs review, the action will appear with owner, priority, and due date." />
        </Panel>
      </aside>
    </div>
  )
}

async function fetchOverview() {
  return apiJson<RuntimeOverview>("/api/abos/runtime/overview", { fallback: fallbackOverview })
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.14em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-[-.04em] text-slate-950">{value}</p>
    </div>
  )
}

function Panel({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  )
}

function Status({ label }: { label: string }) {
  return <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-black capitalize text-indigo-700">{label}</span>
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  )
}

function shortTime(value?: string) {
  if (!value) return "Now"
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(value))
}
