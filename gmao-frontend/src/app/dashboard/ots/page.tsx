'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Wrench, Plus, Play, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

const statutColors: Record<string, string> = {
  CREE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ASSIGNE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  EN_COURS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  EN_ATTENTE_VALIDATION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  FERME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const typeColors: Record<string, string> = {
  PREVENTIVE: 'text-emerald-400 border-emerald-400/30',
  CORRECTIVE: 'text-rose-400 border-rose-400/30',
  AMELIORATIVE: 'text-blue-400 border-blue-400/30',
};

export default function OrdresTravailPage() {
  const { user } = useAuth();
  const isAdminOrChefTech = user?.role === 'ADMIN' || user?.role === 'CHEF_TECHNICIEN';

  const { data: otsResponse, mutate, isLoading } = useSWR('/ots', fetcher);
  const ots = otsResponse?.ots || [];

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
    description: '',
    priorite: 'MOYENNE',
    typeMaintenance: 'CORRECTIVE',
    datePrevue: '',
    technicienId: '',
  });

  const [isRapportModalOpen, setIsRapportModalOpen] = useState(false);
  const [selectedOtId, setSelectedOtId] = useState<number | null>(null);
  const [rapportData, setRapportData] = useState({
    diagnostic: '',
    causePanne: '',
    actionsRealisees: '',
    tempsIntervention: '',
    tempsArret: '',
    piecesUtilisees: '',
    commentaires: '',
  });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    priorite: 'MOYENNE',
    datePrevue: '',
    technicienId: '',
  });

  const handleOpenEdit = (ot: any) => {
    setSelectedOtId(ot.id);
    setEditFormData({
      description: ot.description || '',
      priorite: ot.priorite || 'MOYENNE',
      datePrevue: ot.datePrevue ? format(new Date(ot.datePrevue), 'yyyy-MM-dd') : '',
      technicienId: ot.technicienId ? ot.technicienId.toString() : '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOtId) return;
    try {
      await api.put(`/ots/${selectedOtId}`, {
        description: editFormData.description,
        priorite: editFormData.priorite,
        datePrevue: editFormData.datePrevue
          ? new Date(editFormData.datePrevue).toISOString()
          : undefined,
      });
      if (editFormData.technicienId) {
        await api.patch(`/ots/${selectedOtId}/assign`, {
          technicienId: Number(editFormData.technicienId),
        });
      }
      toast.success('Ordre de Travail modifié avec succès');
      setIsEditModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification');
    }
  };

  const handleDeleteOT = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet Ordre de Travail ?')) return;
    try {
      await api.delete(`/ots/${id}`);
      toast.success('Ordre de Travail supprimé');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ots', {
        ...formData,
        atelierId: Number(formData.atelierId),
        ligneId: Number(formData.ligneId),
        posteId: Number(formData.posteId),
        datePrevue: formData.datePrevue ? new Date(formData.datePrevue).toISOString() : undefined,
      });
      toast.success('Ordre de Travail créé avec succès');
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  const handleStartOT = async (id: number) => {
    try {
      await api.patch(`/ots/${id}/start`);
      toast.success('Ordre de travail démarré');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du démarrage');
    }
  };

  const handleValidateOT = async (id: number) => {
    try {
      await api.patch(`/ots/${id}/validate`);
      toast.success('Ordre de travail validé et clôturé');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la validation');
    }
  };

  const handleOpenRapport = (id: number) => {
    setSelectedOtId(id);
    setRapportData({
      diagnostic: '',
      causePanne: '',
      actionsRealisees: '',
      tempsIntervention: '',
      tempsArret: '',
      piecesUtilisees: '',
      commentaires: '',
    });
    setIsRapportModalOpen(true);
  };

  const handleSubmitRapport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOtId) return;
    try {
      await api.post(`/ots/${selectedOtId}/rapport`, {
        ...rapportData,
        tempsIntervention: Number(rapportData.tempsIntervention),
        tempsArret: rapportData.tempsArret ? Number(rapportData.tempsArret) : undefined,
      });
      toast.success('Rapport soumis avec succès');
      setIsRapportModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la soumission');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des OTs...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-400" />
              Ordres de Travail (OT)
            </h2>
            <p className="text-muted-foreground mt-2">
              Suivi et exécution des interventions de maintenance.
            </p>
          </div>
          {isAdminOrChefTech && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un OT
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ots.map((ot: any) => (
          <div
            key={ot.id}
            className="p-5 rounded-2xl bg-zinc-950/40 border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group flex flex-col gap-4 shadow-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-sm font-bold text-white">{ot.numeroOT}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statutColors[ot.statut]}`}
                  >
                    {ot.statut.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${typeColors[ot.typeMaintenance]}`}
                  >
                    {ot.typeMaintenance}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {ot.description || 'Intervention de maintenance'}
                </p>
              </div>
              {ot.demandeIntervention?.numeroDI && (
                <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
                  DI: {ot.demandeIntervention.numeroDI}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
              <div className="w-full">
                📍 {ot.atelier?.nom} &rsaquo; {ot.ligne?.nom} &rsaquo; {ot.poste?.nom}
              </div>
              <div className="w-full flex justify-between mt-1">
                <span>
                  👷{' '}
                  {ot.technicien ? `${ot.technicien.prenom} ${ot.technicien.nom}` : 'Non assigné'}
                </span>
                <span>
                  📅 Prévu:{' '}
                  {ot.datePrevue ? format(new Date(ot.datePrevue), 'dd/MM/yyyy') : 'Non défini'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-auto pt-2 border-t border-white/[0.06]">
              {(user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN') &&
                ot.statut === 'ASSIGNE' &&
                user?.id === ot.technicienId && (
                  <Button
                    size="sm"
                    onClick={() => handleStartOT(ot.id)}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" /> Démarrer
                  </Button>
                )}
              {(user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN') &&
                ot.statut === 'EN_COURS' &&
                user?.id === ot.technicienId && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenRapport(ot.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    <FileText className="w-4 h-4 mr-2" /> Soumettre Rapport
                  </Button>
                )}
              {isAdminOrChefTech && ot.statut === 'EN_ATTENTE_VALIDATION' && (
                <Button
                  size="sm"
                  onClick={() => handleValidateOT(ot.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Valider OT
                </Button>
              )}
              {isAdminOrChefTech && (
                <Button
                  size="sm"
                  onClick={() => handleOpenEdit(ot)}
                  variant="ghost"
                  className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                >
                  Modifier
                </Button>
              )}
              {isAdminOrChefTech && ot.statut === 'CREE' && (
                <Button
                  size="sm"
                  onClick={() => handleDeleteOT(ot.id)}
                  variant="ghost"
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                >
                  Supprimer
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setSelectedItem(ot);
                  setIsDetailsModalOpen(true);
                }}
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
              >
                Détails
              </Button>
            </div>
          </div>
        ))}
        {ots.length === 0 && (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            Aucun ordre de travail trouvé.
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Créer un Ordre de Travail"
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
            <label className="text-sm font-medium text-white">
              Description de l&apos;intervention
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Type</label>
              <select
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.typeMaintenance}
                onChange={(e) => setFormData({ ...formData, typeMaintenance: e.target.value })}
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
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
              >
                <option value="BASSE">Basse</option>
                <option value="MOYENNE">Moyenne</option>
                <option value="HAUTE">Haute</option>
                <option value="CRITIQUE">Critique</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Date prévue</label>
            <input
              type="date"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={formData.datePrevue}
              onChange={(e) => setFormData({ ...formData, datePrevue: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
              Créer l&apos;OT
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isRapportModalOpen}
        onClose={() => setIsRapportModalOpen(false)}
        title="Soumettre un rapport d'intervention"
      >
        <form onSubmit={handleSubmitRapport} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Diagnostic</label>
            <textarea
              required
              rows={2}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={rapportData.diagnostic}
              onChange={(e) => setRapportData({ ...rapportData, diagnostic: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Cause de la panne (optionnel)</label>
            <input
              type="text"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={rapportData.causePanne}
              onChange={(e) => setRapportData({ ...rapportData, causePanne: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Actions réalisées</label>
            <textarea
              required
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
              value={rapportData.actionsRealisees}
              onChange={(e) => setRapportData({ ...rapportData, actionsRealisees: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Temps d&apos;intervention (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={rapportData.tempsIntervention}
                onChange={(e) =>
                  setRapportData({ ...rapportData, tempsIntervention: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Temps d&apos;arrêt machine (minutes)
              </label>
              <input
                type="number"
                min="0"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={rapportData.tempsArret}
                onChange={(e) => setRapportData({ ...rapportData, tempsArret: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Pièces utilisées (optionnel)</label>
            <input
              type="text"
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              placeholder="Ex: Filtre à huile, 2 vis M8"
              value={rapportData.piecesUtilisees}
              onChange={(e) => setRapportData({ ...rapportData, piecesUtilisees: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsRapportModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">
              Soumettre
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Détails de l'Ordre de Travail"
      >
        {selectedItem && (
          <div className="space-y-4 text-sm text-white">
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs">Numéro</span>{' '}
                  {selectedItem.numeroOT}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Statut</span>{' '}
                  {selectedItem.statut}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Type</span>{' '}
                  {selectedItem.typeMaintenance}
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
                {selectedItem.description || 'N/A'}
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

      {/* Modal Edition OT */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier l'Ordre de Travail"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">
              Description de l&apos;intervention
            </label>
            <textarea
              required
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Technicien</label>
              <select
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={editFormData.technicienId}
                onChange={(e) => setEditFormData({ ...editFormData, technicienId: e.target.value })}
              >
                <option value="">Non assigné</option>
                {techniciens.map((tech: any) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.prenom} {tech.nom}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white">Date prévue</label>
              <input
                type="date"
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
                value={editFormData.datePrevue}
                onChange={(e) => setEditFormData({ ...editFormData, datePrevue: e.target.value })}
              />
            </div>
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
    </div>
  );
}
