import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Fredoka, Geist, Geist_Mono, Pacifico, Titan_One } from "next/font/google";
import localFont from "next/font/local";
import { brandKey } from "@/lib/brand";
import { SITE } from "@/lib/site";
import "./globals.css";

// Site type: Fraunces (soft optical serif) for display, Geist for text, Geist Mono for small labels.
// Fraunces is self-hosted with its SOFT axis fixed at 100 and weight trimmed to 400–800,
// half the bytes of the full variable font with the same look (see fonts/README.md).
const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-soft.woff2", weight: "400 800", style: "normal" },
    { path: "./fonts/fraunces-soft-italic.woff2", weight: "400 800", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-geist-mono", display: "swap" });

// Fonts for text on stickers. Not preloaded: they download only when someone opens the text tool.
const bubbly = Fredoka({ subsets: ["latin"], weight: "700", variable: "--font-cap-bubbly", display: "swap", preload: false });
const bold = Bricolage_Grotesque({ subsets: ["latin"], weight: "800", variable: "--font-cap-bold", display: "swap", preload: false });
const chunky = Titan_One({ subsets: ["latin"], weight: "400", variable: "--font-cap-chunky", display: "swap", preload: false });
const script = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-cap-script", display: "swap", preload: false });
const hand = Caveat({ subsets: ["latin"], weight: "700", variable: "--font-cap-hand", display: "swap", preload: false });
const FONT_VARIABLES = [fraunces, geist, geistMono, bubbly, bold, chunky, script, hand].map((font) => font.variable).join(" ");

/** Applies a saved theme before first paint so there is no flash. */
const THEME_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(brandKey("theme"))});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.supportingLine,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.supportingLine,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#efeae2" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0e0d" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={FONT_VARIABLES} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
