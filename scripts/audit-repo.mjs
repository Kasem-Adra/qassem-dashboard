import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const forbiddenDirs = new Set(['node_modules', '.next', '.turbo', '.wrangler', 'dist', 'coverage'])
const secretPatterns = [/npg_[A-Za-z0-9]+/, /postgres(?:ql)?:\/\/(?!USER:PASSWORD@HOST)[^\s]+@[^\s]+/, /sk-[A-Za-z0-9_-]{20,}/]
const findings = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      if (forbiddenDirs.has(name)) findings.push(`Generated directory should not be committed: ${path}`)
      if (!forbiddenDirs.has(name)) walk(path)
      continue
    }
    if (!stat.isFile()) continue
    if (stat.size > 1024 * 1024) findings.push(`Large file above 1MB: ${path}`)
    if (/\.(ts|tsx|js|mjs|json|md|env|example|toml|sql)$/i.test(name)) {
      const text = readFileSync(path, 'utf8')
      for (const pattern of secretPatterns) {
        if (pattern.test(text) && !path.endsWith('.env.example')) findings.push(`Possible secret in: ${path}`)
      }
    }
  }
}

if (!existsSync('package.json')) {
  console.error('Run this script from the repository root.')
  process.exit(1)
}

walk(process.cwd())
if (findings.length) {
  console.error(findings.join('\n'))
  process.exit(1)
}
console.log('Repository audit passed: no generated directories, large files, or obvious secrets found.')
