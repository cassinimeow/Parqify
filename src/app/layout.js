import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import ChatbotWidget from "@/components/ui/ChatbotWidget";
import Footer from "@/components/ui/Footer";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfitFont = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Parqify - PUP ITECH Community Parking",
  description: "Real-time smart parking selection and reservation system for PUP ITECH.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${outfitFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ChatbotWidget />
          <Analytics />
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

