import { describe, expect, it } from "vitest"
import {
  InMemoryAgentMemoryStore,
  MultiAgentRuntime,
  ToolRegistry,
  createAbosWorkflow,
  type AgentTool,
} from "../src"

describe("MultiAgentRuntime", () => {
  it("routes the default ABOS workflow across all agents", async () => {
    const runtime = new MultiAgentRuntime({ providerPreference: ["local"], maxRetries: 0 })
    const result = await runtime.runWorkflow(createAbosWorkflow("Reduce onboarding risk"), { workspaceId: "test-workspace" })

    expect(result.outputs.map((output) => output.agent)).toEqual(["planner", "analyst", "executor", "memory"])
    expect(result.outputs.every((output) => output.status === "completed")).toBe(true)
    expect(result.conversation.taskHistory).toHaveLength(4)
    expect(result.conversation.messages.length).toBeGreaterThanOrEqual(8)
  })

  it("persists and retrieves memory across tasks", async () => {
    const memoryStore = new InMemoryAgentMemoryStore()
    const runtime = new MultiAgentRuntime({ memoryStore, providerPreference: ["local"], maxRetries: 0 })
    const conversation = runtime.createConversation("memory-test")

    await runtime.runTask(
      {
        id: "remember-1",
        type: "remember",
        goal: "Executive sponsor wants a weekly onboarding risk summary.",
        assignedTo: "memory",
      },
      conversation,
      "workspace-a"
    )

    const records = await memoryStore.search("workspace-a", "weekly")

    expect(records).toHaveLength(1)
    expect(records[0]?.content).toContain("Executive sponsor")
  })

  it("supports agent-to-agent messaging", () => {
    const runtime = new MultiAgentRuntime()
    const conversation = runtime.createConversation("messages")

    const message = runtime.sendMessage(conversation, "planner", "analyst", "Please assess revenue exposure.", {
      priority: "high",
    })

    expect(message.from).toBe("planner")
    expect(message.to).toBe("analyst")
    expect(conversation.messages).toContainEqual(message)
    expect(conversation.updatedAt).toBeTruthy()
  })

  it("executes registered tools from the tool registry", async () => {
    const auditTool: AgentTool = {
      name: "record_audit",
      description: "Records an audit event.",
      inputSchema: {
        type: "object",
        properties: {
          action: { type: "string" },
        },
        required: ["action"],
      },
      execute(input) {
        const action = typeof input === "object" && input && "action" in input ? String(input.action) : "unknown"
        return { recorded: action }
      },
    }

    const tools = new ToolRegistry().register(auditTool)
    const runtime = new MultiAgentRuntime({ tools })
    const context = {
      conversation: runtime.createConversation("tools"),
      memory: [],
      memoryStore: new InMemoryAgentMemoryStore(),
      providerPreference: ["local" as const],
      tools,
      workspaceId: "workspace-tools",
    }

    const result = await tools.execute("record_audit", { action: "recovery-started" }, context)

    expect(result).toMatchObject({
      ok: true,
      toolName: "record_audit",
      output: { recorded: "recovery-started" },
    })
  })
})
