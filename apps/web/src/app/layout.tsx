import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
})

export const metadata = {
  title: 'AI Journal',
  description: 'Your personal AI-powered journal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white">{children}</body>
    </html>
  )
}
