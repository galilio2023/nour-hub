import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "QAMAR - Kids Creative Web App",
  description: "A safe and empowering platform for children to create and share art, music, and stories.",
  openGraph: {
    title: "QAMAR - Kids Creative Web App",
    description: "A safe and empowering platform for children to create and share art, music, and stories.",
    url: "https://qamar.app",
    siteName: "QAMAR",
    images: [
      {
        url: "/next.svg", // Replace with a real og-image when available
        width: 800,
        height: 600,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QAMAR - Kids Creative Web App",
    description: "A safe and empowering platform for children to create and share art, music, and stories.",
    images: ["/next.svg"],
  },
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const locale = params.locale;
  const children = props.children;

  // Validate that the incoming `locale` parameter is valid
  if (!['en', 'ar'].includes(locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
