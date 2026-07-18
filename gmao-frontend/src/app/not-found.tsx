import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-muted/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Page introuvable</CardTitle>
          <CardDescription className="text-base mt-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-2 pb-6">
          <p className="text-sm text-muted-foreground">
            Code d'erreur : 404
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Link href="/dashboard" className={buttonVariants({ size: "lg" }) + " w-full"}>
            Retourner au tableau de bord
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
