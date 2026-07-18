'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { User } from '@/types/index';
import { updateOtSchema, type UpdateOtFormData } from '@/lib/validations/ot';

interface OtEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateOtFormData) => Promise<void>;
  initialData: any;
  techniciens: User[];
}

export function OtEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  techniciens,
}: OtEditModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UpdateOtFormData>({
    resolver: zodResolver(updateOtSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        description: initialData.description || '',
        priorite: initialData.priorite || 'MOYENNE',
        datePrevue: initialData.datePrevue || '',
        technicienId: initialData.technicienId ? Number(initialData.technicienId) : undefined,
      });
    }
  }, [isOpen, initialData, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'Ordre de Travail">
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Description de l&apos;intervention
          </label>
          <textarea
            {...register('description')}
            rows={3}
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
            <label className="text-sm font-medium text-white">Technicien</label>
            <select
              {...register('technicienId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.technicienId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>Non assigné</option>
              {techniciens.map((tech: User) => (
                <option key={tech.id} value={tech.id}>
                  {tech.prenom} {tech.nom}
                </option>
              ))}
            </select>
            {errors.technicienId && <p className="text-[10px] text-red-400">{errors.technicienId.message}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-white">Date prévue</label>
            <input
              type="date"
              {...register('datePrevue')}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground ${errors.datePrevue ? 'border-red-500' : ''}`}
            />
            {errors.datePrevue && <p className="text-[10px] text-red-400">{errors.datePrevue.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting || !isValid} className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
