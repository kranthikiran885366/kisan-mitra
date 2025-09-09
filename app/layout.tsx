import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import BottomNavigation from "@/components/BottomNavigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Krishi Mitra - AI-Powered Farming Advisor & Marketplace",
  description:
    "Complete farming solution with weather updates, market rates, government schemes, crop recommendations, and agricultural marketplace for seeds, fertilizers, tools",
  keywords: "farming, agriculture, weather, market prices, government schemes, crop recommendations, agricultural marketplace, seeds, fertilizers, pesticides, farming tools",
  authors: [{ name: "Krishi Mitra Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#16a34a",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Krishi Mitra" />
      </head>
      <body className={inter.className}>
        {children}
        <BottomNavigation />
      </body>
    </html>
  )
}
