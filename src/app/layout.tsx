import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import AnimatedBg from "@/components/AnimatedBg"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "SEEDEV — Développement web sur mesure",
  description:
    "Seedev conçoit et développe des sites vitrines, landing pages et SaaS. Suivez votre projet depuis votre espace client.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AnimatedBg />
        {children}
      </body>
    </html>
  )
}
