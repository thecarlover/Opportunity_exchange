import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/navbar";
import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Solvd.io — Connect Business Opportunities with Expert Solutions",
  description:
    "A marketplace where businesses post opportunities and solution providers submit tailored applications. Find your match today.",
  openGraph: {
    title: "Solvd.io",
    description: "Connect Business Opportunities with Expert Solutions",
    url: "https://solvd.io",
    siteName: "Solvd.io",
    images: [
      {
        url: "https://solvd.io/og.jpg",
        width: 1200,
        height: 630,
        alt: "Solvd.io Social Cover",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solvd.io",
    description: "Connect Business Opportunities with Expert Solutions",
    images: ["https://solvd.io/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-64px)]">{children}</main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
