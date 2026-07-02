import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { cookies } from 'next/headers'
import { AuthProvider } from '@/contexts/auth-context'
import { LanguageProvider } from '@/contexts/language-context'
import { LocalizedTitle } from '@/components/localized-title'
import { ToastProvider } from '@/components/ui/toaster'
import { LOCALE_COOKIE, COUNTRY_COOKIE, defaultLocale, dirForLocale, isLocale } from '@/lib/i18n/config'
import { dictionaries } from '@/lib/i18n/dictionaries'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Localize the tab title + SEO description to the visitor's language (from the
// NEXT_LOCALE cookie), so e.g. a Spanish visitor gets a Spanish <title> on first paint.
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale
  const home = dictionaries[locale].home
  return {
    title: home.metaTitle,
    description: home.metaDescription,
    icons: {
      icon: '/gigahoo-icon.png?v=2',
      apple: '/gigahoo-icon.png?v=2',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale
  const country = (cookieStore.get(COUNTRY_COOKIE)?.value ?? '').toUpperCase()

  return (
    <html lang={locale} dir={dirForLocale(locale)} className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        <LanguageProvider initialLocale={locale} initialCountry={country}>
          <LocalizedTitle />
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
