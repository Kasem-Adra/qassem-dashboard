import { ReactNode } from 'react'
import { CommandPalette } from './command-palette'

const modules = ['AI Studio', 'Theme Studio', 'CMS Studio', 'Media Center', 'Analytics', 'Security', 'Plugins']
const surfaces = [
  ['Streaming AI Interface', 'Live SSE route with provider router foundation'],
  ['Realtime Presence', 'Durable Objects-ready collaboration contracts'],
  ['Theme Token Preview', 'Runtime CSS variables and cinematic tokens'],
  ['Cloudflare Edge Status', 'D1 + R2 bindings ready for production']
]

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.28),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,.18),transparent_35%)] p-4 md:p-6">
      <CommandPalette />
      <div className="grid min-h-[calc(100vh-3rem)] grid-cols-1 gap-4 rounded-[2rem] border border-white/10 bg-black/25 p-3 shadow-cinematic backdrop-blur-2xl lg:grid-cols-[280px_1fr_390px]">
        <aside className="rounded-[1.5rem] border border-white/10 bg-white/[.045] p-4">
          <div className="mb-6 rounded-2xl border border-violet-300/20 bg-violet-300/10 p-4">
            <p className="text-xs uppercase tracking-[.3em] text-violet-200">Workspace OS</p>
            <h2 className="mt-2 text-2xl font-bold">Command Center</h2>
            <p className="mt-2 text-xs text-slate-400">Press ⌘K to open the universal command layer.</p>
          </div>
          <nav className="space-y-2">
            {modules.map((module) => (
              <button key={module} className="w-full rounded-2xl px-4 py-3 text-left text-sm text-slate-300 transition hover:bg-white/10 hover:text-white">
                {module}
              </button>
            ))}
          </nav>
        </aside>
        <section className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[.035] p-5">
          <div className="absolute right-8 top-8 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
          <div className="relative mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[.3em] text-slate-500">Live Surface</p>
              <h1 className="text-4xl font-bold tracking-[-.05em]">AI Workspace Runtime</h1>
            </div>
            <kbd className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-300">⌘K</kbd>
          </div>
          <div className="relative grid gap-4 md:grid-cols-2">
            {surfaces.map(([title, description]) => (
              <article key={title} className="min-h-44 rounded-3xl border border-white/10 bg-slate-950/45 p-5 transition hover:-translate-y-1 hover:bg-slate-900/70">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </section>
        <aside className="rounded-[1.5rem] border border-white/10 bg-white/[.045] p-4">{children}</aside>
      </div>
    </main>
  )
}
