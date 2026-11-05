import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ConsoleSilencer } from "@/components/ConsoleSilencer";

export const metadata: Metadata = {
  title: "NODD MEN · Facial Analysis",
  description:
    "A precise analysis of your face, built for men's grooming. One front-facing photo. Facial landmarks are mapped and nine structural attributes classified.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4F2C1D",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Sora:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <ConsoleSilencer />
        {children}
      </body>
    </html>
  );
}
