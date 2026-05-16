'use client'

import { useEffect, useMemo, useState } from 'react'

const commands = [
  { id: 'ai.prompt', title: 'Launch AI Prompt', shortcut: '⌘⇧P', group: 'AI' },
  { id: 'theme.open', title: 'Open Theme Studio', shortcut: '⌘T', group: 'Design' },
  { id: 'workspace.snapshot', title: 'Create Workspace Snapshot', shortcut: '⌘S', group: 'Workspace' },
  { id: 'realtime.room', title: 'Open Collaboration Room', shortcut: '⌘R', group: 'Realtime' },
  { id: 'media.upload', title: 'Upload Asset to R2', shortcut: '⌘U', group: 'Media' },
  { id: 'security.audit', title: 'View Audit Log', shortcut: '⌘A', group: 'Security' }
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
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/50 px-4 pt-24 backdrop-blur-xl" onClick={() => setOpen(false)}>
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-slate-950/95 shadow-cinematic" onClick={(event) => event.stopPropagation()}>
        <div className="border-b border-white/10 p-4">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands, AI actions, themes, files..."
            className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="max-h-96 overflow-auto p-2">
          {filtered.map((command) => (
            <button key={command.id} className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition hover:bg-white/10">
              <span>
                <span className="block text-sm font-medium text-white">{command.title}</span>
                <span className="text-xs text-slate-500">{command.group}</span>
              </span>
              <kbd className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">{command.shortcut}</kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
