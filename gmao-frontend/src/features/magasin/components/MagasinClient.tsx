'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { toast } from 'sonner';

import { PiecesTable } from './PiecesTable';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MagasinClientProps {
  initialData: { pieces: any[] };
}

export function MagasinClient({ initialData }: MagasinClientProps) {
  const { user } = useAuth();

  const isMagasinierOrAdmin =
    user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE' || user?.role === 'MAGASINIER';

  const { data: pieces, mutate } = useSWR('/magasin/pieces', {
    fallbackData: initialData.pieces,
  });

  const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);
  const [pieceForm, setPieceForm] = useState({
    id: 0,
    code: '',
    nom: '',
    description: '',
    seuilAlerte: 10,
    prixUnitaire: 0,
  });
  const [isUpdatingPiece, setIsUpdatingPiece] = useState(false);

  const [isMouvementModalOpen, setIsMouvementModalOpen] = useState(false);
  const [mvtForm, setMvtForm] = useState({
    pieceId: 0,
    type: 'ENTREE',
    quantite: 1,
    referenceOT: '',
  });
  const [isUpdatingMvt, setIsUpdatingMvt] = useState(false);

  if (!user) return null;

  // Actions Pieces
  const handleEditPiece = (p: any) => {
    setPieceForm({
      id: p.id,
      code: p.code,
      nom: p.nom,
      description: p.description || '',
      seuilAlerte: p.seuilAlerte,
      prixUnitaire: p.prixUnitaire || 0,
    });
    setIsPieceModalOpen(true);
  };
  const handleAddPiece = () => {
    if (!isMagasinierOrAdmin) return toast.error('Non autorisé');
    setPieceForm({ id: 0, code: '', nom: '', description: '', seuilAlerte: 10, prixUnitaire: 0 });
    setIsPieceModalOpen(true);
  };
  const handleDeletePiece = async (id: number) => {
    if (!isMagasinierOrAdmin) return toast.error('Non autorisé');
    if (!confirm('Voulez-vous vraiment supprimer cette pièce ?')) return;
    try {
      await api.delete(`/magasin/pieces/${id}`);
      toast.success('Pièce supprimée');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    }
  };
  const submitPiece = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingPiece(true);
    try {
      const payload: any = {
        ...pieceForm,
        seuilAlerte: Number(pieceForm.seuilAlerte),
        prixUnitaire: Number(pieceForm.prixUnitaire),
      };
      if (pieceForm.id) {
        await api.put(`/magasin/pieces/${pieceForm.id}`, payload);
        toast.success('Pièce modifiée');
      } else {
        delete payload.id; // Ne pas envoyer id=0 au backend pour éviter les erreurs Prisma
        await api.post('/magasin/pieces', payload);
        toast.success('Pièce créée');
      }
      setIsPieceModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setIsUpdatingPiece(false);
    }
  };

  // Actions Mouvement
  const handleMouvement = (piece: any, type: 'ENTREE' | 'SORTIE') => {
    setMvtForm({ pieceId: piece.id, type, quantite: 1, referenceOT: '' });
    setIsMouvementModalOpen(true);
  };
  const submitMouvement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingMvt(true);
    try {
      await api.post('/magasin/mouvements', {
        ...mvtForm,
        quantite: Number(mvtForm.quantite),
      });
      toast.success('Mouvement enregistré');
      setIsMouvementModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setIsUpdatingMvt(false);
    }
  };

  return (
    <div className="space-y-6">
      <PiecesTable
        pieces={pieces}
        onAdd={handleAddPiece}
        onEdit={handleEditPiece}
        onDelete={handleDeletePiece}
        onMouvement={handleMouvement}
        canManage={isMagasinierOrAdmin}
      />

      <Modal
        isOpen={isPieceModalOpen}
        onClose={() => setIsPieceModalOpen(false)}
        title={pieceForm.id ? 'Modifier Pièce' : 'Ajouter Pièce'}
      >
        <form onSubmit={submitPiece} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Code</label>
              <Input
                required
                value={pieceForm.code}
                onChange={(e) => setPieceForm({ ...pieceForm, code: e.target.value })}
                placeholder="PDR-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nom</label>
              <Input
                required
                value={pieceForm.nom}
                onChange={(e) => setPieceForm({ ...pieceForm, nom: e.target.value })}
                placeholder="Roulement A"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Input
              value={pieceForm.description}
              onChange={(e) => setPieceForm({ ...pieceForm, description: e.target.value })}
              placeholder="..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Seuil Alerte</label>
              <Input
                type="number"
                min="0"
                required
                value={pieceForm.seuilAlerte}
                onChange={(e) =>
                  setPieceForm({ ...pieceForm, seuilAlerte: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Prix Unitaire</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={pieceForm.prixUnitaire}
                onChange={(e) =>
                  setPieceForm({ ...pieceForm, prixUnitaire: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsPieceModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingPiece}>
              {isUpdatingPiece ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMouvementModalOpen}
        onClose={() => setIsMouvementModalOpen(false)}
        title={mvtForm.type === 'ENTREE' ? 'Entrée en Stock' : 'Sortie de Stock'}
      >
        <form onSubmit={submitMouvement} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quantité</label>
            <Input
              type="number"
              min="1"
              required
              value={mvtForm.quantite}
              onChange={(e) => setMvtForm({ ...mvtForm, quantite: Number(e.target.value) })}
            />
          </div>
          {mvtForm.type === 'SORTIE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Référence OT (Optionnel)</label>
              <Input
                value={mvtForm.referenceOT}
                onChange={(e) => setMvtForm({ ...mvtForm, referenceOT: e.target.value })}
                placeholder="OT-XXXXXX"
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsMouvementModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingMvt}
              className={
                mvtForm.type === 'ENTREE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }
            >
              {isUpdatingMvt ? '...' : 'Confirmer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
