'use client';

import { DiCard } from './DiCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

interface DiListProps {
  dis: any[];
  isAdminOrChef: boolean;
  isAdminOrChefTech: boolean;
  onOpenCreateOT: (di: any) => void;
  onEdit: (di: any) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (di: any) => void;
}

export function DiList({
  dis,
  isAdminOrChef,
  isAdminOrChefTech,
  onOpenCreateOT,
  onEdit,
  onDelete,
  onOpenDetails,
}: DiListProps) {
  return (
    <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-xl">
      <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
        <h3 className="font-semibold text-white">Dernières Demandes</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Filter className="w-4 h-4 mr-2" /> Filtres
        </Button>
      </div>

      <div className="divide-y divide-white/[0.06]">
        {dis.map((di) => (
          <DiCard
            key={di.id}
            di={di}
            isAdminOrChef={isAdminOrChef}
            isAdminOrChefTech={isAdminOrChefTech}
            onOpenCreateOT={onOpenCreateOT}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenDetails={onOpenDetails}
          />
        ))}
        {dis.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            Aucune demande d&apos;intervention trouvée.
          </div>
        )}
      </div>
    </div>
  );
}
