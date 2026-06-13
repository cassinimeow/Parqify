import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
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
  title: "Parqify - PUP Manila Community Parking",
  description: "Real-time smart parking selection and reservation system for PUP Manila.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${outfitFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}

