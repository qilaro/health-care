"use client";

import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EmergencyBanner from "@/components/layout/EmergencyBanner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MedQ – Learn more. Live better.</title>
        <meta name="description" content="MedQ is your trusted source for comprehensive drug information, interaction checking, and medication guidance." />
      </head>
      <body className="bg-white min-h-screen flex flex-col">
        <EmergencyBanner />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
