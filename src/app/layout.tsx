import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "sonner"
import { auth } from "@/lib/auth"
import "./globals.css"

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Hack4j — A community that lives 10 years ahead",
  description:
    "Free engineering education for the next generation of builders. Java, Spring Boot, React, DevOps, Cloud, and beyond.",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `document.querySelectorAll("[bis_skin_checked],[bis_register],[id^=bis_]").forEach(e=>{e.removeAttribute("bis_skin_checked");e.removeAttribute("bis_register");});document.body.removeAttribute("__processed_53b94842-fa44-418e-8ef3-d618073e2004__");`,
          }}
        />
        <ThemeProvider>
          <Header session={session} />
          <main className="flex-1">{children}</main>
          <Footer session={session} />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
