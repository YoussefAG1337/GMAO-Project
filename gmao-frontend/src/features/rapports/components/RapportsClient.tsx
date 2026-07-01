'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { RapportsHeader } from '@/features/rapports/components/RapportsHeader';
import { RapportsList } from '@/features/rapports/components/RapportsList';

const fetcher = (url: string) => api.get(url).then((res: any) => res.data);

interface RapportsClientProps {
  initialRapports: any[];
}

export function RapportsClient({ initialRapports }: RapportsClientProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rapports } = useSWR('/ots/rapports', fetcher, {
    fallbackData: initialRapports,
  });

  const filteredRapports =
    rapports?.filter((r: any) => {
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
