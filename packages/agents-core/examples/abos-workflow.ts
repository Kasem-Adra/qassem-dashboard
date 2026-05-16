import { MultiAgentRuntime, createAbosWorkflow } from "../src"

export async function runOperationalRecoveryExample() {
  const runtime = new MultiAgentRuntime({
    providerPreference: ["openai", "anthropic", "local"],
    workspaceId: "qassem-demo",
  })

  const workflow = createAbosWorkflow("Recover delayed enterprise onboarding without increasing revenue risk")
  return runtime.runWorkflow(workflow, { workspaceId: "qassem-demo" })
}

export async function runMemoryFirstExample() {
  const runtime = new MultiAgentRuntime({
    providerPreference: ["local"],
  })
  const conversation = runtime.createConversation("example-conversation")

  await runtime.runTask(
    {
      id: "remember-client-risk",
      type: "remember",
      goal: "Client onboarding risk was caused by missing CRM export ownership.",
      assignedTo: "memory",
    },
    conversation,
    "qassem-demo"
  )

  return runtime.runTask(
    {
      id: "plan-recovery",
      type: "plan",
      goal: "Plan the next onboarding recovery action using stored memory.",
      assignedTo: "planner",
    },
    conversation,
    "qassem-demo"
  )
}
