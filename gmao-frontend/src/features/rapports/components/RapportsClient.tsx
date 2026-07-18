'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRapports } from '@/features/rapports/hooks/useRapports';
import { Rapport } from '@/types/rapport.types';

import { RapportsHeader } from '@/features/rapports/components/RapportsHeader';
import { RapportsList } from '@/features/rapports/components/RapportsList';

interface RapportsClientProps {
  initialRapports: Rapport[];
}

export function RapportsClient({ initialRapports }: RapportsClientProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { rapports } = useRapports(initialRapports);

  const filteredRapports =
    rapports.filter((r: Rapport) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        r.diagnostic?.toLowerCase().includes(searchLower) ||
        r.actionsRealisees?.toLowerCase().includes(searchLower) ||
        r.ordreTravail?.numeroOT?.toLowerCase().includes(searchLower) ||
        r.redacteur?.nom?.toLowerCase().includes(searchLower) ||
        r.redacteur?.prenom?.toLowerCase().includes(searchLower)
      );
    }) || [];

  return (
    <div className="space-y-6 animate-fade-in-up">
      <RapportsHeader userRole={user?.role} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <RapportsList filteredRapports={filteredRapports} />
    </div>
  );
}
