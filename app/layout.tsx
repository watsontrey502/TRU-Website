import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomTabBar from "@/components/BottomTabBar";
import { ToastProvider } from "@/components/Toast";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#2C4A3E",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://trudating.com"
  ),
  title: {
    default: "TRÜ Dating Nashville | Curated Dating Events",
    template: "%s | TRÜ Dating Nashville",
  },
  description:
    "Curated dating events for Nashville singles aged 25-42. Rooftop tastings, hikes, dinner parties, and more. Stop swiping. Start connecting.",
  keywords: [
    "Nashville dating",
    "dating events Nashville",
    "singles events",
    "curated dating",
    "Nashville singles",
  ],
  openGraph: {
    title: "TRÜ Dating Nashville | Dating Done Differently",
    description:
      "Curated dating events for Nashville singles who are done with swiping. Rooftop tastings, hikes, dinner parties, and more.",
    type: "website",
    locale: "en_US",
    siteName: "TRÜ Dating Nashville",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRÜ Dating Nashville | Dating Done Differently",
    description:
      "Curated dating events for Nashville singles who are done with swiping.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" />
      </head>
      <body
        className={`${cormorant.variable} ${dmSans.variable} antialiased`}
      >
        <ToastProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <BottomTabBar />
        </ToastProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
