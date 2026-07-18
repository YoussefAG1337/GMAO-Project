'use client';

import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { planSchema, type PlanFormData } from '@/lib/validations/plan';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PlanFormData) => Promise<void>;
  isEditing: boolean;
  initialData?: any;
  ateliers: Atelier[];
  lignes: Ligne[];
  postes: Poste[];
}

export function PlanFormModal({
  isOpen,
  onClose,
  onSubmit,
  isEditing,
  initialData,
  ateliers,
  lignes,
  postes,
}: PlanFormModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    mode: 'onChange',
  });

  const watchedAtelierId = useWatch({ control, name: 'atelierId' });
  const watchedLigneId = useWatch({ control, name: 'ligneId' });

  useEffect(() => {
    if (isOpen) {
      reset({
        intitule: initialData?.intitule || '',
        description: initialData?.description || '',
        atelierId: initialData?.atelierId ? Number(initialData.atelierId) : (undefined as any),
        ligneId: initialData?.ligneId ? Number(initialData.ligneId) : (undefined as any),
        posteId: initialData?.posteId ? Number(initialData.posteId) : (undefined as any),
        frequence: initialData?.frequence || 'MENSUELLE',
        prochaineExecution: initialData?.prochaineExecution || '',
      });
    }
  }, [isOpen, initialData, reset]);

  // Filter lignes/postes based on parent selection
  const filteredLignes = lignes?.filter(
    (l: Ligne) => !watchedAtelierId || l.atelierId === Number(watchedAtelierId),
  );
  const filteredPostes = postes?.filter(
    (p: Poste) => !watchedLigneId || p.ligneId === Number(watchedLigneId),
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Modifier le Plan' : 'Créer un Plan de Maintenance'}
    >
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Intitulé du plan</label>
          <Input
            type="text"
            {...register('intitule')}
            placeholder="Ex: Entretien mensuel compresseur"
            className={errors.intitule ? 'border-red-500' : ''}
          />
          {errors.intitule && <p className="text-[10px] text-red-400">{errors.intitule.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Atelier</label>
            <select
              {...register('atelierId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.atelierId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>
                Sélectionner
              </option>
              {ateliers?.map((a: Atelier) => (
                <option key={a.id} value={a.id}>
                  {a.nom}
                </option>
              ))}
            </select>
            {errors.atelierId && (
              <p className="text-[10px] text-red-400">{errors.atelierId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ligne</label>
            <select
              {...register('ligneId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.ligneId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>
                Sélectionner
              </option>
              {filteredLignes?.map((l: Ligne) => (
                <option key={l.id} value={l.id}>
                  {l.nom}
                </option>
              ))}
            </select>
            {errors.ligneId && <p className="text-[10px] text-red-400">{errors.ligneId.message}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Poste (Équipement cible)</label>
            <select
              {...register('posteId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.posteId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>
                Sélectionner
              </option>
              {filteredPostes?.map((p: Poste) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
            </select>
            {errors.posteId && <p className="text-[10px] text-red-400">{errors.posteId.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description et instructions</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Fréquence</label>
            <select
              {...register('frequence')}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.frequence ? 'border-red-500' : ''}`}
            >
              <option value="HEBDOMADAIRE">Hebdomadaire</option>
              <option value="MENSUELLE">Mensuelle</option>
              <option value="TRIMESTRIELLE">Trimestrielle</option>
              <option value="SEMESTRIELLE">Semestrielle</option>
              <option value="ANNUELLE">Annuelle</option>
            </select>
            {errors.frequence && (
              <p className="text-[10px] text-red-400">{errors.frequence.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Première/Prochaine exécution</label>
            <Input
              type="date"
              {...register('prochaineExecution')}
              className={errors.prochaineExecution ? 'border-red-500' : ''}
            />
            {errors.prochaineExecution && (
              <p className="text-[10px] text-red-400">{errors.prochaineExecution.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer le Plan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
