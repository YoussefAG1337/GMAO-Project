'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function TechnicianView() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60 px-1">
        Mes Interventions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden border-amber-500/20 bg-amber-500/5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/40 shadow-lg group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-amber-400 tracking-wide uppercase">
                À Faire Aujourd&apos;hui
              </span>
              <div className="p-2 rounded-xl border bg-amber-500/10 text-amber-400 border-amber-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground/80 font-medium mb-4">
                Vous avez des ordres de travail en attente dans votre file.
              </p>
              <Link
                href="/dashboard/ots"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-500/20',
                )}
              >
                Voir mes interventions assignées
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-[#651FAA]/20 bg-[#651FAA]/5 backdrop-blur-xl transition-all duration-300 hover:border-[#651FAA]/40 shadow-lg group">
          <CardContent className="p-6 flex flex-col justify-between h-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-400 tracking-wide uppercase">
                Signaler un Incident
              </span>
              <div className="p-2 rounded-xl border bg-[#651FAA]/10 text-purple-400 border-[#651FAA]/20">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground/80 font-medium mb-4">
                Signalez une nouvelle panne détectée sur le terrain.
              </p>
              <Link
                href="/dashboard/dis"
                className={cn(
                  buttonVariants({ variant: 'default' }),
                  'w-full bg-[#651FAA] hover:bg-purple-600 text-white font-bold shadow-lg shadow-[#651FAA]/20',
                )}
              >
                Créer une Demande (DI)
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
