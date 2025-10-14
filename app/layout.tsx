import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { AssistantPanel } from "@/components/assistant-panel"
import { Suspense } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"
import AppProviders from "@/components/app-providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "GRIPHYN Dashboard",
  description: "Manage your brand partnerships and sponsorships",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans">
        <Suspense
          fallback={
            <div className="flex min-h-screen w-full items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <div className="min-h-screen bg-background">
            <DashboardHeader />

            <div className="flex">
              <Sidebar />

              <main className="flex-1 px-4 md:px-6 py-6 md:py-8 w-full">
                <AppProviders>{children}</AppProviders>
              </main>
            </div>

            <AssistantPanel />
          </div>
        </Suspense>
      </body>
    </html>
  )
}
