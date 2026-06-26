'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, Layers, Cpu, Plus, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

export default function EquipementsPage() {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  const {
    data: ateliers,
    mutate: mutateAteliers,
    isLoading: loadingA,
  } = useSWR('/equipements/ateliers', fetcher);
  const {
    data: lignes,
    mutate: mutateLignes,
    isLoading: loadingL,
  } = useSWR('/equipements/lignes', fetcher);
  const {
    data: postes,
    mutate: mutatePostes,
    isLoading: loadingP,
  } = useSWR('/equipements/postes', fetcher);

  const [activeTab, setActiveTab] = useState<'ATELIERS' | 'LIGNES' | 'POSTES'>('ATELIERS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ATELIER' | 'LIGNE' | 'POSTE'>('ATELIER');

  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    atelierId: '',
    ligneId: '',
  });

  const handleOpenModal = (type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    setModalType(type);
    setFormData({ nom: '', description: '', atelierId: '', ligneId: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'ATELIER') {
        await api.post('/equipements/ateliers', {
          nom: formData.nom,
          description: formData.description,
        });
        mutateAteliers();
      } else if (modalType === 'LIGNE') {
        await api.post('/equipements/lignes', {
          nom: formData.nom,
          description: formData.description,
          atelierId: Number(formData.atelierId),
        });
        mutateLignes();
      } else if (modalType === 'POSTE') {
        await api.post('/equipements/postes', {
          nom: formData.nom,
          description: formData.description,
          ligneId: Number(formData.ligneId),
        });
        mutatePostes();
      }
      toast.success(`${modalType.charAt(0) + modalType.slice(1).toLowerCase()} créé avec succès`);
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const isLoading = loadingA || loadingL || loadingP;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Chargement des équipements...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-[#651FAA]/10 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Factory className="w-8 h-8 text-purple-400" />
              Référentiel Équipements
            </h2>
            <p className="text-muted-foreground mt-2">
              Gestion des ateliers, lignes de production et postes de travail.
            </p>
          </div>
          {isAdminOrChef && (
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={() => handleOpenModal('ATELIER')}
                className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30"
              >
                <Plus className="w-4 h-4 mr-2" /> Atelier
              </Button>
              <Button
                onClick={() => handleOpenModal('LIGNE')}
                className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
              >
                <Plus className="w-4 h-4 mr-2" /> Ligne
              </Button>
              <Button
                onClick={() => handleOpenModal('POSTE')}
                className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
              >
                <Plus className="w-4 h-4 mr-2" /> Poste
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b border-white/[0.06] pb-px">
        <button
          onClick={() => setActiveTab('ATELIERS')}
          className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${activeTab === 'ATELIERS' ? 'border-purple-400 text-purple-400' : 'border-transparent text-muted-foreground hover:text-white'}`}
        >
          <Factory className="w-4 h-4 inline-block mr-2" /> Ateliers
        </button>
        <button
          onClick={() => setActiveTab('LIGNES')}
          className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${activeTab === 'LIGNES' ? 'border-purple-400 text-purple-400' : 'border-transparent text-muted-foreground hover:text-white'}`}
        >
          <Layers className="w-4 h-4 inline-block mr-2" /> Lignes
        </button>
        <button
          onClick={() => setActiveTab('POSTES')}
          className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${activeTab === 'POSTES' ? 'border-purple-400 text-purple-400' : 'border-transparent text-muted-foreground hover:text-white'}`}
        >
          <Cpu className="w-4 h-4 inline-block mr-2" /> Postes
        </button>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === 'ATELIERS' &&
          ateliers?.map((item: any) => (
            <Card
              key={item.id}
              className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-purple-500/30 transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                    <Factory className="w-6 h-6" />
                  </div>
                  {isAdminOrChef && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-muted-foreground hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{item.nom}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description || 'Aucune description'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="bg-white/5 px-2.5 py-1 rounded-md">
                    {item._count?.lignes || 0} Ligne(s)
                  </span>
                  {item.actif ? (
                    <span className="text-emerald-400">Actif</span>
                  ) : (
                    <span className="text-rose-400">Inactif</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === 'LIGNES' &&
          lignes?.map((item: any) => (
            <Card
              key={item.id}
              className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-blue-500/30 transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                    <Layers className="w-6 h-6" />
                  </div>
                  {isAdminOrChef && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-muted-foreground hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{item.nom}</h3>
                <p className="text-xs text-blue-300/70 font-semibold mb-2 uppercase tracking-wider">
                  {item.atelier?.nom}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description || 'Aucune description'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="bg-white/5 px-2.5 py-1 rounded-md">
                    {item._count?.postes || 0} Poste(s)
                  </span>
                  {item.actif ? (
                    <span className="text-emerald-400">Actif</span>
                  ) : (
                    <span className="text-rose-400">Inactif</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

        {activeTab === 'POSTES' &&
          postes?.map((item: any) => (
            <Card
              key={item.id}
              className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-emerald-500/30 transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Cpu className="w-6 h-6" />
                  </div>
                  {isAdminOrChef && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="text-muted-foreground hover:text-white">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{item.nom}</h3>
                <p className="text-xs text-emerald-300/70 font-semibold mb-2 uppercase tracking-wider">
                  {item.ligne?.atelier?.nom} &rsaquo; {item.ligne?.nom}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {item.description || 'Aucune description'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  {item.actif ? (
                    <span className="text-emerald-400">Actif</span>
                  ) : (
                    <span className="text-rose-400">Inactif</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Ajouter un(e) ${modalType.charAt(0) + modalType.slice(1).toLowerCase()}`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-[#651FAA] hover:bg-purple-600 text-white">
              Créer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
