import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tamagotchi Satirique - World App',
  description: 'Une mini-app satirique pour World App où vous créez du contenu humoristique et gagnez des WLD',
  keywords: ['tamagotchi', 'satirique', 'world app', 'minikit', 'worldcoin', 'humour'],
  authors: [{ name: 'Tamagotchi Satirique Team' }],
  openGraph: {
    title: 'Tamagotchi Satirique',
    description: 'Créez du contenu satirique, gagnez des points et boostez vos posts avec WLD!',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tamagotchi Satirique',
    description: 'Créez du contenu satirique, gagnez des points et boostez vos posts avec WLD!',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#f97316',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
        
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              border: '2px solid #000000',
              borderRadius: '20px',
              boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
            },
          }}
        />
      </body>
    </html>
  )
}

