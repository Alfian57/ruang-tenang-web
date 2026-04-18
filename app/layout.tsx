import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#EF4444",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Ruang Tenang - Platform Kesehatan Mental",
  description: "Temukan ketenangan pikiran dengan AI chat therapy, artikel kesehatan mental, dan musik relaksasi.",
  keywords: ["kesehatan mental", "terapi", "meditasi", "relaksasi", "AI chat"],
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ruang Tenang",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`dark ${manrope.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="font-app" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
