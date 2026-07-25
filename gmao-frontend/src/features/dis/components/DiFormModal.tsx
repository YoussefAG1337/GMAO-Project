'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EquipmentSelect, numberOrUndefined } from '@/components/EquipmentSelect';
import { useEffect } from 'react';
import { usePannes } from '@/features/equipements/hooks/usePannes';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { FamilleProduit, Produit } from '@/types/produit.types';
import { Panne } from '@/types/panne.types';
import { createDiSchema, type CreateDiFormData } from '@/lib/validations/di';

interface DiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateDiFormData) => Promise<void>;
  ateliers: Atelier[];
  lignes: Ligne[];
  postes: Poste[];
  familles: FamilleProduit[];
  produits: Produit[];
  techniciens?: any[];
  isAdminOrChef?: boolean;
  isSubmitting?: boolean;
}

export function DiFormModal(props: DiFormModalProps) {
  if (!props.isOpen) return null;
  return <DiFormModalInner {...props} />;
}

function DiFormModalInner({
  isOpen,
  onClose,
  onSubmit,
  ateliers,
  lignes,
  postes,
  familles,
  produits,
  techniciens,
  isAdminOrChef,
  isSubmitting = false,
}: DiFormModalProps) {
  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateDiFormData>({
    resolver: zodResolver(createDiSchema),
    mode: 'onChange',
    defaultValues: {
      priorite: 'MOYENNE',
    },
  });

  const watchAtelierId = useWatch({ control, name: 'atelierId' });
  const watchLigneId = useWatch({ control, name: 'ligneId' });
  const watchPosteId = useWatch({ control, name: 'posteId' });
  const watchFamilleId = useWatch({ control, name: 'familleId' });
  const watchPanneId = useWatch({ control, name: 'panneId' });

  const { pannes } = usePannes(watchLigneId || null, watchPosteId || null);

  useEffect(() => {
    if (isOpen) {
      reset({ priorite: 'MOYENNE' });
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Signaler une intervention">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Famille de Produit (Optionnel)</label>
            <select
              {...register('familleId', { setValueAs: numberOrUndefined })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.familleId ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner</option>
              {familles?.map((f: FamilleProduit) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
            {errors.familleId && (
              <p className="text-[10px] text-red-400">{errors.familleId.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Produit Concerné (Optionnel)</label>
            <select
              {...register('produitId', { setValueAs: numberOrUndefined })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.produitId ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner</option>
              {produits
                ?.filter(
                  (p: Produit) =>
                    !watchFamilleId ||
                    p.familleProduitId === watchFamilleId ||
                    isNaN(watchFamilleId),
                )
                .map((p: Produit) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
            </select>
            {errors.produitId && (
              <p className="text-[10px] text-red-400">{errors.produitId.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Type de Panne</label>
          {watchPanneId !== 'NOUVELLE' ? (
            <select
              {...register('panneId', {
                setValueAs: (v) => (v === 'NOUVELLE' ? 'NOUVELLE' : v ? Number(v) : undefined),
              })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.panneId ? 'border-red-500' : ''}`}
            >
              <option value="">Sélectionner ou ajouter</option>
              {pannes.map((p: Panne) => (
                <option key={p.id} value={p.id}>
                  {p.nom} ({p.type === 'QUALITE' ? 'Qualité' : 'Technique'})
                </option>
              ))}
              <option value="NOUVELLE" className="text-amber-400 font-bold">
                + Ajouter une nouvelle panne
              </option>
            </select>
          ) : (
            <div className="flex flex-col gap-2 bg-zinc-900/30 p-3 rounded-lg border border-white/5">
              <div className="flex gap-2">
                <div className="w-full space-y-1">
                  <input
                    type="text"
                    placeholder="Nom de la nouvelle panne"
                    {...register('nouvellePanneNom')}
                    className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.nouvellePanneNom ? 'border-red-500' : ''}`}
                  />
                  {errors.nouvellePanneNom && (
                    <p className="text-[10px] text-red-400">{errors.nouvellePanneNom.message}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setValue('panneId', undefined);
                    setValue('nouvellePanneNom', undefined);
                    setValue('nouvellePanneType', undefined);
                  }}
                >
                  Annuler
                </Button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Type de la nouvelle panne
                </label>
                <select
                  {...register('nouvellePanneType')}
                  defaultValue="TECHNIQUE"
                  className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white text-xs"
                >
                  <option value="TECHNIQUE">Technique (ex: équipement en panne, surchauffe)</option>
                  <option value="QUALITE">Qualité (défaut de production)</option>
                </select>
              </div>
            </div>
          )}
          {errors.panneId && <p className="text-[10px] text-red-400">{errors.panneId.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Document Utile / Image (Optionnel)
          </label>
          <input
            type="file"
            {...register('document')}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
          />
        </div>

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

        {isAdminOrChef && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Assigner à (Optionnel)</label>
            <select
              {...register('technicienId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.technicienId ? 'border-red-500' : ''}`}
            >
              <option value={0}>Auto-assignation (par défaut)</option>
              {techniciens?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.prenom} {t.nom}
                </option>
              ))}
            </select>
            {errors.technicienId && (
              <p className="text-[10px] text-red-400">{errors.technicienId.message}</p>
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
            className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Création en cours...' : 'Soumettre la DI'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
