import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Edit2, Trash2, Check, X, Plus } from 'lucide-react';

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
  const [pannes, setPannes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPanneNom, setNewPanneNom] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNom, setEditingNom] = useState('');

  const fetchPannes = async () => {
    if (!equipementId || !equipementType) return;
    setIsLoading(true);
    try {
      const paramKey = equipementType === 'LIGNE' ? 'ligneId' : 'posteId';
      const res: any = await api.get(`/pannes?${paramKey}=${equipementId}`);
      setPannes(res.data || []);
    } catch (err: any) {
      toast.error('Erreur lors du chargement des pannes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPannes();
      setNewPanneNom('');
      setEditingId(null);
    }
  }, [isOpen, equipementId, equipementType]);

  const handleAddPanne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPanneNom.trim()) return;

    try {
      const body: any = { nom: newPanneNom };
      if (equipementType === 'LIGNE') body.ligneId = equipementId;
      if (equipementType === 'POSTE') body.posteId = equipementId;

      await api.post('/pannes', body);
      toast.success('Panne ajoutée avec succès');
      setNewPanneNom('');
      fetchPannes();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'ajout de la panne");
    }
  };

  const handleUpdatePanne = async (id: number) => {
    if (!editingNom.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await api.put(`/pannes/${id}`, { nom: editingNom });
      toast.success('Panne modifiée avec succès');
      setEditingId(null);
      fetchPannes();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification de la panne');
    }
  };

  const handleDeletePanne = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette panne ?')) return;

    try {
      await api.delete(`/pannes/${id}`);
      toast.success('Panne supprimée avec succès');
      fetchPannes();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression de la panne');
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
              {pannes.map((panne) => (
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
                      <span className="text-white text-sm">{panne.nom}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingId(panne.id);
                            setEditingNom(panne.nom);
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
