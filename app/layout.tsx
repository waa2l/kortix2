import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'نظام إدارة الطوابير الطبية | Medical Queue Management System',
  description: 'نظام متقدم لإدارة طوابير المراكز الطبية مع دعم كامل للغة العربية والإعلانات الصوتية',
  keywords: 'طوابير طبية، إدارة المراكز الطبية، نظام الحجز، عيادات',
  authors: [{ name: 'Medical Queue System' }],
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=5.0',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://medical-queue.example.com',
    title: 'نظام إدارة الطوابير الطبية',
    description: 'نظام متقدم لإدارة طوابير المراكز الطبية',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0ea5e9" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-cairo bg-medical-50 text-medical-900">
        <div className="min-h-screen">
          {children}
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              fontFamily: 'Cairo, sans-serif',
              direction: 'rtl',
            },
          }}
        />
      </body>
    </html>
  )
}
