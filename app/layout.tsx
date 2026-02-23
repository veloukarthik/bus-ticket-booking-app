import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./providers/UserProvider";
import ServiceWorkerRegister from "./components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LetsGo - Car Booking Marketplace",
  description: "LetsGo connects vehicle owners and passengers for fast, secure ride bookings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#4f46e5" />
        <link rel="apple-touch-icon" href="/icons/favicon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <UserProvider>
          <ServiceWorkerRegister />
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
