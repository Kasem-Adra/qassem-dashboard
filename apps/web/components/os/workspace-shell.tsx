import { CommandPalette } from './command-palette'
import { ReactNode } from 'react'

const modules = ['AI Studio', 'Theme Studio', 'CMS Studio', 'Media Center', 'Analytics', 'Security', 'Plugins']
const surfaces = [
  ['Streaming AI Interface', 'Live SSE route with provider router foundation'],
  ['Realtime Presence', 'Durable Objects-ready collaboration contracts'],
  ['Theme Token Preview', 'Runtime CSS variables and cinematic tokens'],
  ['Cloudflare Edge Status', 'D1 + R2 bindings ready for production']
]

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <CommandPalette />
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-5 py-6">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#00b3b8] text-lg font-black text-white shadow-sm">Q</div>
            <div>
              <p className="text-sm font-bold text-slate-950">Qassem OS</p>
              <p className="text-xs text-slate-500">Workspace runtime</p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#007a7f]">Workspace OS</p>
            <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">Command Center</h2>
            <p className="mt-2 text-xs leading-5 text-slate-600">Press ⌘K to open the universal command layer.</p>
          </div>

          <nav className="mt-6 space-y-1">
            {modules.map((module, index) => (
              <button
                key={module}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0 ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
                type="button"
              >
                <span>{module}</span>
                {index === 0 && <span className="h-2 w-2 rounded-full bg-[#00d5dc]" />}
              </button>
            ))}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-[#00a4aa]">Live Surface</p>
                <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 md:text-3xl">AI Workspace Runtime</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden min-w-64 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 md:block">Search content, agents, and workflows...</div>
                <kbd className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm">⌘K</kbd>
              </div>
            </div>
          </header>

          <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[1fr_420px] lg:p-8">
            <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-[#00a4aa]">Workspace canvas</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Operational surfaces</h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">All systems ready</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {surfaces.map(([title, description]) => (
                  <article key={title} className="min-h-44 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfeff] text-sm font-black text-[#007a7f]">{title.slice(0, 2)}</div>
                    <p className="mt-4 text-base font-black text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="min-h-[620px] rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">{children}</aside>
          </div>
        </section>
      </div>
    </main>
  )
}
