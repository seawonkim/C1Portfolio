import { Space_Grotesk, Inter, Anybody } from "next/font/google";
import { site } from "@/data/projects";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

// Variable width + weight font for the stretchy name on the home screen
const kinetic = Anybody({
  subsets: ["latin"],
  variable: "--font-kinetic",
  axes: ["wdth"],
});

export const metadata = {
  title: `${site.name} — Portfolio`,
  description: site.tagline,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${kinetic.variable}`}>
      <body>{children}</body>
    </html>
  );
}
