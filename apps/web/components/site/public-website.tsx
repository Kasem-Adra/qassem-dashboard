"use client"

import { useEffect, useMemo, useState } from "react"
import { apiJson } from "../../lib/api-client"
import { defaultWebsiteContent, type WebsiteContent } from "../../lib/website-content"

const workflowCards = [
  ["01", "Brief", "Collect goals, audiences, and launch requirements in a structured intake."],
  ["02", "Operate", "Assign owners, monitor work, and keep leadership aligned on progress."],
  ["03", "Publish", "Ship public updates with refined copy, clear CTAs, and approval history."],
]

const customerLogos = ["Northstar", "Atlas", "Signal", "Forma", "Mercury"]

export function PublicWebsite() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)

  useEffect(() => {
    apiJson<{ content: WebsiteContent }>("/api/site/content", { fallback: { content: defaultWebsiteContent } }).then((data) => setContent(data.content))
  }, [])

  const nav = useMemo(() => content.nav.slice(0, 4), [content.nav])

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-6 lg:px-8">
          <a className="group flex items-center gap-3" href="#top" aria-label="Qassem Cloud home">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white shadow-[0_12px_40px_rgba(15,23,42,.16)]">
              {content.settings.logoText.slice(0, 1)}
            </span>
            <span className="text-sm font-bold tracking-tight text-slate-950">{content.settings.logoText}</span>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/80 p-1 shadow-sm md:flex" aria-label="Primary navigation">
            {nav.map((item) => (
              <a className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950" href={item.href} key={`${item.label}-${item.href}`}>
                {item.label}
              </a>
            ))}
          </nav>

          <a className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800" href={content.hero.secondaryButton.href}>
            Sign in
          </a>
        </div>
      </header>

      <section id="top" className="relative">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,91,255,.22),transparent_38rem)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              {content.settings.announcement}
            </p>
            <p className="mt-8 text-sm font-bold uppercase tracking-[.22em] text-slate-500">{content.hero.eyebrow}</p>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] text-slate-950 sm:text-6xl lg:text-7xl">{content.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{content.hero.subtitle}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-[0_18px_50px_rgba(15,23,42,.18)] transition hover:-translate-y-0.5 hover:bg-slate-800" href={content.hero.primaryButton.href}>
                {content.hero.primaryButton.label}
              </a>
              <a className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300" href={content.hero.secondaryButton.href}>
                {content.hero.secondaryButton.label}
              </a>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 gap-3">
              {content.stats.map((stat) => (
                <div className="rounded-2xl border border-white bg-white/75 p-4 shadow-sm ring-1 ring-slate-200/60" key={stat.label}>
                  <p className="text-2xl font-black tracking-tight text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-200/60 via-cyan-100/70 to-white blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,.18)] ring-1 ring-slate-200/70 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Workspace preview</p>
                  <p className="mt-1 text-sm font-bold text-slate-950">Launch control</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Live</span>
              </div>
              <div className="grid gap-4 p-5">
                <div className="rounded-3xl bg-slate-950 p-5 text-white">
                  <p className="text-sm font-semibold text-slate-300">Conversion plan</p>
                  <p className="mt-4 text-4xl font-black tracking-[-.04em]">92%</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">Homepage messaging, approval flow, and publishing checklist are ready.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MiniMetric label="Open tasks" value="12" />
                  <MiniMetric label="Reviewers" value="4" />
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-slate-950">Website refresh</span>
                    <span className="text-slate-500">Due today</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-3/4 rounded-full bg-indigo-500" />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">Copy approved · design pass active · publish window scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8" aria-label="Customers">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-[2rem] border border-slate-200 bg-white/70 px-6 py-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-[.2em] text-slate-400">Trusted by modern teams</span>
          {customerLogos.map((logo) => (
            <span className="text-sm font-black tracking-tight text-slate-400" key={logo}>{logo}</span>
          ))}
        </div>
      </section>

      <section id="platform" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[.22em] text-indigo-600">Platform</p>
          <h2 className="mt-4 text-4xl font-black tracking-[-.045em] text-slate-950 md:text-5xl">Everything your operating team needs, without the enterprise clutter.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {content.features.map((feature, index) => (
            <article className="group rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" key={feature.title}>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-sm font-black text-white">0{index + 1}</div>
              <h3 className="mt-7 text-xl font-black tracking-tight text-slate-950">{feature.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflows" className="border-y border-slate-200 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-20 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.22em] text-indigo-600">Workflow</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-.045em] text-slate-950">A predictable launch rhythm from first brief to final publish.</h2>
            <p className="mt-5 text-base leading-8 text-slate-600">Designed like a premium SaaS product: fast scanning, calm hierarchy, consistent cards, and executive-ready context.</p>
          </div>
          <div className="grid gap-4">
            {workflowCards.map(([number, title, description]) => (
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm" key={title}>
                <div className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">{number}</span>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="customers" className="mx-auto max-w-7xl px-5 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {content.caseStudies.map((study) => (
            <article className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm" key={study.title}>
              <p className="text-3xl font-black tracking-[-.04em] text-slate-950">{study.metric}</p>
              <h3 className="mt-6 text-xl font-black tracking-tight text-slate-950">{study.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{study.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-5 pb-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.25rem] bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,.26)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.22em] text-indigo-300">Get started</p>
              <h2 className="mt-4 text-4xl font-black tracking-[-.045em] md:text-5xl">{content.cta.title}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">{content.cta.description}</p>
            </div>
            <a className="inline-flex justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100" href={content.cta.primaryButton.href}>
              {content.cta.primaryButton.label}
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4">
      <p className="text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}
