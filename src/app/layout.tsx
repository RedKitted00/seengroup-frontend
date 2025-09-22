import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import { ColorSchemeScript } from "@mantine/core";
import ThemeController from "./components/ThemeController";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Seen Group - We Supply Your Growth",
  description: "Seen Group provides comprehensive solutions to supply your business growth with innovative products and services.",
  icons: {
    icon: '/imgs/favicon.png',
    shortcut: '/imgs/favicon.png',
    apple: '/imgs/favicon.png',
  },
  manifest: '/site.webmanifest',
  keywords: [
    "Seen Group",
    "business growth",
    "supply solutions",
    "innovation",
    "products",
    "services"
  ],
  authors: [{ name: "Seen Group" }],
  creator: "Seen Group",
  publisher: "Seen Group",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Seen Group - We Supply Your Growth",
    description: "Seen Group provides comprehensive solutions to supply your business growth with innovative products and services.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seen Group - We Supply Your Growth",
    description: "Seen Group provides comprehensive solutions to supply your business growth with innovative products and services.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-mantine-color-scheme="dark" className="">
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <LanguageProvider>
          <ThemeController>
            {children}
          </ThemeController>
        </LanguageProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}

