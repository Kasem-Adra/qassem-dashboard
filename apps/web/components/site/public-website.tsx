"use client"

import { useEffect, useState } from "react"
import { apiJson } from "../../lib/api-client"
import { defaultWebsiteContent, type WebsiteContent } from "../../lib/website-content"

export function PublicWebsite() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)

  useEffect(() => {
    apiJson<{ content: WebsiteContent }>("/api/site/content", { fallback: { content: defaultWebsiteContent } }).then((data) => setContent(data.content))
  }, [])

  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-6 py-4 lg:px-8">
          <a className="flex items-center gap-3" href="#top">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-base font-black text-white shadow-sm" style={{ background: content.settings.accent }}>
              {content.settings.logoText.slice(0, 1)}
            </span>
            <span className="font-black tracking-tight text-slate-950">{content.settings.logoText}</span>
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            {content.nav.map((item) => (
              <a className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950" href={item.href} key={`${item.label}-${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>
          <a className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" href={content.hero.secondaryButton.href}>
            Dashboard
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden" id="top">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: content.settings.accent }} />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[.18em] text-[#007a7f]">
              {content.settings.announcement}
            </div>
            <p className="mt-8 text-sm font-black uppercase tracking-[.22em] text-[#00a4aa]">{content.hero.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-.055em] text-slate-950 md:text-7xl">{content.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" href={content.hero.primaryButton.href}>
                {content.hero.primaryButton.label}
              </a>
              <a className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300" href={content.hero.secondaryButton.href}>
                {content.hero.secondaryButton.label}
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70">
            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.18em] text-[#00a4aa]">Website control</p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Managed from dashboard</h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Live</span>
              </div>
              <div className="mt-6 grid gap-3">
                {content.stats.map((stat) => (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4" key={`${stat.value}-${stat.label}`}>
                    <span className="text-sm font-semibold text-slate-600">{stat.label}</span>
                    <span className="text-2xl font-black text-slate-950">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8" id="platform">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[.2em] text-[#00a4aa]">Platform</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Everything your public website needs, governed from one dashboard.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.features.map((feature) => (
              <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md" key={feature.title}>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#ecfeff] text-sm font-black text-[#007a7f]">{feature.title.slice(0, 2)}</div>
                <h3 className="mt-5 text-lg font-black text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8" id="proof">
        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm lg:p-8">
            <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-200">Proof</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Premium systems for measurable operations.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Case studies, metrics, and website cards are editable from the dashboard so the public story stays aligned with operations.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.caseStudies.map((item) => (
              <article className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm" key={item.title}>
                <p className="text-3xl font-black text-slate-950">{item.metric}</p>
                <h3 className="mt-5 text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8" id="contact">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 text-center shadow-sm lg:p-10">
          <h2 className="mx-auto max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-5xl">{content.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">{content.cta.description}</p>
          <a className="mt-7 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" href={content.cta.primaryButton.href}>
            {content.cta.primaryButton.label}
          </a>
        </div>
      </section>
    </main>
  )
}
