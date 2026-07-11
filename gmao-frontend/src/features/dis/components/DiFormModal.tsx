'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EquipmentSelect } from '@/components/EquipmentSelect';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface DiFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  formData: any;
  setFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  postes: any[];
  familles: any[];
  produits: any[];
  isSubmitting?: boolean;
}

export function DiFormModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  ateliers,
  lignes,
  postes,
  familles,
  produits,
  isSubmitting = false,
}: DiFormModalProps) {
  const [pannes, setPannes] = useState<any[]>([]);
  const [isNouvellePanne, setIsNouvellePanne] = useState(false);

  useEffect(() => {
    if (formData.ligneId || formData.posteId) {
      const params = new URLSearchParams();
      if (formData.ligneId) params.append('ligneId', formData.ligneId);
      if (formData.posteId) params.append('posteId', formData.posteId);

      api
        .get(`/pannes?${params.toString()}`)
        .then((res: any) => {
          setPannes(res.data || []);
        })
        .catch(console.error);
    } else {
      setPannes([]);
    }
  }, [formData.ligneId, formData.posteId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Signaler une intervention">
      <form onSubmit={onSubmit} className="space-y-4">
        <EquipmentSelect
          formData={formData}
          setFormData={setFormData}
          ateliers={ateliers}
          lignes={lignes}
          postes={postes}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Famille de Produit</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.familleId}
              onChange={(e) =>
                setFormData({ ...formData, familleId: e.target.value, produitId: '' })
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
              value={formData.produitId}
              onChange={(e) => setFormData({ ...formData, produitId: e.target.value })}
            >
              <option value="">Sélectionner</option>
              {produits
                ?.filter(
                  (p: any) =>
                    !formData.familleId || p.familleProduitId === Number(formData.familleId),
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
              value={formData.panneId || ''}
              onChange={(e) => {
                if (e.target.value === 'NOUVELLE') {
                  setIsNouvellePanne(true);
                  setFormData({ ...formData, panneId: '', nouvellePanneNom: '' });
                } else {
                  setFormData({ ...formData, panneId: e.target.value, nouvellePanneNom: '' });
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
                value={formData.nouvellePanneNom || ''}
                onChange={(e) => setFormData({ ...formData, nouvellePanneNom: e.target.value })}
                required
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsNouvellePanne(false);
                  setFormData({ ...formData, nouvellePanneNom: '' });
                }}
              >
                Annuler
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Document Utile / Image (Optionnel)
          </label>
          <input
            type="file"
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setFormData({ ...formData, document: file });
            }}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Priorité</label>
          <select
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            value={formData.priorite}
            onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
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
            {isSubmitting ? 'Création en cours...' : 'Soumettre la DI'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
