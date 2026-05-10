import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { DM_Serif_Display, Fraunces, Inter } from "next/font/google"
import { SiteHeader } from "@/components/site-header"
import "./globals.css"

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
})

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK"],
})

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "mpanera-ai — Trouvez le bon prestataire à Madagascar",
  description:
    "La plateforme qui connecte les prestataires malgaches aux clients qui les cherchent. Décrivez ce que vous cherchez, l'IA fait le reste.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${dmSerifDisplay.variable} ${fraunces.variable} ${inter.variable} font-sans antialiased`}
      >
        <ClerkProvider>
          <SiteHeader />
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
