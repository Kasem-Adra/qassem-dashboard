export interface WebsiteLink {
  label: string
  href: string
}

export interface WebsiteFeature {
  title: string
  description: string
}

export interface WebsiteStat {
  label: string
  value: string
}

export interface WebsiteCaseStudy {
  title: string
  description: string
  metric: string
}

export interface WebsiteContent {
  settings: {
    accent: string
    announcement: string
    logoText: string
  }
  nav: WebsiteLink[]
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    primaryButton: WebsiteLink
    secondaryButton: WebsiteLink
  }
  stats: WebsiteStat[]
  features: WebsiteFeature[]
  caseStudies: WebsiteCaseStudy[]
  cta: {
    title: string
    description: string
    primaryButton: WebsiteLink
  }
}

export const defaultWebsiteContent: WebsiteContent = {
  settings: {
    accent: "#00b3b8",
 codex/continue-implementing-the-dashboard
    announcement: "One workspace for your site and operations",
    logoText: "Qassem Studio",
  },
  nav: [
    { label: "Product", href: "#platform" },
    { label: "Results", href: "#proof" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "AI operations studio",
    title: "Manage your website and operations in one calm workspace.",
    subtitle:
      "Plan content, review risk, and coordinate AI work without adding another tool to the stack.",
    primaryButton: { label: "Explore product", href: "#platform" },
    secondaryButton: { label: "Open dashboard", href: "/dashboard" },
  },
  stats: [
    { value: "87%", label: "health score" },
    { value: "24/7", label: "live monitoring" },
    { value: "12+", label: "workflows" },
  ],
  features: [
    {
      title: "Site control",
      description:
        "Update pages, sections, buttons, cards, and links from the dashboard.",
    },
    {
      title: "Operations desk",
      description: "Keep tasks, signals, notes, and decisions easy to review.",
    },
    {
      title: "Polished publishing",
      description:
        "Ship a clean public site with focused copy, clear cards, and sharp calls to action.",

    announcement: "AI-native operating systems for premium teams",
    logoText: "Qassem OS",
  },
  nav: [
    { label: "Platform", href: "#platform" },
    { label: "Solutions", href: "#solutions" },
    { label: "Proof", href: "#proof" },
    { label: "Contact", href: "#contact" },
  ],
  hero: {
    eyebrow: "Digital systems architecture",
    title: "Build a cleaner operating layer for AI-powered companies.",
    subtitle:
      "Qassem OS brings strategy, automation, cloud infrastructure, and operational intelligence into one premium workspace your team can actually manage.",
    primaryButton: { label: "Explore platform", href: "#platform" },
    secondaryButton: { label: "Open dashboard", href: "/dashboard" },
  },
  stats: [
    { value: "87%", label: "operational health" },
    { value: "24/7", label: "runtime monitoring" },
    { value: "12+", label: "AI workflows" },
  ],
  features: [
    {
      title: "Content command center",
      description: "Manage hero copy, sections, CTAs, cards, and navigation from the dashboard control plane.",
    },
    {
      title: "Autonomous operations",
      description: "Connect runtime tasks, memory, agents, and decision logs to business-facing website experiences.",
    },
    {
      title: "Premium SaaS presentation",
      description: "A modern Storyblok-inspired interface with clean cards, spacing, typography, and conversion-focused flows.",
 main
    },
  ],
  caseStudies: [
    {
 codex/continue-implementing-the-dashboard
      title: "Client onboarding",
      description:
        "The dashboard surfaced blockers early enough for the team to act.",
      metric: "$330K in view",
    },
    {
      title: "Action queue",
      description: "Signals became a short, prioritized list for the team.",
      metric: "8 actions ready",
    },
  ],
  cta: {
    title: "Make your website easy to manage.",
    description:
      "Edit the site, review operations, and publish updates from one focused workspace.",
    primaryButton: { label: "Manage site", href: "/dashboard" },
  },
}

function cloneWebsiteContent(content: WebsiteContent): WebsiteContent {
  return structuredClone(content)
}

let websiteContent: WebsiteContent = cloneWebsiteContent(defaultWebsiteContent)

export function getWebsiteContent() {
  return cloneWebsiteContent(websiteContent)
}

export function updateWebsiteContent(content: WebsiteContent) {
  websiteContent = cloneWebsiteContent(content)
  return getWebsiteContent()
}

export function resetWebsiteContent() {
  websiteContent = cloneWebsiteContent(defaultWebsiteContent)
  return getWebsiteContent()

      title: "Enterprise onboarding",
      description: "Predictive risk surfaced delivery blockers before revenue impact escalated.",
      metric: "$330K monitored",
    },
    {
      title: "Executive automation",
      description: "AI recommendations turned scattered operational signals into a prioritized action queue.",
      metric: "8 AI actions",
    },
  ],
  cta: {
    title: "Ready to operate from one source of truth?",
    description: "Use the dashboard to tune the public website and keep operations, content, and AI workflows aligned.",
    primaryButton: { label: "Manage in dashboard", href: "/dashboard" },
  },
}

let websiteContent: WebsiteContent = defaultWebsiteContent

export function getWebsiteContent() {
  return websiteContent
}

export function updateWebsiteContent(content: WebsiteContent) {
  websiteContent = content
  return websiteContent
 main
}
