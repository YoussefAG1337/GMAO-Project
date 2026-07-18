'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useReferenceData } from '@/hooks/useReferenceData';

import { utilisateurEditSchema, type UtilisateurEditFormData } from '@/lib/validations/utilisateur';

interface UtilisateurEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UtilisateurEditFormData) => Promise<void>;
  initialData: { role: string; actif: boolean; lignes?: number[] };
}

export function UtilisateurEditModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UtilisateurEditModalProps) {
  const { lignes } = useReferenceData();

  const {
    register,
    handleSubmit: handleRHFSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<UtilisateurEditFormData>({
    resolver: zodResolver(utilisateurEditSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        role: initialData.role as UtilisateurEditFormData['role'],
        actif: initialData.actif,
        lignes: initialData.lignes || [],
      });
    }
  }, [isOpen, initialData, reset]);

  const watchedRole = useWatch({ control, name: 'role' });
  const watchedLignes = useWatch({ control, name: 'lignes' }) || [];
  const showLignesSelection = watchedRole === 'TECHNICIEN' || watchedRole === 'CHEF_TECHNICIEN';

  const handleLigneToggle = (ligneId: number) => {
    const current = watchedLignes;
    const updated = current.includes(ligneId)
      ? current.filter((id) => id !== ligneId)
      : [...current, ligneId];
    setValue('lignes', updated, { shouldValidate: true });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier l'utilisateur">
      <form onSubmit={handleRHFSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Rôle</label>
          <select
            {...register('role')}
            className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${errors.role ? 'border-red-500' : ''}`}
          >
            <option value="ADMIN">Administrateur</option>
            <option value="CHEF_MAINTENANCE">Chef de Maintenance</option>
            <option value="CHEF_TECHNICIEN">Chef Technicien</option>
            <option value="TECHNICIEN">Technicien</option>
            <option value="MAGASINIER">Magasinier</option>
          </select>
          {errors.role && <p className="text-[10px] text-red-400">{errors.role.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Statut du compte</label>
          <select
            {...register('actif', {
              setValueAs: (v) => v === 'true' || v === true,
            })}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
          >
            <option value="true">Actif (Autorisé à se connecter)</option>
            <option value="false">En attente / Désactivé</option>
          </select>
        </div>

        {showLignesSelection && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Lignes Assignées</label>
            <div className="max-h-40 overflow-y-auto bg-zinc-900 border border-white/10 rounded-lg p-2 space-y-2">
              {lignes.map((ligne: any) => (
                <label
                  key={ligne.id}
                  className="flex items-center space-x-2 text-white cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="rounded bg-zinc-800 border-white/20 text-purple-600 focus:ring-purple-600"
                    checked={watchedLignes.includes(ligne.id)}
                    onChange={() => handleLigneToggle(ligne.id)}
                  />
                  <span>{ligne.nom}</span>
                </label>
              ))}
              {lignes.length === 0 && (
                <span className="text-sm text-gray-400">Aucune ligne disponible</span>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
