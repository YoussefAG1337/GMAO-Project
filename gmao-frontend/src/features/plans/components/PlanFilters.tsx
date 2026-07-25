'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Atelier } from '@/types/equipement.types';

const FREQUENCES = ['HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE'];

const selectClass =
  'bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white';

/** URL-driven filter bar for the plans list. Changing a filter resets to page 1. */
export function PlanFilters({ ateliers }: { ateliers: Atelier[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete('page');
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={searchParams.get('actif') ?? ''}
        onChange={(e) => setFilter('actif', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les états</option>
        <option value="true">Actifs</option>
        <option value="false">Inactifs</option>
      </select>

      <select
        value={searchParams.get('frequence') ?? ''}
        onChange={(e) => setFilter('frequence', e.target.value)}
        className={selectClass}
      >
        <option value="">Toutes fréquences</option>
        {FREQUENCES.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('atelierId') ?? ''}
        onChange={(e) => setFilter('atelierId', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les ateliers</option>
        {ateliers.map((a) => (
          <option key={a.id} value={a.id}>
            {a.nom}
          </option>
        ))}
      </select>
    </div>
  );
}
