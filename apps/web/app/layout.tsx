import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Qassem Cloud',
  description: 'Premium SaaS workspace for content, operations, and AI workflows.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
