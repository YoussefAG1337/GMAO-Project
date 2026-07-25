'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRapports } from '@/features/rapports/hooks/useRapports';
import { Rapport } from '@/types/rapport.types';
import { PaginatedResponse } from '@/types/api.types';
import { parseListParams } from '@/lib/pagination';

import { RapportsHeader } from '@/features/rapports/components/RapportsHeader';
import { RapportsList } from '@/features/rapports/components/RapportsList';
import { Pagination } from '@/components/ui/pagination';

interface RapportsClientProps {
  initialData: PaginatedResponse<Rapport>;
}

export function RapportsClient({ initialData }: RapportsClientProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const searchParams = useSearchParams();
  const params = parseListParams(Object.fromEntries(searchParams.entries()));
  const { rapports, total, page, totalPages } = useRapports(params, initialData);

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
      <Pagination page={page} totalPages={totalPages} total={total} />
    </div>
  );
}
