'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EquipmentSelect } from '@/components/EquipmentSelect';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { createOtSchema, type CreateOtFormData } from '@/lib/validations/ot';

interface OtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateOtFormData) => Promise<void>;
  ateliers: Atelier[];
  lignes: Ligne[];
  postes: Poste[];
}

export function OtFormModal({
  isOpen,
  onClose,
  onSubmit,
  ateliers,
  lignes,
  postes,
}: OtFormModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateOtFormData>({
    resolver: zodResolver(createOtSchema),
    mode: 'onChange',
    defaultValues: {
      priorite: 'MOYENNE',
      typeMaintenance: 'CORRECTIVE',
    },
  });

  const watchAtelierId = watch('atelierId');
  const watchLigneId = watch('ligneId');

  useEffect(() => {
    if (isOpen) {
      reset({
        priorite: 'MOYENNE',
        typeMaintenance: 'CORRECTIVE',
        description: '',
        datePrevue: '',
        atelierId: undefined,
        ligneId: undefined,
        posteId: undefined,
        technicienId: undefined,
      });
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer un Ordre de Travail">
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        <EquipmentSelect
          register={register}
          errors={errors}
          watchAtelierId={watchAtelierId}
          watchLigneId={watchLigneId}
          ateliers={ateliers}
          lignes={lignes}
          postes={postes}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Description de l&apos;intervention
          </label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Détaillez le travail à effectuer..."
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground ${errors.description ? 'border-red-500' : ''}`}
          />
          {errors.description && <p className="text-[10px] text-red-400">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Priorité</label>
            <select
              {...register('priorite')}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.priorite ? 'border-red-500' : ''}`}
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="CRITIQUE">Critique</option>
            </select>
            {errors.priorite && <p className="text-[10px] text-red-400">{errors.priorite.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Type de maintenance</label>
            <select
              {...register('typeMaintenance')}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.typeMaintenance ? 'border-red-500' : ''}`}
            >
              <option value="PREVENTIVE">Préventive</option>
              <option value="CURATIVE">Curative</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="AMELIORATIVE">Améliorative</option>
            </select>
            {errors.typeMaintenance && <p className="text-[10px] text-red-400">{errors.typeMaintenance.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Date prévue (optionnel)</label>
          <input
            type="date"
            {...register('datePrevue')}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground ${errors.datePrevue ? 'border-red-500' : ''}`}
          />
          {errors.datePrevue && <p className="text-[10px] text-red-400">{errors.datePrevue.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid} className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
            {isSubmitting ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
