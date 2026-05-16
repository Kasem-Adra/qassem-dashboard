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
    <main className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-3" href="#top" aria-label="Home">
            <span className="grid h-9 w-9 place-items-center rounded-xl text-sm font-bold text-white" style={{ background: content.settings.accent }}>
              {content.settings.logoText.slice(0, 1)}
            </span>
            <span className="text-sm font-semibold tracking-tight">{content.settings.logoText}</span>
          </a>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {content.nav.map((item) => (
              <a className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" href={item.href} key={`${item.label}-${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50" href={content.hero.secondaryButton.href}>
            {content.hero.secondaryButton.label}
          </a>
        </div>
      </header>

      <section id="top" className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">{content.settings.announcement}</p>
            <p className="mt-8 text-sm font-semibold uppercase tracking-[.18em] text-teal-700">{content.hero.eyebrow}</p>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-0.055em] text-slate-950 sm:text-6xl lg:text-7xl">{content.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800" href={content.hero.primaryButton.href}>
                {content.hero.primaryButton.label}
              </a>
              <a className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50" href={content.hero.secondaryButton.href}>
                {content.hero.secondaryButton.label}
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-200/70">
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-700">Dashboard managed</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">Site health</h2>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Live</span>
              </div>
              <div className="mt-6 grid gap-3">
                {content.stats.map((stat) => (
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4" key={`${stat.value}-${stat.label}`}>
                    <span className="text-sm text-slate-600">{stat.label}</span>
                    <span className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="platform">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-700">Product</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em] text-slate-950 sm:text-5xl">A public site your team can manage.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {content.features.map((feature) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={feature.title}>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-700">{feature.title.slice(0, 2)}</div>
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50" id="proof">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
          <div className="rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-teal-200">Results</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Clear signals. Better follow-up.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">Results, metrics, and cards stay editable from the same dashboard as the work.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {content.caseStudies.map((item) => (
              <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" key={item.title}>
                <p className="text-3xl font-semibold tracking-tight text-slate-950">{item.metric}</p>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8" id="contact">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold tracking-[-.04em] text-slate-950 sm:text-5xl">{content.cta.title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">{content.cta.description}</p>
          <a className="mt-8 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800" href={content.cta.primaryButton.href}>
            {content.cta.primaryButton.label}
          </a>
        </div>
      </section>
    </main>
  )
}
