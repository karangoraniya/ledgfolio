import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { Providers } from "./provider";
import { LedgerProvider } from "@/components/LedgerContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "LedgeFolio",
  description: "One Stop For Your Ledger",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased theme-custom`}
      >
        <Providers>
          <LedgerProvider>
            <div className="flex h-screen bg-background">
              <Toaster position="top-center" />
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
                  <div className="container mx-auto px-6 py-8">{children}</div>
                </main>
              </div>
            </div>
          </LedgerProvider>
        </Providers>
      </body>
    </html>
  );
}
