import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const structuredData = {
  "@context": "https://schema.org",
  "@type": "HealthAndBeautyBusiness",
  "name": "Breakthrough Fitness",
  "description": "Personal training and fitness coaching services with personalized programs, progress tracking, and expert guidance.",
  "url": "https://breakthroughfitness.com",
  "image": "/assets/logo-circle-full.png",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "sameAs": [
    // Add your social media URLs here
  ],
  "offers": {
    "@type": "Offer",
    "name": "Personal Fitness Coaching",
    "description": "Comprehensive fitness coaching including personalized training plans, nutrition guidance, and progress tracking",
    "price": "Contact for pricing",
    "priceCurrency": "USD"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Fitness Coaching Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Custom Training Plan",
          "description": "Personalized workout routines based on your fitness level"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Weekly Check-ins",
          "description": "1-on-1 video calls with your coach"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Progress Tracking",
          "description": "Advanced analytics dashboard and body composition tracking"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Nutrition Guidance",
          "description": "Customized meal planning support and macro recommendations"
        }
      }
    ]
  }
};

export const metadata: Metadata = {
  title: "Breakthrough Fitness | Personal Training & Fitness Coaching",
  description: "Transform your body and achieve sustainable fitness results with personalized training programs, expert 1-on-1 coaching, progress tracking, and nutrition guidance. Book your free consultation today!",
  keywords: "personal trainer, fitness coach, online fitness coaching, personalized workout plans, nutrition guidance, fitness transformation, breakthrough fitness, weight loss, muscle gain, fitness tracking",
  authors: [{ name: "Breakthrough Fitness" }],
  creator: "Breakthrough Fitness",
  publisher: "Breakthrough Fitness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://breakthroughfitness.com'), // Replace with your actual domain
  openGraph: {
    title: "Breakthrough Fitness | Transform Your Body, Transform Your Life",
    description: "Get personalized fitness programs, expert coaching, and achieve the results you've always wanted. Book your free consultation today!",
    url: 'https://breakthroughfitness.com',
    siteName: 'Breakthrough Fitness',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/assets/og-image-1200x630.jpg',
        width: 1200,
        height: 630,
        alt: 'Breakthrough Fitness - Personal Training',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Breakthrough Fitness | Personal Training & Coaching",
    description: "Transform your body with personalized fitness programs and expert coaching. Book your free consultation today!",
    images: ['/assets/og-image-1200x630.jpg'],
  },
  robots: {
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
  verification: {
    google: 'your-google-verification-code', // Add your actual verification codes
    yandex: 'your-yandex-verification-code',
  },
  icons: {
    icon: [
      { url: '/assets/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/icon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/assets/icon-64x64.png', sizes: '64x64', type: 'image/png' },
      { url: '/assets/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { url: '/assets/icon-256x256.png', sizes: '256x256', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'icon', url: '/favicon.ico' },
      { rel: 'manifest', url: '/manifest.json' },
    ],
  },
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
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
