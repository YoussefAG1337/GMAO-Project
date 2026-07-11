'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EquipmentSelect } from '@/components/EquipmentSelect';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DiEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editFormData: any;
  setEditFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  postes: any[];
  familles: any[];
  produits: any[];
  isSubmitting?: boolean;
}

export function DiEditModal({
  isOpen,
  onClose,
  onSubmit,
  editFormData,
  setEditFormData,
  ateliers,
  lignes,
  postes,
  familles,
  produits,
  isSubmitting = false,
}: DiEditModalProps) {
  const [pannes, setPannes] = useState<any[]>([]);
  const [isNouvellePanne, setIsNouvellePanne] = useState(false);

  useEffect(() => {
    if (editFormData.ligneId || editFormData.posteId) {
      const params = new URLSearchParams();
      if (editFormData.ligneId) params.append('ligneId', editFormData.ligneId);
      if (editFormData.posteId) params.append('posteId', editFormData.posteId);

      api
        .get(`/pannes?${params.toString()}`)
        .then((res: any) => {
          setPannes(res.data || []);
        })
        .catch(console.error);
    } else {
      setPannes([]);
    }
  }, [editFormData.ligneId, editFormData.posteId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Modifier la Demande d'Intervention">
      <form onSubmit={onSubmit} className="space-y-4">
        <EquipmentSelect
          formData={editFormData}
          setFormData={setEditFormData}
          ateliers={ateliers}
          lignes={lignes}
          postes={postes}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Famille de Produit</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editFormData.familleId || ''}
              onChange={(e) =>
                setEditFormData({ ...editFormData, familleId: e.target.value, produitId: '' })
              }
            >
              <option value="">Sélectionner</option>
              {familles?.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Produit Concerné</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editFormData.produitId || ''}
              onChange={(e) => setEditFormData({ ...editFormData, produitId: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {produits
                ?.filter(
                  (p: any) =>
                    !editFormData.familleId ||
                    p.familleProduitId === Number(editFormData.familleId),
                )
                .map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Type de Panne</label>
          {!isNouvellePanne ? (
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editFormData.panneId || ''}
              onChange={(e) => {
                if (e.target.value === 'NOUVELLE') {
                  setIsNouvellePanne(true);
                  setEditFormData({ ...editFormData, panneId: '', nouvellePanneNom: '' });
                } else {
                  setEditFormData({
                    ...editFormData,
                    panneId: e.target.value,
                    nouvellePanneNom: '',
                  });
                }
              }}
            >
              <option value="">Sélectionner ou ajouter</option>
              {pannes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom}
                </option>
              ))}
              <option value="NOUVELLE" className="text-amber-400 font-bold">
                + Ajouter une nouvelle panne
              </option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nom de la nouvelle panne"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={editFormData.nouvellePanneNom || ''}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, nouvellePanneNom: e.target.value })
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsNouvellePanne(false);
                  setEditFormData({ ...editFormData, nouvellePanneNom: '' });
                }}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Priorité</label>
          <select
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={editFormData.priorite || 'MOYENNE'}
            onChange={(e) => setEditFormData({ ...editFormData, priorite: e.target.value })}
          >
            <option value="BASSE">Basse</option>
            <option value="MOYENNE">Moyenne</option>
            <option value="HAUTE">Haute</option>
            <option value="CRITIQUE">Critique</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
          >
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
