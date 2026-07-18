'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service like AppInsights
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md mx-auto shadow-xl border-destructive/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">Erreur d'affichage</CardTitle>
          <CardDescription className="text-sm mt-2">
            Un problème est survenu lors du chargement de cette section.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-2 pb-6">
          <div className="bg-muted/50 p-3 rounded-md overflow-x-auto text-left border border-border/50">
            <p className="text-xs font-mono text-muted-foreground break-all">
              {error.message || "Une erreur inconnue s'est produite."}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button size="default" className="w-full" onClick={() => reset()}>
            Réessayer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
