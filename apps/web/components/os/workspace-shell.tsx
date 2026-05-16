import type { ReactNode } from 'react'

const navItems = [
  { label: 'Overview', href: '/dashboard', badge: 'Live' },
  { label: 'Runtime', href: '/runtime', badge: 'Ops' },
  { label: 'Studio', href: '/workspace', badge: 'AI' },
  { label: 'Content', href: '/', badge: 'Site' },
  { label: 'Settings', href: '#settings', badge: 'New' },
]

const quickStats = [
  ['Health', '92%'],
  ['Tasks', '18'],
  ['SLA', '99.9%'],
]

export function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f5f6fa] text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[288px_1fr]">
        <aside className="sticky top-0 hidden h-screen flex-col border-r border-slate-200/80 bg-white/85 px-4 py-5 backdrop-blur-2xl lg:flex">
          <a className="flex items-center gap-3 rounded-2xl px-2 py-2" href="/dashboard" aria-label="Qassem Cloud dashboard">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-sm">Q</span>
            <span>
              <span className="block text-sm font-black tracking-tight text-slate-950">Qassem Cloud</span>
              <span className="block text-xs font-medium text-slate-500">Premium workspace</span>
            </span>
          </a>

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3">
            <div className="grid grid-cols-3 gap-2">
              {quickStats.map(([label, value]) => (
                <div className="rounded-2xl bg-white p-3 text-center shadow-sm" key={label}>
                  <p className="text-sm font-black tracking-tight text-slate-950">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <nav className="mt-6 space-y-1" aria-label="Workspace navigation">
            {navItems.map((item, index) => (
              <a
                className={`group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  index === 0 ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
                href={item.href}
                key={item.label}
              >
                <span className="flex items-center gap-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${index === 0 ? 'bg-indigo-400' : 'bg-slate-300 group-hover:bg-indigo-400'}`} />
                  {item.label}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-[.12em] ${index === 0 ? 'bg-white/10 text-white' : 'bg-white text-slate-400'}`}>{item.badge}</span>
              </a>
            ))}
          </nav>

          <div className="mt-auto rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm" id="settings">
            <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">Settings</p>
            <h2 className="mt-3 text-sm font-black tracking-tight text-slate-950">Workspace controls</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">Manage roles, billing, publishing, integrations, and approval rules from one consistent settings area.</p>
            <button className="mt-4 w-full rounded-2xl bg-slate-950 px-3 py-2 text-xs font-black text-white" type="button">Configure</button>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 px-5 py-4 backdrop-blur-2xl lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-indigo-600">Command center</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-.035em] text-slate-950 md:text-3xl">Operate every surface from one place</h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden min-w-72 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-500 md:block">Search projects, tasks, risks, and content...</div>
                <kbd className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 shadow-sm">⌘K</kbd>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Online</span>
              </div>
            </div>
          </header>

          <div className="p-5 lg:p-8">{children}</div>
        </section>
      </div>
    </main>
  )
}
