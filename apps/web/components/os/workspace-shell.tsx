import { CommandPalette } from './command-palette'
import { ReactNode } from 'react'

const modules = ['Assistant', 'Content', 'Theme', 'Media', 'Analytics', 'Security', 'Settings']
const surfaces = [
  ['Assistant', 'Draft prompts and review streamed responses.'],
  ['Content', 'Manage homepage sections, links, and cards.'],
  ['Theme', 'Preview colors, spacing, and motion.'],
  ['Status', 'Review connected services and storage.']
]

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <CommandPalette />
      <div className="grid min-h-screen lg:grid-cols-[264px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-4 py-5">
          <div className="flex items-center gap-3 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-sm font-semibold text-white">Q</div>
            <div>
              <p className="text-sm font-semibold tracking-tight">Qassem Studio</p>
              <p className="text-xs text-slate-500">Workspace</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1" aria-label="Workspace navigation">
            {modules.map((module, index) => (
              <button
                key={module}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  index === 0 ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
                type="button"
              >
                <span>{module}</span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-700">Workspace</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Build, review, and publish.</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden min-w-72 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:block">Search content, agents, workflows...</div>
                <kbd className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-500 shadow-sm">⌘K</kbd>
              </div>
            </div>
          </header>

          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_420px] lg:p-8">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">Canvas</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Core surfaces</h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">Ready</span>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {surfaces.map(([title, description]) => (
                  <article key={title} className="min-h-40 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-700">{title.slice(0, 2)}</div>
                    <p className="mt-4 text-base font-semibold text-slate-950">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="min-h-[620px] rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">{children}</aside>
          </div>
        </section>
      </div>
    </main>
  )
}
