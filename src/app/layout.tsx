import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Providers } from '@/providers'
import { fontSans, fontHeading } from '@/lib/fonts'
import { cn } from '@/lib/utils'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HaDerech - Advanced Learning Platform',
    template: '%s | HaDerech'
  },
  description: 'Advanced learning platform for relationship improvement powered by AI',
  keywords: [
    'relationships',
    'learning',
    'personal growth',
    'AI',
    'courses',
    'community'
  ],
  authors: [
    {
      name: 'HaDerech Team',
      url: 'https://haderech.org'
    }
  ],
  creator: 'HaDerech Team',
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://haderech.org',
    title: 'HaDerech - Advanced Learning Platform',
    description: 'Advanced learning platform for relationship improvement powered by AI',
    siteName: 'HaDerech'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HaDerech - Advanced Learning Platform',
    description: 'Advanced learning platform for relationship improvement powered by AI',
    creator: '@haderech'
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  },
  manifest: '/site.webmanifest'
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  )
} 