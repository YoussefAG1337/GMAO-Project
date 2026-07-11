'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Package, Layers } from 'lucide-react';
import { toast } from 'sonner';

import { FamillesTable } from './FamillesTable';
import { ProduitsTable } from './ProduitsTable';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const fetcher = (url: string) =>
  api.get<any>(url).then((res) => (res.data !== undefined ? res.data : res));

interface ProduitsClientProps {
  initialData: { familles: any[]; produits: any[] };
}

export function ProduitsClient({ initialData }: ProduitsClientProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'familles' | 'produits'>('familles');

  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  // --- Familles ---
  const { data: familles, mutate: mutateFamilles } = useSWR('/produits/familles', fetcher, {
    fallbackData: initialData.familles,
  });

  const [isFamilleModalOpen, setIsFamilleModalOpen] = useState(false);
  const [familleForm, setFamilleForm] = useState({ id: 0, nom: '' });
  const [isUpdatingFamille, setIsUpdatingFamille] = useState(false);

  // --- Produits ---
  const { data: produits, mutate: mutateProduits } = useSWR('/produits', fetcher, {
    fallbackData: initialData.produits,
  });

  const [isProduitModalOpen, setIsProduitModalOpen] = useState(false);
  const [produitForm, setProduitForm] = useState({ id: 0, nom: '', familleProduitId: 0 });
  const [isUpdatingProduit, setIsUpdatingProduit] = useState(false);

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
  const handleEditFamille = (f: any) => {
    setFamilleForm({ id: f.id, nom: f.nom });
    setIsFamilleModalOpen(true);
  };
  const handleAddFamille = () => {
    setFamilleForm({ id: 0, nom: '' });
    setIsFamilleModalOpen(true);
  };
  const handleDeleteFamille = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette famille ?')) return;
    try {
      await api.delete(`/produits/familles/${id}`);
      toast.success('Famille supprimée');
      mutateFamilles();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };
  const submitFamille = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFamille(true);
    try {
      if (familleForm.id) {
        await api.put(`/produits/familles/${familleForm.id}`, { nom: familleForm.nom });
        toast.success('Famille modifiée');
      } else {
        await api.post('/produits/familles', { nom: familleForm.nom });
        toast.success('Famille créée');
      }
      setIsFamilleModalOpen(false);
      mutateFamilles();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setIsUpdatingFamille(false);
    }
  };

  // Actions Produits
  const handleEditProduit = (p: any) => {
    setProduitForm({ id: p.id, nom: p.nom, familleProduitId: p.familleProduitId });
    setIsProduitModalOpen(true);
  };
  const handleAddProduit = () => {
    setProduitForm({ id: 0, nom: '', familleProduitId: familles[0]?.id || 0 });
    setIsProduitModalOpen(true);
  };
  const handleDeleteProduit = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;
    try {
      await api.delete(`/produits/${id}`);
      toast.success('Produit supprimé');
      mutateProduits();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };
  const submitProduit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produitForm.familleProduitId) {
      toast.error('Sélectionnez une famille');
      return;
    }
    setIsUpdatingProduit(true);
    try {
      const payload: any = {
        nom: produitForm.nom,
        familleProduitId: Number(produitForm.familleProduitId),
      };
      if (produitForm.id) {
        await api.put(`/produits/${produitForm.id}`, payload);
        toast.success('Produit modifié');
      } else {
        await api.post('/produits', payload);
        toast.success('Produit créé');
      }
      setIsProduitModalOpen(false);
      mutateProduits();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
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
        title={familleForm.id ? 'Modifier Famille' : 'Ajouter Famille'}
      >
        <form onSubmit={submitFamille} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nom de la famille</label>
            <Input
              required
              value={familleForm.nom}
              onChange={(e) => setFamilleForm({ ...familleForm, nom: e.target.value })}
              placeholder="Ex: Câblages"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsFamilleModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingFamille}>
              {isUpdatingFamille ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Produit */}
      <Modal
        isOpen={isProduitModalOpen}
        onClose={() => setIsProduitModalOpen(false)}
        title={produitForm.id ? 'Modifier Produit' : 'Ajouter Produit'}
      >
        <form onSubmit={submitProduit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Nom du produit</label>
            <Input
              required
              value={produitForm.nom}
              onChange={(e) => setProduitForm({ ...produitForm, nom: e.target.value })}
              placeholder="Ex: Faisceau A320"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Famille</label>
            <select
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={produitForm.familleProduitId}
              onChange={(e) =>
                setProduitForm({ ...produitForm, familleProduitId: Number(e.target.value) })
              }
            >
              <option value={0} disabled>
                Sélectionner une famille
              </option>
              {familles?.map((f: any) => (
                <option key={f.id} value={f.id}>
                  {f.nom}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="ghost" onClick={() => setIsProduitModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isUpdatingProduit}>
              {isUpdatingProduit ? '...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
