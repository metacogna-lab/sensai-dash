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
          <main className="mx-auto w-full max-w-7xl px-6 pb-28 pt-8 sm:px-8 md:pb-12 md:pt-28 lg:px-10 lg:pt-32">
            {children}
          </main>
        </DrawerProvider>
      </body>
    </html>
  );
}
