import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Success Enterprise | Pure Groundnut Oil Distribution",
  description:
    "Success Enterprise specializes in the production and distribution of high-quality, natural groundnut oil for homes, businesses, and wholesalers. Trust us for purity, consistency, and customer satisfaction.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Success Enterprise | Pure Groundnut Oil Distribution",
    description:
      "Premium groundnut oil for homes, restaurants, and retailers. Experience unmatched purity and flavor from Success Enterprise.",
    url: "https://www.successenterprise.com",
    siteName: "Success Enterprise",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Bottles of pure groundnut oil by Success Enterprise",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Success Enterprise | Pure Groundnut Oil Distribution",
    description:
      "High-quality, natural groundnut oil you can trust. Distributed by Success Enterprise.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
