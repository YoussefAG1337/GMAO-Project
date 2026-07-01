'use client';

import { OtCard } from './OtCard';

interface OtListProps {
  ots: any[];
  user: any;
  isAdminOrChefTech: boolean;
  onStart: (id: number) => void;
  onOpenRapport: (id: number) => void;
  onValidate: (id: number) => void;
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
  onValidate,
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
          onValidate={onValidate}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenDetails={onOpenDetails}
        />
      ))}
    </div>
  );
}
