'use client'

import { FormEvent, useState } from 'react'

export function AIStreamingPanel() {
  const [prompt, setPrompt] = useState('Design the next AI OS workflow.')
  const [tokens, setTokens] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  async function run(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setTokens([])

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, provider: 'local' })
      })

      if (!response.ok) return

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return

      let buffer = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''
        for (const eventBlock of events) {
          const dataLine = eventBlock.split('\n').find((line) => line.startsWith('data: '))
          if (!dataLine) continue

          try {
            const payload = JSON.parse(dataLine.slice(6)) as { token?: unknown }
            if (typeof payload.token === 'string') {
              const token = payload.token
              setTokens((current) => [...current, token])
            }
          } catch {
            // Ignore malformed stream frames and keep consuming later chunks.
          }
        }
      }
    } catch {
      // Keep the existing empty state visible when the stream cannot be reached.
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-4">
      <div>
        <p className="text-xs uppercase tracking-[.28em] text-[#00a4aa]">AI Runtime</p>
        <h2 className="mt-2 text-xl font-bold">Streaming Copilot</h2>
      </div>
      <div className="mt-4 flex-1 space-y-3 overflow-auto rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        {tokens.length === 0 && <p className="text-slate-500">Ready for edge streaming...</p>}
        {tokens.map((token, index) => <p key={`${token}-${index}`}>{token}</p>)}
      </div>
      <form onSubmit={run} className="mt-4 space-y-3">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-950 outline-none ring-cyan-200 transition placeholder:text-slate-400 focus:bg-white focus:ring-4" />
        <button disabled={loading} className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-50">
          {loading ? 'Streaming...' : 'Run AI Stream'}
        </button>
      </form>
    </section>
  )
}
