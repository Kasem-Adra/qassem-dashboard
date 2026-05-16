import { describe, expect, it } from "vitest"
import { AutonomousTaskEngine, InMemoryRuntimePersistence } from "../src"

describe("AutonomousTaskEngine", () => {
  it("queues tasks by default and runs the agent pipeline", async () => {
    const store = new InMemoryRuntimePersistence()
    const engine = new AutonomousTaskEngine(store)

    const task = await engine.enqueueTask({
      workspaceId: "workspace-1",
      title: "Recover onboarding",
      goal: "Recover delayed onboarding safely",
      priority: "critical",
    })

    expect(task.state).toBe("queued")

    const result = await engine.runTask(task.id)

    expect(result.task.state).toBe("completed")
    expect(result.outputs.map((output) => output.agent)).toEqual(["planner", "executor", "analyst", "memory"])
    expect(await engine.taskHistory(task.id)).toEqual(expect.arrayContaining([expect.objectContaining({ eventType: "task.completed" })]))
    expect(await engine.taskHistory(task.id)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          eventType: "agent.completed",
          payload: expect.objectContaining({ durationMs: expect.any(Number) }),
        }),
      ])
    )
  })

  it("supports scheduled tasks", async () => {
    const store = new InMemoryRuntimePersistence()
    const engine = new AutonomousTaskEngine(store)

    await engine.enqueueTask({
      workspaceId: "workspace-1",
      title: "Future task",
      goal: "Run later",
      scheduledAt: "2999-01-01T00:00:00.000Z",
    })

    expect(await engine.runDueTasks("2026-01-01T00:00:00.000Z")).toHaveLength(0)
  })

  it("stores long-term memory and recalls it", async () => {
    const store = new InMemoryRuntimePersistence()
    const engine = new AutonomousTaskEngine(store)

    const task = await engine.enqueueTask({
      workspaceId: "workspace-1",
      title: "Capture risk",
      goal: "Remember that CRM export blocked onboarding",
    })
    await engine.runTask(task.id)

    const memories = await engine.recallMemory("workspace-1", "CRM")

    expect(memories.length).toBeGreaterThan(0)
    expect(memories[0]?.kind).toBe("long_term")
  })
})
