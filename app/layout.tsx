import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Mpanera AI",
    template: "%s · Mpanera AI",
  },
  description:
    "Met en relation clients et prestataires à Madagascar. Une IA pour décrire votre besoin, des professionnels de confiance.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} antialiased`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  )
}
