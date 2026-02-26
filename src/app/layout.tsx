import type { Metadata, Viewport } from 'next'
import { Inter, Caveat } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RoomieTab — Roommate Expense Tracker',
  description: 'Track shared expenses with your roommates and settle up with minimum transactions.',
}

export const viewport: Viewport = {
  themeColor: '#6366F1',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="bg-gray-50 min-h-screen font-sans">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
