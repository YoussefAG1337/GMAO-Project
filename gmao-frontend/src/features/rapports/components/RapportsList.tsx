'use client';

import { RapportCard } from './RapportCard';

interface RapportsListProps {
  filteredRapports: any[];
}

export function RapportsList({ filteredRapports }: RapportsListProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {filteredRapports.map((rapport: any) => (
        <RapportCard key={rapport.id} rapport={rapport} />
      ))}
      {filteredRapports.length === 0 && (
        <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
          <p className="text-muted-foreground">Aucun rapport trouvé.</p>
        </div>
      )}
    </div>
  );
}
