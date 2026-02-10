import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { getCurrentUser } from "../actions/auth"
import Providers from "./providers"
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics"
import PageViewTracker from "@/components/analytics/PageViewTracker"
import { Suspense } from "react"
import Clarity from "@/components/analytics/Clarity"
import Script from "next/script"
import { OnboardingPopupHandler } from "@/components/onboarding-popup-handler"
import { ErrorBoundary } from "@/components/error-boundary"
import Chatbot from "@/components/chat/Chatbot"


export const metadata: Metadata = {
  title: "IND2B",
  description: "Your one-stop shop for all your needs",
  icons: {
    icon: [
      {
        url: "/logo.webp",
        sizes: "64x64",
        type: "image/webp",
      },
      {
        url: "/logo.webp",
        sizes: "32x32",
        type: "image/webp",
      },
    ],
    apple: {
      url: "/logo.webp",
      sizes: "360x360",
      type: "image/webp",
    },
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.webp" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.webp" />
        <Script id="polyfills" strategy="beforeInteractive">
          {`
            // requestIdleCallback polyfill for Safari/iOS
            if (typeof window !== 'undefined' && !window.requestIdleCallback) {
              window.requestIdleCallback = function(callback) {
                const start = Date.now();
                return setTimeout(function() {
                  callback({
                    didTimeout: false,
                    timeRemaining: function() {
                      return Math.max(0, 50 - (Date.now() - start));
                    }
                  });
                }, 1);
              };
              window.cancelIdleCallback = function(id) {
                clearTimeout(id);
              };
            }
          `}
        </Script>
      </head>
      <body className="bg-gray-100 prevent-overflow">
        <GoogleAnalytics />
        <Clarity />
        <ErrorBoundary>
          <Providers>
            <Header user={user} />
            <Suspense fallback={null}>
              <PageViewTracker />
            </Suspense>
            <main className="min-h-screen pt-10 sm:pt-12 lg:pt-14 w-full max-w-full overflow-x-hidden">{children}</main>
            <Footer />
            <OnboardingPopupHandler />
            <Chatbot user={user} />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}

