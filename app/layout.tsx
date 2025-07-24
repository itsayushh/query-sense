import type { Metadata } from "next";
import { Geist, Outfit,Space_Grotesk,Space_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { FreeQueryProvider } from "@/contexts/FreeQueryContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});
const spaceMono = Space_Mono({
  weight: ["400","700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "QuerySense",
  description: "Connect to your database and start querying",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${geistSans.variable} ${outfit.variable} ${spaceGrotesk.variable} ${spaceMono.variable} font-spaceGrotesk antialiased`}>
        <ClerkProvider>
          <FreeQueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Navbar />
              {children}
              <Toaster />
            </ThemeProvider>
          </FreeQueryProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
