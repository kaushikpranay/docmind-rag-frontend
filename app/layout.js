import './globals.css'
import { Syne, DM_Sans } from 'next/font/google'

const syne = Syne({ subsets: ['latin'], variable: '--font-syne', weight: ['400','600','700','800'] })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm', weight: ['300','400','500'] })

export const metadata = {
  title: 'DocMind RAG',
  description: 'Vectorless RAG Document Intelligence',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  )
}