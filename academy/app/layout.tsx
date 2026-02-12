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
  title: "Ethos Academy",
  description:
    "Trust visualization for AI agents — honesty, accuracy, and intent across 12 behavioral traits.",
};

function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal text-white text-sm font-bold">
            E
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Ethos Academy
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <span className="text-foreground font-medium">Dashboard</span>
          <span>Agents</span>
          <span>Cohort</span>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <Header />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
