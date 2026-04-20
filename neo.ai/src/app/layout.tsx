import type { Metadata } from "next";
import { Montserrat, Lora, Cinzel_Decorative, Geist_Mono } from "next/font/google";
import "./globals.css";

import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar" // Import Sidebar here
import { Toaster } from "@/components/ui/sonner"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const cinzel = Cinzel_Decorative({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Neo AI",
  description: "Next-gen AI interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className={`${montserrat.variable} ${lora.variable} ${cinzel.variable} ${geistMono.variable} antialiased font-sans`}>
        <SidebarProvider defaultOpen={true}>
          <TooltipProvider>
            <div className="flex min-h-screen w-full">
              {/* 1. Add the actual Sidebar component here */}
              <Sidebar>
                <div className="flex flex-col gap-4 p-4">
                  <h2 className="font-bold">Neo AI</h2>
                  {/* Your navigation links go here */}
                </div>
              </Sidebar>

              {/* 2. Wrap children in a main tag to handle the rest of the space */}
              <main className="flex-1 overflow-hidden">
                {children}
              </main>
            </div>

            <Toaster position="top-right" richColors theme="dark" />
          </TooltipProvider>
        </SidebarProvider>
      </body>
    </html>
  );
}
