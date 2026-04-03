import type { Metadata } from "next"
import { Playfair_Display, Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
})

export const metadata: Metadata = {
  title: "SEEDEV — Développement web sur mesure",
  description:
    "Seedev conçoit et développe des sites vitrines, landing pages et SaaS. Suivez votre projet depuis votre espace client.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var t = localStorage.getItem('seedev-theme');
              if (t === 'warm') document.documentElement.classList.add('warm');
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${playfair.variable} ${cormorant.variable} ${dmSans.variable}`}>
        {children}
      </body>
    </html>
  )
}
