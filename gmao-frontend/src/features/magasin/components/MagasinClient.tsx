'use client';

import { useState } from 'react';
import { useMagasin } from '@/features/magasin/hooks/useMagasin';
import { useAuth } from '@/context/AuthContext';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  pieceSchema,
  mouvementSchema,
  type PieceFormData,
  type MouvementFormData,
} from '@/lib/validations/magasin';

import { toast } from 'sonner';

import { PiecesTable } from './PiecesTable';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Piece } from '@/types/magasin.types';
import { getErrorMessage } from '@/lib/error';

interface MagasinClientProps {
  initialData: any;
}

export function MagasinClient({ initialData }: MagasinClientProps) {
  const { user } = useAuth();

  const isMagasinierOrAdmin =
    user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE' || user?.role === 'MAGASINIER';

  const { pieces, createPiece, updatePiece, deletePiece, createMouvement } = useMagasin(
    initialData.pieces,
  );

  const [isPieceModalOpen, setIsPieceModalOpen] = useState(false);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [isUpdatingPiece, setIsUpdatingPiece] = useState(false);

  const {
    register: registerPiece,
    handleSubmit: handlePieceSubmit,
    reset: resetPiece,
    formState: { errors: pieceErrors, isValid: isPieceValid },
  } = useForm<PieceFormData>({
    resolver: zodResolver(pieceSchema),
    mode: 'onChange',
  });

  const [isMouvementModalOpen, setIsMouvementModalOpen] = useState(false);
  const [isUpdatingMvt, setIsUpdatingMvt] = useState(false);

  const {
    register: registerMvt,
    handleSubmit: handleMvtSubmit,
    reset: resetMvt,
    control: controlMvt,
    formState: { errors: mvtErrors, isValid: isMvtValid },
  } = useForm<MouvementFormData>({
    resolver: zodResolver(mouvementSchema),
    mode: 'onChange',
  });

  const currentMvtType = useWatch({ control: controlMvt, name: 'type' });

  if (!user) return null;

  // Actions Pieces
  const handleEditPiece = (p: Piece) => {
    setSelectedPieceId(p.id);
    resetPiece({
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
    setSelectedPieceId(null);
    resetPiece({ code: '', nom: '', description: '', seuilAlerte: 10, prixUnitaire: 0 });
    setIsPieceModalOpen(true);
  };
  const handleDeletePiece = async (id: number) => {
    if (!isMagasinierOrAdmin) return toast.error('Non autorisé');
    if (!confirm('Voulez-vous vraiment supprimer cette pièce ?')) return;
    try {
      await deletePiece(id);
      toast.success('Pièce supprimée');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur');
    }
  };
  const submitPiece = async (data: PieceFormData) => {
    setIsUpdatingPiece(true);
    try {
      if (selectedPieceId) {
        await updatePiece(selectedPieceId, data);
        toast.success('Pièce modifiée');
      } else {
        await createPiece(data);
        toast.success('Pièce créée');
      }
      setIsPieceModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur');
    } finally {
      setIsUpdatingPiece(false);
    }
  };

  // Actions Mouvement
  const handleMouvement = (piece: Piece, type: 'ENTREE' | 'SORTIE') => {
    resetMvt({ pieceId: piece.id, type, quantite: 1, referenceOT: '' });
    setIsMouvementModalOpen(true);
  };
  const submitMouvement = async (data: MouvementFormData) => {
    setIsUpdatingMvt(true);
    try {
      await createMouvement({
        pieceId: data.pieceId,
        type: data.type,
        quantite: data.quantite,
        referenceOT: data.referenceOT || undefined,
      });
      toast.success('Mouvement enregistré');
      setIsMouvementModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur');
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
        title={selectedPieceId ? 'Modifier Pièce' : 'Ajouter Pièce'}
      >
        <form onSubmit={handlePieceSubmit(submitPiece)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Code</label>
              <Input
                {...registerPiece('code')}
                placeholder="PDR-001"
                className={pieceErrors.code ? 'border-red-500' : ''}
              />
              {pieceErrors.code && (
                <p className="text-[10px] text-red-400">{pieceErrors.code.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nom</label>
              <Input
                {...registerPiece('nom')}
                placeholder="Roulement A"
                className={pieceErrors.nom ? 'border-red-500' : ''}
              />
              {pieceErrors.nom && (
                <p className="text-[10px] text-red-400">{pieceErrors.nom.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description</label>
            <Input
              {...registerPiece('description')}
              placeholder="..."
              className={pieceErrors.description ? 'border-red-500' : ''}
            />
            {pieceErrors.description && (
              <p className="text-[10px] text-red-400">{pieceErrors.description.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Seuil Alerte</label>
              <Input
                type="number"
                min="0"
                {...registerPiece('seuilAlerte', { valueAsNumber: true })}
                className={pieceErrors.seuilAlerte ? 'border-red-500' : ''}
              />
              {pieceErrors.seuilAlerte && (
                <p className="text-[10px] text-red-400">{pieceErrors.seuilAlerte.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Prix Unitaire</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                {...registerPiece('prixUnitaire', { valueAsNumber: true })}
                className={pieceErrors.prixUnitaire ? 'border-red-500' : ''}
              />
              {pieceErrors.prixUnitaire && (
                <p className="text-[10px] text-red-400">{pieceErrors.prixUnitaire.message}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsPieceModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingPiece || !isPieceValid}>
              {isUpdatingPiece ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isMouvementModalOpen}
        onClose={() => setIsMouvementModalOpen(false)}
        title={currentMvtType === 'ENTREE' ? 'Entrée en Stock' : 'Sortie de Stock'}
      >
        <form onSubmit={handleMvtSubmit(submitMouvement)} className="space-y-4">
          <input type="hidden" {...registerMvt('pieceId', { valueAsNumber: true })} />
          <input type="hidden" {...registerMvt('type')} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Quantité</label>
            <Input
              type="number"
              min="1"
              {...registerMvt('quantite', { valueAsNumber: true })}
              className={mvtErrors.quantite ? 'border-red-500' : ''}
            />
            {mvtErrors.quantite && (
              <p className="text-[10px] text-red-400">{mvtErrors.quantite.message}</p>
            )}
          </div>
          {currentMvtType === 'SORTIE' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Référence OT (Optionnel)</label>
              <Input
                {...registerMvt('referenceOT')}
                placeholder="OT-XXXXXX"
                className={mvtErrors.referenceOT ? 'border-red-500' : ''}
              />
              {mvtErrors.referenceOT && (
                <p className="text-[10px] text-red-400">{mvtErrors.referenceOT.message}</p>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsMouvementModalOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isUpdatingMvt || !isMvtValid}
              className={
                currentMvtType === 'ENTREE'
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
