'use client';

import { Inter } from 'next/font/google';
import { Geist_Mono } from 'next/font/google';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
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

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html
      lang="fr"
      className={`dark ${inter.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col items-center justify-center bg-background text-foreground p-4">
        <Card className="w-full max-w-md mx-auto shadow-xl border-destructive/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Erreur fatale</CardTitle>
            <CardDescription className="text-base mt-2">
              L&apos;application a rencontré une erreur inattendue et ne peut pas continuer.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-2 pb-6">
            <div className="bg-muted/50 p-4 rounded-md overflow-x-auto text-left border border-border/50">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.message || "Une erreur inconnue s'est produite."}
              </p>
              {error.digest && (
                <p className="text-xs font-mono text-muted-foreground mt-2 opacity-70">
                  Digest: {error.digest}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={() => reset()}>
              Réessayer
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = '/')}
            >
              Retourner à l&apos;accueil
            </Button>
          </CardFooter>
        </Card>
      </body>
    </html>
  );
}
