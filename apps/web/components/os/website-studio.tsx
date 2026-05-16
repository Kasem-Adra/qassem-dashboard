"use client"

import { useEffect, useState } from "react"
import { apiJson } from "../../lib/api-client"
import { defaultWebsiteContent, type WebsiteContent } from "../../lib/website-content"

export function WebsiteStudio() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [status, setStatus] = useState("Website studio is ready.")

  useEffect(() => {
    apiJson<{ content: WebsiteContent }>("/api/site/content", { fallback: { content: defaultWebsiteContent } }).then((data) => setContent(data.content))
  }, [])

  async function saveContent() {
    setStatus("Saving website content...")
    const response = await fetch("/api/site/content", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(content),
    })
    setStatus(response.ok ? "Website content saved." : "Content could not be saved.")
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
      <section className="space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-indigo-700">Content studio</p>
          <h2 className="mt-5 text-4xl font-black tracking-[-.05em] text-slate-950 md:text-5xl">Manage the public website with a polished editorial interface.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">Update hero copy, navigation, proof points, case studies, and calls to action while keeping the live site connected.</p>
        </div>

        <EditorCard title="Hero content" eyebrow="Website">
          <TextField label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => setContent({ ...content, hero: { ...content.hero, eyebrow: value } })} />
          <TextField label="Headline" value={content.hero.title} onChange={(value) => setContent({ ...content, hero: { ...content.hero, title: value } })} />
          <TextArea label="Subtitle" value={content.hero.subtitle} onChange={(value) => setContent({ ...content, hero: { ...content.hero, subtitle: value } })} />
        </EditorCard>

        <EditorCard title="Feature cards" eyebrow="Platform">
          <div className="grid gap-4 md:grid-cols-3">
            {content.features.map((feature, index) => (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={`${feature.title}-${index}`}>
                <TextField label="Title" value={feature.title} onChange={(value) => updateFeature(index, { title: value })} />
                <TextArea label="Description" value={feature.description} onChange={(value) => updateFeature(index, { description: value })} />
              </div>
            ))}
          </div>
        </EditorCard>
      </section>

      <aside className="space-y-6">
        <EditorCard title="Settings" eyebrow="Brand">
          <TextField label="Logo text" value={content.settings.logoText} onChange={(value) => setContent({ ...content, settings: { ...content.settings, logoText: value } })} />
          <TextField label="Announcement" value={content.settings.announcement} onChange={(value) => setContent({ ...content, settings: { ...content.settings, announcement: value } })} />
          <TextField label="Accent" value={content.settings.accent} onChange={(value) => setContent({ ...content, settings: { ...content.settings, accent: value } })} />
          <button className="mt-4 w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white" onClick={saveContent} type="button">Save website</button>
          <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{status}</p>
        </EditorCard>

        <EditorCard title="Preview" eyebrow="Live copy">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-300">{content.hero.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-black tracking-[-.04em]">{content.hero.title}</h3>
            <p className="mt-3 text-xs leading-5 text-slate-300">{content.hero.subtitle}</p>
          </div>
        </EditorCard>
      </aside>
    </div>
  )

  function updateFeature(index: number, patch: Partial<WebsiteContent["features"][number]>) {
    setContent({
      ...content,
      features: content.features.map((feature, featureIndex) => (featureIndex === index ? { ...feature, ...patch } : feature)),
    })
  }
}

function EditorCard({ children, eyebrow, title }: { children: React.ReactNode; eyebrow: string; title: string }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[.18em] text-indigo-600">{eyebrow}</p>
      <h3 className="mt-2 text-xl font-black tracking-tight text-slate-950">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  )
}

function TextField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[.14em] text-slate-400">{label}</span>
      <input className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  )
}

function TextArea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[.14em] text-slate-400">{label}</span>
      <textarea className="mt-2 min-h-28 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-950 outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100" onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  )
}
