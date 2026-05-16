import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Qassem AI OS',
  description: 'Enterprise AI-native workspace operating system.'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
