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
  // --- Basic Metadata ---
  title: "Central University of Kerala Convocation 2025", // Title in browser tab & search results
  description: "Register online for the Central University of Kerala Convocation 2025. Secure your spot for the ceremony.", // Search result snippet
  keywords: ["CUK", "Central University of Kerala", "Convocation", "Registration", "Graduation", "Kerala", "University"], // Keywords for SEO (less critical now but still useful)
  applicationName: "CUK Convocation Registration", // Name for installed web apps

  // --- Viewport & Theme ---
  viewport: "width=device-width, initial-scale=1", // Controls layout on mobile browsers
  themeColor: "#000000", // Suggested color for browser UI elements (e.g., mobile address bar)

  // --- Open Graph Metadata (for Facebook, LinkedIn, Pinterest, WhatsApp, etc.) ---
  openGraph: {
    title: "CUK Convocation 2025 Registration", // Title shown when shared
    description: "Register online for the Central University of Kerala Convocation 2025.", // Description shown when shared
    url: "https://your-website-url.com", // *** REPLACE with your actual deployed website URL ***
    siteName: "CUK Convocation Registration",
    images: [ // An array of images to use for previews
      {
        url: "https://your-website-url.com/og-image.png", // *** REPLACE with a URL to a preview image (e.g., 1200x630px) ***
        width: 1200,
        height: 630,
        alt: "Central University of Kerala Logo",
      },
      // You can add more image sizes if needed
    ],
    locale: "en_IN", // Specifies the language/region
    type: "website", // Type of content (can be 'article', etc.)
  },

  // --- Twitter Card Metadata (for Twitter/X previews) ---
  // twitter: {
  //   card: "summary_large_image", // Type of card ('summary', 'summary_large_image', 'app', 'player')
  //   title: "CUK Convocation 2025 Registration", // Title shown on Twitter
  //   description: "Register online for the Central University of Kerala Convocation 2025.", // Description shown on Twitter
  //   // creator: "@yourTwitterHandle", // Optional: Your Twitter handle
  //   images: ["https://your-website-url.com/twitter-image.png"], // *** REPLACE with a URL to a Twitter preview image (e.g., square or rectangular based on card type) ***
  // },

  // --- Icons ---
  icons: {
    icon: "/favicon.ico", // Standard favicon
    apple: "/apple-touch-icon.png", // Icon for Apple devices
    // shortcut: '/shortcut-icon.png' // You can add other icon types
  },

  // --- Other potentially useful tags ---
  robots: { // Controls search engine indexing (defaults are usually fine)
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: { // For verifying ownership in search consoles
  //  google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  //  yandex: 'YOUR_YANDEX_VERIFICATION_CODE',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
