'use client';

import { DiCard } from './DiCard';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { Di } from '@/types/di.types';
import { User } from '@/types';

interface DiListProps {
  currentUserId?: number;
  dis: Di[];
  user: User | null;
  isAdmin: boolean;
  isAdminOrChef: boolean;
  isTechnician: boolean;
  onEdit: (di: Di) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (di: Di) => void;
  onStartWork: (id: number) => void;
}

export function DiList({
  dis,
  user,
  isAdmin,
  isAdminOrChef,
  isTechnician,
  currentUserId,
  onEdit,
  onDelete,
  onOpenDetails,
  onStartWork,
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
            isAdmin={isAdmin}
            isAdminOrChef={isAdminOrChef}
            isTechnician={isTechnician}
            currentUserId={currentUserId}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpenDetails={onOpenDetails}
            onStartWork={onStartWork}
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
