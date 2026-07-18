'use client';

import { OtCard } from './OtCard';

interface OtListProps {
  ots: any[];
  user: any;
  isAdminOrChefTech: boolean;
  onStart: (id: number) => void;
  onOpenRapport: (id: number) => void;
  onValiderTechnicien: (id: number) => void;
  onValidate: (id: number) => void;
  onReporter: (id: number) => void;
  onAnnuler: (id: number) => void;
  onNonValider: (id: number) => void;
  onReassign: (ot: any) => void;
  onEdit: (ot: any) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (ot: any) => void;
}

export function OtList({
  ots,
  user,
  isAdminOrChefTech,
  onStart,
  onOpenRapport,
  onValiderTechnicien,
  onValidate,
  onReporter,
  onAnnuler,
  onNonValider,
  onReassign,
  onEdit,
  onDelete,
  onOpenDetails,
}: OtListProps) {
  if (ots.length === 0) {
    return (
      <div className="col-span-full p-8 text-center text-muted-foreground">
        Aucun ordre de travail trouvé.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {ots.map((ot) => (
        <OtCard
          key={ot.id}
          ot={ot}
          user={user}
          isAdminOrChefTech={isAdminOrChefTech}
          onStart={onStart}
          onOpenRapport={onOpenRapport}
          onValiderTechnicien={onValiderTechnicien}
          onValidate={onValidate}
          onReporter={onReporter}
          onAnnuler={onAnnuler}
          onNonValider={onNonValider}
          onReassign={onReassign}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
