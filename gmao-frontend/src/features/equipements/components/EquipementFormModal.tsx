'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Atelier, Ligne } from '@/types/equipement.types';
import { User } from '@/types';
import {
  atelierSchema,
  ligneSchema,
  posteSchema,
  AtelierFormData,
  LigneFormData,
  PosteFormData,
} from '@/lib/validations/equipement';

// Each modal type uses a different schema — we union the form data here
type EquipementFormData = AtelierFormData | LigneFormData | PosteFormData;

interface EquipementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EquipementFormData) => Promise<void>;
  modalType: 'ATELIER' | 'LIGNE' | 'POSTE';
  initialData?: Record<string, any>;
  ateliers: Atelier[];
  lignes: Ligne[];
  techniciens?: User[];
  isEditing?: boolean;
}

// Pick the right Zod schema based on modal type
function getSchema(modalType: 'ATELIER' | 'LIGNE' | 'POSTE') {
  if (modalType === 'LIGNE') return ligneSchema;
  if (modalType === 'POSTE') return posteSchema;
  return atelierSchema;
}

export function EquipementFormModal({
  isOpen,
  onClose,
  onSubmit,
  modalType,
  initialData,
  ateliers,
  lignes,
  techniciens,
  isEditing,
}: EquipementFormModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<any>({
    resolver: zodResolver(getSchema(modalType)),
    mode: 'onChange',
  });

  // Reset the form whenever the modal opens with new data
  useEffect(() => {
    if (isOpen) {
      reset({
        nom: initialData?.nom || '',
        description: initialData?.description || '',
        atelierId: initialData?.atelierId ? Number(initialData.atelierId) : undefined,
        ligneId: initialData?.ligneId ? Number(initialData.ligneId) : undefined,
        technicienIds: initialData?.technicienIds?.map(Number) || [],
      });
    }
  }, [isOpen, initialData, reset]);

  const watchedTechnicienIds: number[] = useWatch({ control, name: 'technicienIds' }) || [];

  // Toggle a technicien in/out of the selected list
  const handleTechnicienToggle = (techId: number) => {
    const current = watchedTechnicienIds;
    const updated = current.includes(techId)
      ? current.filter((id) => id !== techId)
      : [...current, techId];
    setValue('technicienIds', updated, { shouldValidate: true });
  };

  const typeLabel = modalType.charAt(0) + modalType.slice(1).toLowerCase();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Modifier' : 'Ajouter'} un(e) ${typeLabel}`}
    >
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        {/* Nom */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Nom de l&apos;équipement</label>
          <input
            type="text"
            {...register('nom')}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground ${errors.nom ? 'border-red-500' : ''}`}
            placeholder="Ex: Convoyeur A"
          />
          {errors.nom && <p className="text-[10px] text-red-400">{errors.nom.message as string}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description (optionnelle)</label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Description de l'équipement..."
          />
        </div>

        {/* LIGNE-specific fields: atelier parent + techniciens */}
        {modalType === 'LIGNE' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Atelier Parent</label>
              <select
                {...register('atelierId', { valueAsNumber: true })}
                className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${(errors as any).atelierId ? 'border-red-500' : ''}`}
              >
                <option value={0} disabled>
                  Sélectionner un atelier
                </option>
                {ateliers?.map((a: Atelier) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
              {(errors as any).atelierId && (
                <p className="text-[10px] text-red-400">{(errors as any).atelierId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Techniciens Assignés</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {techniciens?.map((t: User) => {
                  const isSelected = watchedTechnicienIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTechnicienToggle(t.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-sm text-left ${
                        isSelected
                          ? 'bg-[#651FAA]/20 border-[#651FAA] text-purple-200'
                          : 'bg-zinc-900 border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#651FAA] border-[#651FAA]'
                            : 'border-white/20 bg-black/20'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="truncate">
                        {t.nom} {t.prenom}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* POSTE-specific fields: ligne parent */}
        {modalType === 'POSTE' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ligne Parente</label>
            <select
              {...register('ligneId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${(errors as any).ligneId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>
                Sélectionner une ligne
              </option>
              {lignes?.map((l: Ligne) => (
                <option key={l.id} value={l.id}>
                  {l.atelier?.nom} &rsaquo; {l.nom}
                </option>
              ))}
            </select>
            {(errors as any).ligneId && (
              <p className="text-[10px] text-red-400">{(errors as any).ligneId.message}</p>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="bg-[#651FAA] hover:bg-purple-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : isEditing ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
