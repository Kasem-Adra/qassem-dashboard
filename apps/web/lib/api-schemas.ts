import { z } from "zod"

export const emptyQuerySchema = z.object({}).strict()

export const addMemorySchema = z.object({
  type: z.enum(["incident", "recovery", "note", "decision"]).default("note"),
  title: z.coerce.string().trim().min(1, "title and description are required").max(160),
  description: z.coerce.string().trim().min(1, "title and description are required").max(2000),
})

export const aiStreamSchema = z.object({
  prompt: z.coerce.string().default(""),
  provider: z.enum(["openai", "anthropic", "claude", "gemini", "groq", "local"]).catch("local"),
  workspaceId: z.coerce.string().optional(),
  model: z.coerce.string().optional(),
  memory: z.array(z.coerce.string()).max(12).optional(),
  messages: z
    .array(
      z.object({
        role: z.enum(["system", "user", "assistant", "tool"]),
        content: z.coerce.string(),
        name: z.coerce.string().optional(),
        toolCallId: z.coerce.string().optional(),
      }),
    )
    .max(32)
    .optional(),
  tools: z
    .array(
      z.object({
        name: z.coerce.string().min(1).max(80),
        description: z.coerce.string().max(500),
        inputSchema: z.record(z.string(), z.unknown()),
      }),
    )
    .max(16)
    .optional(),
})

export type AddMemoryInput = z.infer<typeof addMemorySchema>
export type AIStreamInput = z.infer<typeof aiStreamSchema>

export const authLoginSchema = z.object({
  token: z.coerce.string().min(1),
  role: z.enum(["admin", "operator"]).default("admin"),
})

export type AuthLoginInput = z.infer<typeof authLoginSchema>

const safeWebsiteHrefSchema = z.coerce
  .string()
  .min(1)
  .max(300)
  .refine(
    (href) =>
      href.startsWith("/") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      /^https?:\/\//i.test(href),
    "Use a relative, anchor, mail, phone, http, or https link",
  )

const websiteLinkSchema = z.object({
  label: z.coerce.string().min(1).max(80),
  href: safeWebsiteHrefSchema,
})

export const websiteContentSchema = z.object({
  settings: z.object({
    accent: z.coerce.string().min(1).max(40),
    announcement: z.coerce.string().min(1).max(160),
    logoText: z.coerce.string().min(1).max(80),
  }),
  nav: z.array(websiteLinkSchema).min(1).max(8),
  hero: z.object({
    eyebrow: z.coerce.string().min(1).max(120),
    title: z.coerce.string().min(1).max(180),
    subtitle: z.coerce.string().min(1).max(500),
    primaryButton: websiteLinkSchema,
    secondaryButton: websiteLinkSchema,
  }),
  stats: z
    .array(
      z.object({
        value: z.coerce.string().min(1).max(40),
        label: z.coerce.string().min(1).max(80),
      }),
    )
    .min(1)
    .max(6),
  features: z
    .array(
      z.object({
        title: z.coerce.string().min(1).max(120),
        description: z.coerce.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(8),
  caseStudies: z
    .array(
      z.object({
        title: z.coerce.string().min(1).max(120),
        description: z.coerce.string().min(1).max(500),
        metric: z.coerce.string().min(1).max(80),
      }),
    )
    .min(1)
    .max(6),
  cta: z.object({
    title: z.coerce.string().min(1).max(160),
    description: z.coerce.string().min(1).max(500),
    primaryButton: websiteLinkSchema,
  }),
})

export type WebsiteContentInput = z.infer<typeof websiteContentSchema>
export const runtimeCreateTaskSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  title: z.coerce.string().min(1).max(160),
  goal: z.coerce.string().min(1).max(2000),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assignedAgent: z
    .enum(["planner", "analyst", "executor", "memory"])
    .optional(),
  scheduledAt: z.string().datetime().optional(),
  maxAttempts: z.coerce.number().int().min(1).max(10).default(3),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const runtimeTaskIdQuerySchema = z
  .object({
    taskId: z.coerce.string().min(1),
  })
  .strict()

export const runtimeMemoryQuerySchema = z
  .object({
    workspaceId: z.coerce.string().min(1).default("default"),
    query: z.coerce.string().default(""),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  })
  .strict()

export type RuntimeCreateTaskInput = z.infer<typeof runtimeCreateTaskSchema>

export const runtimeWorkspaceQuerySchema = z
  .object({
    workspaceId: z.coerce.string().min(1).default("default"),
  })
  .strict()

export const runtimeControlSchema = z.object({
  taskId: z.coerce.string().min(1),
  action: z.enum(["pause", "resume", "retry", "cancel", "replay"]),
})

export const runtimeRunSchema = z.object({
  taskId: z.coerce.string().min(1).optional(),
  now: z.string().datetime().optional(),
})

export const runtimeWorkflowSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  name: z.coerce.string().min(1).max(120),
  description: z.coerce.string().max(500).optional(),
  definition: z.record(z.string(), z.unknown()),
})

export const runtimeToolSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  name: z.coerce.string().min(1).max(80),
  description: z.coerce.string().min(1).max(500),
  inputSchema: z.record(z.string(), z.unknown()),
  handlerRef: z.coerce.string().max(300).optional(),
})

export const runtimeAgentDefinitionSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  role: z.enum(["planner", "analyst", "executor", "memory"]),
  description: z.coerce.string().min(1).max(500),
  systemPrompt: z.coerce.string().min(1).max(4000),
  tools: z.array(z.coerce.string()).max(32).default([]),
})

export const runtimeHookSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  eventType: z.coerce.string().min(1).max(120),
  targetUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const runtimeRoleSchema = z.object({
  workspaceId: z.coerce.string().min(1).default("default"),
  name: z.enum(["admin", "operator"]),
  scopes: z.array(z.coerce.string().min(1).max(80)).min(1).max(32),
})
