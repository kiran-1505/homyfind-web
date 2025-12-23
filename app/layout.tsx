import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HomyFind - Find Your Perfect PG in India',
  description: 'Search and discover PG accommodations across major Indian cities. Easy, fast, and reliable.',
  keywords: 'PG, paying guest, accommodation, rooms, rent, bangalore, mumbai, delhi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

