'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { submitRapportSchema, type SubmitRapportFormData } from '@/lib/validations/ot';

interface OtRapportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitRapportFormData) => Promise<void>;
  magasinPieces?: any[];
}

export function OtRapportModal({
  isOpen,
  onClose,
  onSubmit,
  magasinPieces = [],
}: OtRapportModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SubmitRapportFormData>({
    resolver: zodResolver(submitRapportSchema),
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'piecesUtilisees',
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        diagnostic: '',
        causePanne: '',
        actionsRealisees: '',
        tempsIntervention: undefined as any,
        tempsArret: undefined,
        piecesUtilisees: [],
        commentaires: '',
      });
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Soumettre un rapport d'intervention">
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Diagnostic</label>
          <textarea
            {...register('diagnostic')}
            rows={2}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.diagnostic ? 'border-red-500' : ''}`}
          />
          {errors.diagnostic && (
            <p className="text-[10px] text-red-400">{errors.diagnostic.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Cause de la Panne (optionnel)</label>
          <input
            type="text"
            {...register('causePanne')}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.causePanne ? 'border-red-500' : ''}`}
          />
          {errors.causePanne && (
            <p className="text-[10px] text-red-400">{errors.causePanne.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Actions réalisées</label>
          <textarea
            {...register('actionsRealisees')}
            rows={3}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.actionsRealisees ? 'border-red-500' : ''}`}
          />
          {errors.actionsRealisees && (
            <p className="text-[10px] text-red-400">{errors.actionsRealisees.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Temps d&apos;intervention (minutes)
            </label>
            <input
              type="number"
              {...register('tempsIntervention', { valueAsNumber: true })}
              min="1"
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.tempsIntervention ? 'border-red-500' : ''}`}
            />
            {errors.tempsIntervention && (
              <p className="text-[10px] text-red-400">{errors.tempsIntervention.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Temps d&apos;arrêt machine (minutes)
            </label>
            <input
              type="number"
              {...register('tempsArret', { valueAsNumber: true })}
              min="0"
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.tempsArret ? 'border-red-500' : ''}`}
            />
            {errors.tempsArret && (
              <p className="text-[10px] text-red-400">{errors.tempsArret.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Pièces utilisées (Magasin)</label>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => append({ pieceId: 0, quantite: 1 })}
              className="text-emerald-400 hover:text-emerald-300"
            >
              + Ajouter
            </Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {fields.map((field, idx) => (
              <div key={field.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <select
                    {...register(`piecesUtilisees.${idx}.pieceId`, { valueAsNumber: true })}
                    className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white ${errors.piecesUtilisees?.[idx]?.pieceId ? 'border-red-500' : ''}`}
                  >
                    <option value={0} disabled>
                      Sélectionner une pièce
                    </option>
                    {magasinPieces.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {mp.nom} ({mp.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    {...register(`piecesUtilisees.${idx}.quantite`, { valueAsNumber: true })}
                    min="1"
                    className={`w-20 bg-zinc-900 border border-white/10 rounded-lg p-2 text-white ${errors.piecesUtilisees?.[idx]?.quantite ? 'border-red-500' : ''}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="text-rose-400 p-2 hover:bg-rose-400/10 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="bg-purple-500 hover:bg-purple-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Soumission...' : 'Soumettre'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
