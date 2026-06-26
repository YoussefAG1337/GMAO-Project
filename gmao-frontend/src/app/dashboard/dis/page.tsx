'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { MessageSquareWarning, Plus, Filter, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

const statutColors: Record<string, string> = {
  NOUVELLE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  EN_COURS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  RESOLUE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CLOTUREE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const prioriteColors: Record<string, string> = {
  BASSE: 'text-gray-400',
  MOYENNE: 'text-blue-400',
  HAUTE: 'text-amber-400',
  CRITIQUE: 'text-rose-400',
};

export default function DemandesInterventionPage() {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';
  const isAdminOrChefTech = user?.role === 'ADMIN' || user?.role === 'CHEF_TECHNICIEN';

  const { data: disResponse, mutate, isLoading } = useSWR('/dis', fetcher);
  const dis = disResponse?.dis || [];

  const { data: ateliers } = useSWR('/equipements/ateliers', fetcher);
  const { data: lignes } = useSWR('/equipements/lignes', fetcher);
  const { data: postes } = useSWR('/equipements/postes', fetcher);
  const { data: techniciensList } = useSWR('/users/techniciens', fetcher);
  const techniciens = techniciensList || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    atelierId: '',
    ligneId: '',
    posteId: '',
    produit: '',
    description: '',
    priorite: 'MOYENNE',
  });

  const [isCreateOTModalOpen, setIsCreateOTModalOpen] = useState(false);
  const [otFormData, setOtFormData] = useState({
    demandeInterventionId: null as number | null,
    atelierId: '',
    ligneId: '',
    posteId: '',
    description: '',
    priorite: 'MOYENNE',
    typeMaintenance: 'CORRECTIVE',
    datePrevue: '',
    technicienId: '',
  });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDiId, setSelectedDiId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    produit: '',
    description: '',
    priorite: 'MOYENNE',
  });

  const handleOpenEdit = (di: any) => {
    setSelectedDiId(di.id);
    setEditFormData({
      produit: di.produit || '',
      description: di.description || '',
      priorite: di.priorite || 'MOYENNE',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiId) return;
    try {
      await api.put(`/dis/${selectedDiId}`, editFormData);
      toast.success("Demande d'intervention modifiée avec succès");
      setIsEditModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteDI = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette DI ?')) return;
    try {
      await api.delete(`/dis/${id}`);
      toast.success("Demande d'intervention supprimée avec succès");
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleOpenCreateOT = (di: any) => {
    setOtFormData({
      demandeInterventionId: di.id,
      atelierId: di.atelierId,
      ligneId: di.ligneId,
      posteId: di.posteId,
      description: `Suite à DI: ${di.description}`,
      priorite: di.priorite || 'MOYENNE',
      typeMaintenance: 'CORRECTIVE',
      datePrevue: '',
      technicienId: '',
    });
    setIsCreateOTModalOpen(true);
  };

  const handleSubmitOT = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/ots', {
        demandeInterventionId: otFormData.demandeInterventionId,
        atelierId: Number(otFormData.atelierId),
        ligneId: Number(otFormData.ligneId),
        posteId: Number(otFormData.posteId),
        description: otFormData.description,
        priorite: otFormData.priorite,
        typeMaintenance: otFormData.typeMaintenance,
        datePrevue: otFormData.datePrevue
          ? new Date(otFormData.datePrevue).toISOString()
          : undefined,
      });

      if (otFormData.technicienId) {
        await api.patch(`/ots/${(response as any).data.id}/assign`, {
          technicienId: Number(otFormData.technicienId),
        });
      }

      toast.success('Ordre de travail généré avec succès');
      setIsCreateOTModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de l'OT");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/dis', {
        ...formData,
        atelierId: Number(formData.atelierId),
        ligneId: Number(formData.ligneId),
        posteId: Number(formData.posteId),
      });
      toast.success("Demande d'intervention créée avec succès");
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const handleCreateOTFromDI = async (di: any) => {
    try {
      await api.post('/ots', {
        demandeInterventionId: di.id,
        atelierId: di.atelierId,
        ligneId: di.ligneId,
        posteId: di.posteId,
        description: `Suite à DI: ${di.description}`,
        priorite: di.priorite,
      });
      toast.success(`Ordre de travail généré depuis ${di.numeroDI}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la création de l'OT");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des demandes...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <MessageSquareWarning className="w-8 h-8 text-amber-400" />
              Demandes d&apos;Intervention (DI)
            </h2>
            <p className="text-muted-foreground mt-2">
              Gestion des signalements de pannes et incidents.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Signaler un incident
          </Button>
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <h3 className="font-semibold text-white">Dernières Demandes</h3>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Filter className="w-4 h-4 mr-2" /> Filtres
          </Button>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {dis.map((di: any) => (
            <div
              key={di.id}
              className="p-4 md:p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between group"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
                  <span className="text-xs text-muted-foreground font-mono">{di.numeroDI}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white text-base md:text-lg">
                      {di.produit || 'Équipement en panne'}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statutColors[di.statut]}`}
                    >
                      {di.statut.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${prioriteColors[di.priorite]}`}
                    >
                      • {di.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{di.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
                    <span>
                      📍 {di.atelier?.nom} &rsaquo; {di.ligne?.nom} &rsaquo; {di.poste?.nom}
                    </span>
                    <span>
                      👤 {di.declarePar?.nom} {di.declarePar?.prenom}
                    </span>
                    <span>
                      🕒 {format(new Date(di.dateDeclaration), 'dd MMM yyyy HH:mm', { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                {isAdminOrChefTech && di.statut === 'NOUVELLE' && (
                  <Button
                    onClick={() => handleOpenCreateOT(di)}
                    size="sm"
                    className="bg-[#651FAA] hover:bg-purple-600 text-white"
                  >
                    Créer OT
                  </Button>
                )}
                {isAdminOrChef && (
                  <Button
                    onClick={() => handleOpenEdit(di)}
                    size="sm"
                    variant="ghost"
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                  >
                    Modifier
                  </Button>
                )}
                {isAdminOrChef && di.statut === 'NOUVELLE' && (
                  <Button
                    onClick={() => handleDeleteDI(di.id)}
                    size="sm"
                    variant="ghost"
                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                  >
                    Supprimer
                  </Button>
                )}
                <Button
                  onClick={() => {
                    setSelectedItem(di);
                    setIsDetailsModalOpen(true);
                  }}
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground hover:text-white"
                >
                  Détails <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ))}
          {dis.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Aucune demande d&apos;intervention trouvée.
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Signaler un incident"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Atelier</label>
              <select
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.atelierId}
                onChange={(e) => setFormData({ ...formData, atelierId: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {ateliers?.map((a: any) => (
                  <option key={a.id} value={a.id}>
                    {a.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Ligne</label>
              <select
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.ligneId}
                onChange={(e) => setFormData({ ...formData, ligneId: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {lignes
                  ?.filter(
                    (l: any) => !formData.atelierId || l.atelierId === Number(formData.atelierId),
                  )
                  .map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.nom}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white">Poste (Équipement)</label>
              <select
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.posteId}
                onChange={(e) => setFormData({ ...formData, posteId: e.target.value })}
              >
                <option value="">Sélectionner</option>
                {postes
                  ?.filter((p: any) => !formData.ligneId || p.ligneId === Number(formData.ligneId))
                  .map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.nom}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Titre / Produit</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              placeholder="Ex: Surchauffe moteur"
              value={formData.produit}
              onChange={(e) => setFormData({ ...formData, produit: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description détaillée</label>
            <textarea
              required
              rows={4}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              placeholder="Décrivez le problème constaté..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
              Soumettre la DI
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Détails de la Demande d'Intervention"
      >
        {selectedItem && (
          <div className="space-y-4 text-sm text-white">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs">Numéro</span>{' '}
                  {selectedItem.numeroDI}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Statut</span>{' '}
                  {selectedItem.statut}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Titre</span>{' '}
                  {selectedItem.produit || 'N/A'}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Priorité</span>{' '}
                  {selectedItem.priorite}
                </div>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs mb-1">Description</span>
              <p className="bg-zinc-900 p-3 rounded-lg border border-white/5">
                {selectedItem.description}
              </p>
            </div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="text-muted-foreground block text-xs mb-2">Localisation</span>
              <p>
                📍 {selectedItem.atelier?.nom} &rsaquo; {selectedItem.ligne?.nom} &rsaquo;{' '}
                {selectedItem.poste?.nom}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Édition DI */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier la Demande d'Intervention"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Titre / Produit</label>
            <input
              type="text"
              required
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={editFormData.produit}
              onChange={(e) => setEditFormData({ ...editFormData, produit: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Description détaillée</label>
            <textarea
              required
              rows={4}
              minLength={10}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Priorité</label>
            <select
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={editFormData.priorite}
              onChange={(e) => setEditFormData({ ...editFormData, priorite: e.target.value })}
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="CRITIQUE">Critique</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Création OT depuis DI */}
      <Modal
        isOpen={isCreateOTModalOpen}
        onClose={() => setIsCreateOTModalOpen(false)}
        title="Générer un Ordre de Travail"
      >
        <form onSubmit={handleSubmitOT} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Description de l&apos;intervention
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={otFormData.description}
              onChange={(e) => setOtFormData({ ...otFormData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Type de maintenance</label>
              <select
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={otFormData.typeMaintenance}
                onChange={(e) => setOtFormData({ ...otFormData, typeMaintenance: e.target.value })}
              >
                <option value="CORRECTIVE">Corrective</option>
                <option value="PREVENTIVE">Préventive</option>
                <option value="AMELIORATIVE">Améliorative</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Priorité</label>
              <select
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={otFormData.priorite}
                onChange={(e) => setOtFormData({ ...otFormData, priorite: e.target.value })}
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Technicien</label>
              <select
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={otFormData.technicienId}
                onChange={(e) => setOtFormData({ ...otFormData, technicienId: e.target.value })}
              >
                <option value="">Non assigné</option>
                {techniciens.map((tech: any) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.prenom} {tech.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Date prévue</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
                value={otFormData.datePrevue}
                onChange={(e) => setOtFormData({ ...otFormData, datePrevue: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsCreateOTModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-[#651FAA] hover:bg-purple-600 text-white">
              Créer l&apos;OT
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
