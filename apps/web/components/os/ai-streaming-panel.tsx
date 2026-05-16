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

    const response = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, provider: 'local' })
    })

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    if (!reader) return setLoading(false)

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
        const payload = JSON.parse(dataLine.slice(6))
        if (payload.token) setTokens((current) => [...current, payload.token])
      }
    }
    setLoading(false)
  }

  return (
    <section className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-xs uppercase tracking-[.28em] text-violet-200">AI Runtime</p>
        <h2 className="mt-2 text-xl font-bold">Streaming Copilot</h2>
      </div>
      <div className="mt-4 flex-1 space-y-3 overflow-auto rounded-3xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
        {tokens.length === 0 && <p className="text-slate-500">Ready for edge streaming...</p>}
        {tokens.map((token, index) => <p key={`${token}-${index}`}>{token}</p>)}
      </div>
      <form onSubmit={run} className="mt-4 space-y-3">
        <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="min-h-24 w-full rounded-3xl border border-white/10 bg-white/[.06] p-4 text-sm outline-none ring-violet-400/30 transition focus:ring-4" />
        <button disabled={loading} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:scale-[1.01] disabled:opacity-50">
          {loading ? 'Streaming...' : 'Run AI Stream'}
        </button>
      </form>
    </section>
  )
}
