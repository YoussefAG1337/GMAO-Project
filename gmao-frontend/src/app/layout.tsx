import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { AppInsightsProvider } from '@/components/AppInsightsProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GMAO Pro | Gestion de Maintenance',
  description:
    'Système de Gestion de Maintenance Assistée par Ordinateur — Suivi des équipements, interventions et stock de pièces.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`dark ${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AppInsightsProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppInsightsProvider>
        <Toaster position="top-right" richColors closeButton theme="dark" />
      </body>
    </html>
  );
}
