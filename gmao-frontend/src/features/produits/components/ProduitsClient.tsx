'use client';

import { useState, useEffect } from 'react';
import { useProduits } from '@/features/produits/hooks/useProduits';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  familleSchema,
  produitSchema,
  type FamilleFormData,
  type ProduitFormData,
} from '@/lib/validations/produit';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Package, Layers } from 'lucide-react';
import { toast } from 'sonner';

import { FamillesTable } from './FamillesTable';
import { ProduitsTable } from './ProduitsTable';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { FamilleProduit, Produit } from '@/types/produit.types';
import { getErrorMessage } from '@/lib/error';

interface ProduitsClientProps {
  initialData: { familles: FamilleProduit[]; produits: Produit[] };
}

export function ProduitsClient({ initialData }: ProduitsClientProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'familles' | 'produits'>('familles');

  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  const {
    familles,
    produits,
    createFamille,
    updateFamille,
    deleteFamille,
    createProduit,
    updateProduit,
    deleteProduit,
  } = useProduits(initialData);

  const [isFamilleModalOpen, setIsFamilleModalOpen] = useState(false);
  const [selectedFamilleId, setSelectedFamilleId] = useState<number | null>(null);
  const [isUpdatingFamille, setIsUpdatingFamille] = useState(false);

  const {
    register: registerFamille,
    handleSubmit: handleFamilleSubmit,
    reset: resetFamille,
    formState: { errors: familleErrors, isValid: isFamilleValid },
  } = useForm<FamilleFormData>({
    resolver: zodResolver(familleSchema),
    mode: 'onChange',
  });

  // --- Produits ---
  const [isProduitModalOpen, setIsProduitModalOpen] = useState(false);
  const [selectedProduitId, setSelectedProduitId] = useState<number | null>(null);
  const [isUpdatingProduit, setIsUpdatingProduit] = useState(false);

  const {
    register: registerProduit,
    handleSubmit: handleProduitSubmit,
    reset: resetProduit,
    formState: { errors: produitErrors, isValid: isProduitValid },
  } = useForm<ProduitFormData>({
    resolver: zodResolver(produitSchema),
    mode: 'onChange',
  });

  if (!isAdminOrChef) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <ShieldAlert className="w-16 h-16 text-rose-500/80" />
        <h2 className="text-xl font-semibold text-white">Accès Restreint</h2>
        <p className="text-muted-foreground">
          Vous n&apos;avez pas les droits pour accéder à cette page.
        </p>
      </div>
    );
  }

  // Actions Familles
  const handleEditFamille = (f: FamilleProduit) => {
    setSelectedFamilleId(f.id);
    resetFamille({ nom: f.nom });
    setIsFamilleModalOpen(true);
  };
  const handleAddFamille = () => {
    setSelectedFamilleId(null);
    resetFamille({ nom: '' });
    setIsFamilleModalOpen(true);
  };
  const handleDeleteFamille = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette famille ?')) return;
    try {
      await deleteFamille(id);
      toast.success('Famille supprimée');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };
  const submitFamille = async (data: FamilleFormData) => {
    setIsUpdatingFamille(true);
    try {
      if (selectedFamilleId) {
        await updateFamille(selectedFamilleId, data);
        toast.success('Famille modifiée');
      } else {
        await createFamille(data);
        toast.success('Famille créée');
      }
      setIsFamilleModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur');
    } finally {
      setIsUpdatingFamille(false);
    }
  };

  // Actions Produits
  const handleEditProduit = (p: Produit) => {
    setSelectedProduitId(p.id);
    resetProduit({ nom: p.nom, familleProduitId: p.familleProduitId });
    setIsProduitModalOpen(true);
  };
  const handleAddProduit = () => {
    setSelectedProduitId(null);
    resetProduit({ nom: '', familleProduitId: familles[0]?.id || 0 });
    setIsProduitModalOpen(true);
  };
  const handleDeleteProduit = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await deleteProduit(id);
      toast.success('Produit supprimé');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };
  const submitProduit = async (data: ProduitFormData) => {
    setIsUpdatingProduit(true);
    try {
      if (selectedProduitId) {
        await updateProduit(selectedProduitId, data);
        toast.success('Produit modifié');
      } else {
        await createProduit(data);
        toast.success('Produit créé');
      }
      setIsProduitModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur');
    } finally {
      setIsUpdatingProduit(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-1 bg-zinc-900/50 p-1 rounded-lg w-fit border border-white/5">
        <button
          onClick={() => setActiveTab('familles')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'familles'
              ? 'bg-zinc-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" /> Familles
        </button>
        <button
          onClick={() => setActiveTab('produits')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'produits'
              ? 'bg-zinc-800 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Package className="w-4 h-4" /> Produits
        </button>
      </div>

      {activeTab === 'familles' && (
        <FamillesTable
          familles={familles}
          onAdd={handleAddFamille}
          onEdit={handleEditFamille}
          onDelete={handleDeleteFamille}
        />
      )}

      {activeTab === 'produits' && (
        <ProduitsTable
          produits={produits}
          onAdd={handleAddProduit}
          onEdit={handleEditProduit}
          onDelete={handleDeleteProduit}
        />
      )}

      {/* Modal Famille */}
      <Modal
        isOpen={isFamilleModalOpen}
        onClose={() => setIsFamilleModalOpen(false)}
        title={selectedFamilleId ? 'Modifier Famille' : 'Ajouter Famille'}
      >
        <form onSubmit={handleFamilleSubmit(submitFamille)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nom de la famille</label>
            <Input
              {...registerFamille('nom')}
              placeholder="Ex: Câblages"
              className={familleErrors.nom ? 'border-red-500' : ''}
            />
            {familleErrors.nom && (
              <p className="text-[10px] text-red-400">{familleErrors.nom.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsFamilleModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingFamille || !isFamilleValid}>
              {isUpdatingFamille ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Produit */}
      <Modal
        isOpen={isProduitModalOpen}
        onClose={() => setIsProduitModalOpen(false)}
        title={selectedProduitId ? 'Modifier Produit' : 'Ajouter Produit'}
      >
        <form onSubmit={handleProduitSubmit(submitProduit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nom du produit</label>
            <Input
              {...registerProduit('nom')}
              placeholder="Ex: Faisceau A320"
              className={produitErrors.nom ? 'border-red-500' : ''}
            />
            {produitErrors.nom && (
              <p className="text-[10px] text-red-400">{produitErrors.nom.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Famille</label>
            <select
              {...registerProduit('familleProduitId', { valueAsNumber: true })}
              className={`w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white ${produitErrors.familleProduitId ? 'border-red-500' : ''}`}
            >
              <option value={0} disabled>
                Sélectionner une famille
              </option>
              {familles?.map((f: FamilleProduit) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
            {produitErrors.familleProduitId && (
              <p className="text-[10px] text-red-400">{produitErrors.familleProduitId.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsProduitModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingProduit || !isProduitValid}>
              {isUpdatingProduit ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
