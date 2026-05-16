'use client'

import { useEffect, useMemo, useState } from 'react'

const commands = [
  { id: 'ai.prompt', title: 'Run prompt', shortcut: '⌘⇧P', group: 'AI' },
  { id: 'theme.open', title: 'Edit theme', shortcut: '⌘T', group: 'Design' },
  { id: 'workspace.snapshot', title: 'Save snapshot', shortcut: '⌘S', group: 'Workspace' },
  { id: 'realtime.room', title: 'Open collaboration', shortcut: '⌘R', group: 'Live' },
  { id: 'media.upload', title: 'Upload asset', shortcut: '⌘U', group: 'Media' },
  { id: 'security.audit', title: 'View audit log', shortcut: '⌘A', group: 'Security' }
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = useMemo(() => {
    const needle = query.toLowerCase()
    return commands.filter((command) => command.title.toLowerCase().includes(needle) || command.group.toLowerCase().includes(needle))
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-slate-950/30 px-4 pt-24 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-slate-200 p-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actions, themes, files..."
            className="w-full bg-transparent text-lg text-slate-950 outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-96 overflow-auto p-2">
          {filtered.map((command) => (
            <button key={command.id} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-slate-100">
              <span>
                <span className="block text-sm font-medium text-slate-950">{command.title}</span>
                <span className="text-xs text-slate-500">{command.group}</span>
              </span>
              <kbd className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500">{command.shortcut}</kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
