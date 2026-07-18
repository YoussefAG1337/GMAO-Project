import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { usePannes } from '@/features/equipements/hooks/usePannes';
import { toast } from 'sonner';
import { Check, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { Panne } from '@/types/panne.types';
import { getErrorMessage } from '@/lib/error';


interface PannesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipementId: number | null;
  equipementType: 'LIGNE' | 'POSTE' | null;
  equipementNom: string;
}

export function PannesListModal({
  isOpen,
  onClose,
  equipementId,
  equipementType,
  equipementNom,
}: PannesListModalProps) {
  const ligneId = equipementType === 'LIGNE' ? equipementId : null;
  const posteId = equipementType === 'POSTE' ? equipementId : null;

  const { pannes, isLoading, createPanne, updatePanne, deletePanne } = usePannes(
    isOpen ? ligneId : null,
    isOpen ? posteId : null
  );

  const [newPanneNom, setNewPanneNom] = useState('');
  const [newPanneType, setNewPanneType] = useState<'TECHNIQUE' | 'QUALITE'>('TECHNIQUE');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNom, setEditingNom] = useState('');
  const [editingType, setEditingType] = useState<'TECHNIQUE' | 'QUALITE'>('TECHNIQUE');

  useEffect(() => {
    if (isOpen) {
      setNewPanneNom('');
      setNewPanneType('TECHNIQUE');
      setEditingId(null);
    }
  }, [isOpen]);

  const handleAddPanne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPanneNom.trim()) return;

    try {
      const body: any = { nom: newPanneNom, type: newPanneType };
      if (equipementType === 'LIGNE') body.ligneId = equipementId;
      if (equipementType === 'POSTE') body.posteId = equipementId;

      await createPanne(body);
      toast.success('Panne ajoutée avec succès');
      setNewPanneNom('');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erreur lors de l'ajout de la panne");
    }
  };

  const handleUpdatePanne = async (id: number) => {
    if (!editingNom.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updatePanne(id, { nom: editingNom, type: editingType });
      toast.success('Panne modifiée avec succès');
      setEditingId(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la modification de la panne');
    }
  };

  const handleDeletePanne = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette panne ?')) return;

    try {
      await deletePanne(id);
      toast.success('Panne supprimée avec succès');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression de la panne');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gestion des Pannes : ${equipementNom}`}>
      <div className="space-y-6">
        {/* Formulaire d'ajout rapide */}
        <form onSubmit={handleAddPanne} className="flex gap-2">
          <input
            type="text"
            placeholder="Nom de la nouvelle panne..."
            value={newPanneNom}
            onChange={(e) => setNewPanneNom(e.target.value)}
            className="flex-1 bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
            required
          />
          <select
            value={newPanneType}
            onChange={(e) => setNewPanneType(e.target.value as 'TECHNIQUE' | 'QUALITE')}
            className="bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white text-sm"
          >
            <option value="TECHNIQUE">Technique</option>
            <option value="QUALITE">Qualité</option>
          </select>
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        </form>

        <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-950/50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Chargement...</div>
          ) : pannes.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Aucune panne enregistrée pour cet équipement.
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {pannes.map((panne: Panne) => (
                <li
                  key={panne.id}
                  className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors"
                >
                  {editingId === panne.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-4">
                      <input
                        type="text"
                        className="flex-1 bg-zinc-900 border border-amber-500/50 focus:border-amber-500 rounded px-2 py-1 text-white text-sm"
                        value={editingNom}
                        onChange={(e) => setEditingNom(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdatePanne(panne.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                      <select
                        value={editingType}
                        onChange={(e) => setEditingType(e.target.value as 'TECHNIQUE' | 'QUALITE')}
                        className="bg-zinc-900 border border-amber-500/30 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="TECHNIQUE">Technique</option>
                        <option value="QUALITE">Qualité</option>
                      </select>
                      <button
                        onClick={() => handleUpdatePanne(panne.id)}
                        className="text-emerald-400 hover:text-emerald-300 p-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{panne.nom}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            panne.type === 'QUALITE'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {panne.type === 'QUALITE' ? 'Qualité' : 'Technique'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(panne.id);
                            setEditingNom(panne.nom);
                            setEditingType(panne.type || 'TECHNIQUE');
                          }}
                          className="text-muted-foreground hover:text-white p-1"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePanne(panne.id)}
                          className="text-muted-foreground hover:text-rose-400 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
