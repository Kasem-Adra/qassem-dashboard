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
    accent: '#635bff',
    announcement: 'New command center for modern service teams',
    logoText: 'Qassem Cloud',
  },
  nav: [
    { label: 'Platform', href: '#platform' },
    { label: 'Workflows', href: '#workflows' },
    { label: 'Customers', href: '#customers' },
    { label: 'Pricing', href: '#pricing' },
  ],
  hero: {
    eyebrow: 'Premium operations workspace',
    title: 'Run content, clients, and AI operations from one polished dashboard.',
    subtitle:
      'Qassem Cloud gives growing teams a crisp operating layer for publishing, executive visibility, automated workflows, and high-confidence decisions.',
    primaryButton: { label: 'Explore the platform', href: '#platform' },
    secondaryButton: { label: 'Open dashboard', href: '/dashboard' },
  },
  stats: [
    { value: '99.9%', label: 'workspace uptime' },
    { value: '42k', label: 'events processed' },
    { value: '18m', label: 'avg. weekly time saved' },
  ],
  features: [
    {
      title: 'Content studio',
      description:
        'Launch homepage updates, landing sections, and conversion copy from an elegant editorial workflow.',
    },
    {
      title: 'Operations cockpit',
      description:
        'Track active work, owners, risk, status, and notes in one command surface designed for leaders.',
    },
    {
      title: 'AI workflow layer',
      description:
        'Coordinate agents, runtime tasks, memory, and approvals without exposing complexity to your team.',
    },
  ],
  caseStudies: [
    {
      title: 'Client success workspace',
      description:
        'A boutique services team consolidated launch plans, approvals, and risk reviews into one view.',
      metric: '31% faster launches',
    },
    {
      title: 'Executive operating rhythm',
      description:
        'Leadership replaced scattered status meetings with live dashboards and prioritized action queues.',
      metric: '8 hrs saved weekly',
    },
  ],
  cta: {
    title: 'Give your team a calmer way to operate.',
    description:
      'Use the dashboard to align website messaging, operational work, AI tasks, and executive reporting in one premium workspace.',
    primaryButton: { label: 'Manage workspace', href: '/dashboard' },
  },
}

function cloneWebsiteContent(content: WebsiteContent): WebsiteContent {
  return JSON.parse(JSON.stringify(content)) as WebsiteContent
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
}
