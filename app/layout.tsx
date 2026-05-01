import type { Metadata, Viewport } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: "variable",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: "variable",
});

export const viewport: Viewport = {
  themeColor: "#EF4444",
  width: "device-width",
  initialScale: 1,
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
    <html lang="id" className={`dark ${plusJakarta.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className="font-app" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
