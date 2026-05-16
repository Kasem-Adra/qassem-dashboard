"use client"

import { useEffect, useState } from "react"
import { apiJson } from "../../lib/api-client"
import {
  defaultWebsiteContent,
  type WebsiteContent,
} from "../../lib/website-content"

type AuthState =
  | { status: "checking" }
  | { status: "authenticated"; role: "admin" | "operator"; source: string }
  | { status: "anonymous" }

const authFallback = { ok: false as const }

export function WebsiteStudio() {
  const [content, setContent] = useState<WebsiteContent>(defaultWebsiteContent)
  const [adminToken, setAdminToken] = useState("")
  const [authState, setAuthState] = useState<AuthState>({ status: "checking" })
  const [status, setStatus] = useState("Draft saved locally")

  useEffect(() => {
    apiJson<{ content: WebsiteContent }>("/api/site/content", {
      fallback: { content: defaultWebsiteContent },
    }).then((data) => setContent(data.content))
    refreshSession()
  }, [])

  async function refreshSession() {
    const session = await apiJson<
      | { ok: true; principal: { role: "admin" | "operator"; source: string } }
      | typeof authFallback
    >("/api/auth/session", { fallback: authFallback })

    if (session.ok) {
      setAuthState({
        status: "authenticated",
        role: session.principal.role,
        source: session.principal.source,
      })
      return true
    }

    setAuthState({ status: "anonymous" })
    return false
  }

  async function login() {
    if (!adminToken.trim()) {
      setStatus("Enter the admin token before starting an editor session.")
      return false
    }

    setStatus("Starting secure editor session…")
    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: adminToken.trim(), role: "admin" }),
    })

    if (!response.ok) {
      setAuthState({ status: "anonymous" })
      setStatus("Login failed. Check the admin token.")
      return false
    }

    setAdminToken("")
    await refreshSession()
    setStatus("Secure editor session is active.")
    return true
  }

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: "{}",
    })
    setAuthState({ status: "anonymous" })
    setStatus("Editor session ended.")
  }

  async function publish() {
    let hasSession = authState.status === "authenticated"
    if (!hasSession && adminToken.trim()) hasSession = await login()

    if (!hasSession) {
      setStatus("Start an editor session before publishing changes.")
      return
    }

    setStatus("Publishing changes…")
    const response = await fetch("/api/site/content", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(content),
    })

    if (response.ok) {
      setStatus("Site content published.")
      return
    }

    if (response.status === 401) setAuthState({ status: "anonymous" })
    setStatus(
      "Publish failed. Refresh the editor session and check the content fields.",
    )
  }

  function updateHero(field: keyof WebsiteContent["hero"], value: string) {
    setContent((current) => ({
      ...current,
      hero: { ...current.hero, [field]: value },
    }))
  }

  function updateSetting(
    field: keyof WebsiteContent["settings"],
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      settings: { ...current.settings, [field]: value },
    }))
  }

  function updateFeature(
    index: number,
    field: "title" | "description",
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) =>
        featureIndex === index ? { ...feature, [field]: value } : feature,
      ),
    }))
  }

  function updateCaseStudy(
    index: number,
    field: "title" | "description" | "metric",
    value: string,
  ) {
    setContent((current) => ({
      ...current,
      caseStudies: current.caseStudies.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  function updateCta(field: keyof WebsiteContent["cta"], value: string) {
    setContent((current) => ({
      ...current,
      cta: { ...current.cta, [field]: value },
    }))
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal-700">
            Site editor
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Edit public site copy
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Update homepage copy, cards, links, and brand settings from one
            place.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-80">
          {authState.status === "authenticated" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
              Signed in as {authState.role} via {authState.source} session.
            </div>
          ) : (
            <input
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="Admin token"
              type="password"
              value={adminToken}
            />
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {authState.status === "authenticated" ? (
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                onClick={logout}
                type="button"
              >
                End session
              </button>
            ) : (
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
                onClick={login}
                type="button"
              >
                Start session
              </button>
            )}
            <button
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              onClick={publish}
              type="button"
            >
              Publish changes
            </button>
          </div>
          <p className="text-xs text-slate-500">{status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <EditorCard title="Brand and hero">
          <Field
            label="Logo"
            value={content.settings.logoText}
            onChange={(value) => updateSetting("logoText", value)}
          />
          <Field
            label="Top badge"
            value={content.settings.announcement}
            onChange={(value) => updateSetting("announcement", value)}
          />
          <Field
            label="Accent"
            value={content.settings.accent}
            onChange={(value) => updateSetting("accent", value)}
          />
          <Field
            label="Eyebrow"
            value={content.hero.eyebrow}
            onChange={(value) => updateHero("eyebrow", value)}
          />
          <Field
            label="Headline"
            value={content.hero.title}
            onChange={(value) => updateHero("title", value)}
            textarea
          />
          <Field
            label="Subhead"
            value={content.hero.subtitle}
            onChange={(value) => updateHero("subtitle", value)}
            textarea
          />
        </EditorCard>

        <EditorCard title="Product cards">
          {content.features.map((feature, index) => (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-3"
              key={`${feature.title}-${index}`}
            >
              <Field
                label={`Card ${index + 1} title`}
                value={feature.title}
                onChange={(value) => updateFeature(index, "title", value)}
              />
              <Field
                label="Copy"
                value={feature.description}
                onChange={(value) => updateFeature(index, "description", value)}
                textarea
              />
            </div>
          ))}
        </EditorCard>

        <EditorCard title="Result cards">
          {content.caseStudies.map((item, index) => (
            <div
              className="rounded-2xl border border-slate-200 bg-white p-3"
              key={`${item.title}-${index}`}
            >
              <Field
                label="Metric"
                value={item.metric}
                onChange={(value) => updateCaseStudy(index, "metric", value)}
              />
              <Field
                label="Title"
                value={item.title}
                onChange={(value) => updateCaseStudy(index, "title", value)}
              />
              <Field
                label="Copy"
                value={item.description}
                onChange={(value) =>
                  updateCaseStudy(index, "description", value)
                }
                textarea
              />
            </div>
          ))}
        </EditorCard>

        <EditorCard title="CTA and links">
          <Field
            label="Primary label"
            value={content.hero.primaryButton.label}
            onChange={(value) =>
              setContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  primaryButton: {
                    ...current.hero.primaryButton,
                    label: value,
                  },
                },
              }))
            }
          />
          <Field
            label="Primary link"
            value={content.hero.primaryButton.href}
            onChange={(value) =>
              setContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  primaryButton: { ...current.hero.primaryButton, href: value },
                },
              }))
            }
          />
          <Field
            label="Secondary label"
            value={content.hero.secondaryButton.label}
            onChange={(value) =>
              setContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  secondaryButton: {
                    ...current.hero.secondaryButton,
                    label: value,
                  },
                },
              }))
            }
          />
          <Field
            label="Secondary link"
            value={content.hero.secondaryButton.href}
            onChange={(value) =>
              setContent((current) => ({
                ...current,
                hero: {
                  ...current.hero,
                  secondaryButton: {
                    ...current.hero.secondaryButton,
                    href: value,
                  },
                },
              }))
            }
          />
          <Field
            label="CTA headline"
            value={content.cta.title}
            onChange={(value) => updateCta("title", value)}
            textarea
          />
          <Field
            label="CTA copy"
            value={content.cta.description}
            onChange={(value) => updateCta("description", value)}
            textarea
          />
        </EditorCard>
      </div>
    </section>
  )
}

function EditorCard({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}

function Field({
  label,
  onChange,
  textarea,
  value,
}: {
  label: string
  onChange: (value: string) => void
  textarea?: boolean
  value: string
}) {
  const className =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
  return (
    <label className="block text-xs font-medium uppercase tracking-[.14em] text-slate-500">
      {label}
      {textarea ? (
        <textarea
          className={`${className} min-h-24 normal-case tracking-normal`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      ) : (
        <input
          className={`${className} normal-case tracking-normal`}
          onChange={(event) => onChange(event.target.value)}
          value={value}
        />
      )}
    </label>
  )
}
