'use client';

import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { UseFormRegister, FieldErrors } from 'react-hook-form';

export const numberOrUndefined = (v: string) => (v === '' || v == null ? undefined : Number(v));

interface EquipmentSelectProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watchAtelierId?: number;
  watchLigneId?: number;
  ateliers: Atelier[];
  lignes: Ligne[];
  postes: Poste[];
}

export function EquipmentSelect({
  register,
  errors,
  watchAtelierId,
  watchLigneId,
  ateliers,
  lignes,
  postes,
}: EquipmentSelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Atelier</label>
        <select
          {...register('atelierId', { setValueAs: numberOrUndefined })}
          className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.atelierId ? 'border-red-500' : ''}`}
        >
          <option value="">Sélectionner</option>
          {ateliers?.map((a: Atelier) => (
            <option key={a.id} value={a.id}>
              {a.nom}
            </option>
          ))}
        </select>
        {errors.atelierId && (
          <p className="text-[10px] text-red-400">{errors.atelierId.message as string}</p>
        )}
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Ligne</label>
        <select
          {...register('ligneId', { setValueAs: numberOrUndefined })}
          className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.ligneId ? 'border-red-500' : ''}`}
        >
          <option value="">Sélectionner</option>
          {lignes
            ?.filter(
              (l: Ligne) =>
                !watchAtelierId || l.atelierId === watchAtelierId || isNaN(watchAtelierId),
            )
            .map((l: Ligne) => (
              <option key={l.id} value={l.id}>
                {l.nom}
              </option>
            ))}
        </select>
        {errors.ligneId && (
          <p className="text-[10px] text-red-400">{errors.ligneId.message as string}</p>
        )}
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-white">Poste (Équipement)</label>
        <select
          {...register('posteId', { setValueAs: numberOrUndefined })}
          className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.posteId ? 'border-red-500' : ''}`}
        >
          <option value="">Sélectionner</option>
          {postes
            ?.filter(
              (p: Poste) => !watchLigneId || p.ligneId === watchLigneId || isNaN(watchLigneId),
            )
            .map((p: Poste) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
        </select>
        {errors.posteId && (
          <p className="text-[10px] text-red-400">{errors.posteId.message as string}</p>
        )}
      </div>
    </div>
  );
}
