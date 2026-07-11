'use client';

import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface EquipementFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  modalType: 'ATELIER' | 'LIGNE' | 'POSTE';
  formData: any;
  setFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  techniciens?: any[];
  isEditing?: boolean;
}

export function EquipementFormModal({
  isOpen,
  onClose,
  onSubmit,
  modalType,
  formData,
  setFormData,
  ateliers,
  lignes,
  techniciens,
  isEditing,
}: EquipementFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${isEditing ? 'Modifier' : 'Ajouter'} un(e) ${modalType.charAt(0) + modalType.slice(1).toLowerCase()}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Nom de l&apos;équipement</label>
          <input
            type="text"
            required
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Ex: Convoyeur A"
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Description (optionnelle)</label>
          <textarea
            rows={3}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
            placeholder="Description de l'équipement..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {modalType === 'LIGNE' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Atelier Parent</label>
              <select
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.atelierId}
                onChange={(e) => setFormData({ ...formData, atelierId: e.target.value })}
              >
                <option value="">Sélectionner un atelier</option>
                {ateliers?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Techniciens Assignés</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {techniciens?.map((t: any) => {
                  const isSelected =
                    formData.technicienIds?.includes(t.id.toString()) ||
                    formData.technicienIds?.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        const current = formData.technicienIds || [];
                        const strId = t.id.toString();
                        const newIds = isSelected
                          ? current.filter((id: any) => id.toString() !== strId)
                          : [...current, strId];
                        setFormData({ ...formData, technicienIds: newIds });
                      }}
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

        {modalType === 'POSTE' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Ligne Parente</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={formData.ligneId}
              onChange={(e) => setFormData({ ...formData, ligneId: e.target.value })}
            >
              <option value="">Sélectionner une ligne</option>
              {lignes?.map((l: any) => (
                <option key={l.id} value={l.id}>
                  {l.atelier?.nom} &rsaquo; {l.nom}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" className="bg-[#651FAA] hover:bg-purple-600 text-white">
            {isEditing ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
