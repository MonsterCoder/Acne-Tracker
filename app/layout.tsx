import '@/app/globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/header'
import { ImageProvider } from '@/context/ImageContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Acne Tracker',
  description: 'Track and analyze your acne over time',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ImageProvider>
          <Header />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ImageProvider>
      </body>
    </html>
  )
}

