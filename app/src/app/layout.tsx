import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { GlassNav } from "@/components/ui/GlassNav";
import { DrawerProvider } from "@/components/dashboard/MarkdownDrawer";
import { CommandPalette } from "@/components/ui/CommandPalette";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sensai Studio — AgenticOS",
  description: "Read-only observability deck for the Sensai Compilar harness.",
};

export const viewport: Viewport = {
  themeColor: "#0E1015",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-void text-ink antialiased">
        <DrawerProvider>
          {/* CommandPalette is inside DrawerProvider so it can call useDrawer() */}
          <CommandPalette />
          <GlassNav />
          <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-10 md:pt-24">
            {children}
          </main>
        </DrawerProvider>
      </body>
    </html>
  );
}
