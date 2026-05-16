import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { defineConfig } from "drizzle-kit"

function loadLocalEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key]) continue

    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "")
  }
}

loadLocalEnv()

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  strict: true,
  verbose: true,
})
