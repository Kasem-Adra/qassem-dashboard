"use client"

import { useEffect, useState } from "react"
import { apiJson } from "../../lib/api-client"
import { defaultWebsiteContent, type WebsiteContent } from "../../lib/website-content"

export function WebsiteStudio() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [adminToken, setAdminToken] = useState("")
  const [status, setStatus] = useState("Draft ready")

  useEffect(() => {
    apiJson<{ content: WebsiteContent }>("/api/site/content", { fallback: { content: defaultWebsiteContent } }).then((data) => setContent(data.content))
  }, [])

  async function publish() {
    setStatus("Publishing website content...")
    const response = await fetch("/api/site/content", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        ...(adminToken ? { "x-abos-admin-token": adminToken } : {}),
      },
      body: JSON.stringify(content),
    })

    setStatus(response.ok ? "Website content published" : "Publish failed — check admin token")
  }

  function updateHero(field: keyof WebsiteContent["hero"], value: string) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [field]: value } }))
  }

  function updateSetting(field: keyof WebsiteContent["settings"], value: string) {
    setContent((current) => ({ ...current, settings: { ...current.settings, [field]: value } }))
  }

  function updateFeature(index: number, field: "title" | "description", value: string) {
    setContent((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) => (featureIndex === index ? { ...feature, [field]: value } : feature)),
    }))
  }

  function updateCaseStudy(index: number, field: "title" | "description" | "metric", value: string) {
    setContent((current) => ({
      ...current,
      caseStudies: current.caseStudies.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }))
  }

  function updateCta(field: keyof WebsiteContent["cta"], value: string) {
    setContent((current) => ({ ...current, cta: { ...current.cta, [field]: value } }))
  }

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#00a4aa]">Website Studio</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Public website control plane</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Hero copy, navigation tone, feature cards, proof cards, CTA text, buttons, and visual settings are controlled here and served by the public website API.</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-80">
          <input className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:bg-white" onChange={(event) => setAdminToken(event.target.value)} placeholder="Admin token to publish" type="password" value={adminToken} />
          <button className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800" onClick={publish} type="button">Publish website</button>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <EditorCard title="Brand and hero">
          <Field label="Logo text" value={content.settings.logoText} onChange={(value) => updateSetting("logoText", value)} />
          <Field label="Announcement" value={content.settings.announcement} onChange={(value) => updateSetting("announcement", value)} />
          <Field label="Accent color" value={content.settings.accent} onChange={(value) => updateSetting("accent", value)} />
          <Field label="Hero eyebrow" value={content.hero.eyebrow} onChange={(value) => updateHero("eyebrow", value)} />
          <Field label="Hero title" value={content.hero.title} onChange={(value) => updateHero("title", value)} textarea />
          <Field label="Hero subtitle" value={content.hero.subtitle} onChange={(value) => updateHero("subtitle", value)} textarea />
        </EditorCard>

        <EditorCard title="Feature cards">
          {content.features.map((feature, index) => (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3" key={`${feature.title}-${index}`}>
              <Field label={`Feature ${index + 1} title`} value={feature.title} onChange={(value) => updateFeature(index, "title", value)} />
              <Field label="Description" value={feature.description} onChange={(value) => updateFeature(index, "description", value)} textarea />
            </div>
          ))}
        </EditorCard>

        <EditorCard title="Proof cards">
          {content.caseStudies.map((item, index) => (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3" key={`${item.title}-${index}`}>
              <Field label="Metric" value={item.metric} onChange={(value) => updateCaseStudy(index, "metric", value)} />
              <Field label="Title" value={item.title} onChange={(value) => updateCaseStudy(index, "title", value)} />
              <Field label="Description" value={item.description} onChange={(value) => updateCaseStudy(index, "description", value)} textarea />
            </div>
          ))}
        </EditorCard>

        <EditorCard title="CTA and links">
          <Field label="Primary button label" value={content.hero.primaryButton.label} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, primaryButton: { ...current.hero.primaryButton, label: value } } }))} />
          <Field label="Primary button link" value={content.hero.primaryButton.href} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, primaryButton: { ...current.hero.primaryButton, href: value } } }))} />
          <Field label="Secondary button label" value={content.hero.secondaryButton.label} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, secondaryButton: { ...current.hero.secondaryButton, label: value } } }))} />
          <Field label="Secondary button link" value={content.hero.secondaryButton.href} onChange={(value) => setContent((current) => ({ ...current, hero: { ...current.hero, secondaryButton: { ...current.hero.secondaryButton, href: value } } }))} />
          <Field label="CTA title" value={content.cta.title} onChange={(value) => updateCta("title", value)} textarea />
          <Field label="CTA description" value={content.cta.description} onChange={(value) => updateCta("description", value)} textarea />
        </EditorCard>
      </div>
    </section>
  )
}

function EditorCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, onChange, textarea, value }: { label: string; onChange: (value: string) => void; textarea?: boolean; value: string }) {
  const className = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-100"
  return (
    <label className="block text-xs font-bold uppercase tracking-[.14em] text-slate-500">
      {label}
      {textarea ? <textarea className={`${className} min-h-24 normal-case tracking-normal`} onChange={(event) => onChange(event.target.value)} value={value} /> : <input className={`${className} normal-case tracking-normal`} onChange={(event) => onChange(event.target.value)} value={value} />}
    </label>
  )
}
