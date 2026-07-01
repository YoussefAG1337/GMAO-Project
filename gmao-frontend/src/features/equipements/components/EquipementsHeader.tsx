'use client';

import { Button } from '@/components/ui/button';
import { Factory, Plus } from 'lucide-react';

interface EquipementsHeaderProps {
  isAdminOrChef: boolean;
  onOpenModal: (type: 'ATELIER' | 'LIGNE' | 'POSTE') => void;
}

export function EquipementsHeader({ isAdminOrChef, onOpenModal }: EquipementsHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
      <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#651FAA]/10 rounded-full blur-2xl" />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Factory className="w-8 h-8 text-purple-400" />
            Référentiel Équipements
          </h2>
          <p className="text-muted-foreground mt-2">
            Gestion des ateliers, lignes de production et postes de travail.
          </p>
        </div>
        {isAdminOrChef && (
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={() => onOpenModal('ATELIER')}
              className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
            >
              <Plus className="w-4 h-4 mr-2" /> Atelier
            </Button>
            <Button
              onClick={() => onOpenModal('LIGNE')}
              className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
            >
              <Plus className="w-4 h-4 mr-2" /> Ligne
            </Button>
            <Button
              onClick={() => onOpenModal('POSTE')}
              className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
            >
              <Plus className="w-4 h-4 mr-2" /> Poste
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
