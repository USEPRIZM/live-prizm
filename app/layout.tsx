import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import CommandPalette from "@/components/CommandPalette";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prizm | Unblind the Data",
  description: "A high-fidelity, no-code sandbox for independent traders to simulate and verify market strategies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#03000A] text-sandbox-text selection:bg-brand-purple/30 overflow-x-hidden">
        <AuthProvider>
          <CommandPalette />
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
