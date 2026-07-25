'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Atelier } from '@/types/equipement.types';

const STATUTS = [
  'CREE',
  'ASSIGNE',
  'EN_COURS',
  'REPORTE',
  'RAPPORTE',
  'EN_ATTENTE_VALIDATION',
  'NON_VALIDE',
  'ANNULE',
  'FERME',
];
const TYPES = ['CORRECTIVE', 'PREVENTIVE'];

const selectClass =
  'bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-sm text-white';

/** URL-driven filter bar for the OT list. Changing a filter resets to page 1. */
export function OtFilters({ ateliers }: { ateliers: Atelier[] }) {
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
        value={searchParams.get('statut') ?? ''}
        onChange={(e) => setFilter('statut', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les statuts</option>
        {STATUTS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        value={searchParams.get('typeMaintenance') ?? ''}
        onChange={(e) => setFilter('typeMaintenance', e.target.value)}
        className={selectClass}
      >
        <option value="">Tous les types</option>
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
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
