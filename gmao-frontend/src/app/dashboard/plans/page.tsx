'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarRange, Plus, Clock, Power, RefreshCw, Trash2, Zap, Eye, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

const freqLabels: Record<string, string> = {
  HEBDOMADAIRE: 'Chaque Semaine',
  MENSUELLE: 'Chaque Mois',
  TRIMESTRIELLE: 'Chaque Trimestre',
  SEMESTRIELLE: 'Chaque Semestre',
  ANNUELLE: 'Chaque Année',
};

const statusColors: Record<string, string> = {
  CREE: 'bg-gray-500/10 text-gray-400',
  ASSIGNE: 'bg-blue-500/10 text-blue-400',
  EN_COURS: 'bg-amber-500/10 text-amber-400',
  EN_ATTENTE_VALIDATION: 'bg-purple-500/10 text-purple-400',
  FERME: 'bg-emerald-500/10 text-emerald-400',
};

export default function PlansMaintenancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrChef = isAdmin || user?.role === 'CHEF_MAINTENANCE';

  const { data: plansResponse, mutate, isLoading } = useSWR('/plans', fetcher);
  const plans = plansResponse || [];

  const { data: ateliers } = useSWR('/equipements/ateliers', fetcher);
  const { data: lignes } = useSWR('/equipements/lignes', fetcher);
  const { data: postes } = useSWR('/equipements/postes', fetcher);

  // States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [detailPlanId, setDetailPlanId] = useState<number | null>(null);

  const { data: detailPlanData } = useSWR(detailPlanId ? `/plans/${detailPlanId}` : null, fetcher);

  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    atelierId: '',
    ligneId: '',
    posteId: '',
    frequence: 'MENSUELLE',
    prochaineExecution: '',
  });

  const isEditing = !!editingPlan;

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      intitule: '',
      description: '',
      atelierId: '',
      ligneId: '',
      posteId: '',
      frequence: 'MENSUELLE',
      prochaineExecution: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      intitule: plan.intitule,
      description: plan.description || '',
      atelierId: plan.atelierId.toString(),
      ligneId: plan.ligneId.toString(),
      posteId: plan.posteId.toString(),
      frequence: plan.frequence,
      prochaineExecution: plan.prochaineExecution ? new Date(plan.prochaineExecution).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        atelierId: Number(formData.atelierId),
        ligneId: Number(formData.ligneId),
        posteId: Number(formData.posteId),
        prochaineExecution: formData.prochaineExecution
          ? new Date(formData.prochaineExecution).toISOString()
          : undefined,
      };

      if (isEditing) {
        await api.put(`/plans/${editingPlan.id}`, payload);
        toast.success('Plan de maintenance mis à jour');
      } else {
        await api.post('/plans', payload);
        toast.success('Plan de maintenance créé avec succès');
      }
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'enregistrement");
    }
  };

  const togglePlan = async (id: number, actif: boolean) => {
    try {
      await api.put(`/plans/${id}`, { actif: !actif });
      toast.success(actif ? 'Plan désactivé' : 'Plan activé');
      mutate();
    } catch {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce plan de maintenance ?')) return;
    try {
      await api.delete(`/plans/${id}`);
      toast.success('Plan de maintenance supprimé');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleTrigger = async (id: number) => {
    if (!window.confirm('Générer un OT maintenant pour ce plan ?')) return;
    try {
      const response = await api.post<any>(`/plans/${id}/trigger`);
      toast.success(`OT préventif généré : ${response.data.numeroOT}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des plans...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <CalendarRange className="w-8 h-8 text-emerald-400" />
              Plans Préventifs
            </h2>
            <p className="text-muted-foreground mt-2">
              Génération automatique des interventions de maintenance régulières.
            </p>
          </div>
          {isAdminOrChef && (
            <Button
              onClick={handleOpenCreate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Plan
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card
            key={plan.id}
            className="border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-lg flex flex-col"
          >
            <CardContent className="p-6 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <RefreshCw className={`w-6 h-6 ${plan.actif ? 'animate-spin-slow' : ''}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${plan.actif ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                  >
                    {plan.actif ? 'Actif' : 'Inactif'}
                  </span>
                  {isAdminOrChef && plan.actif && (
                    <Button 
                      variant="ghost" 
                      size="icon-xs"
                      onClick={() => handleTrigger(plan.id)} 
                      className="bg-violet-500/10 text-violet-400 hover:bg-violet-500/20" 
                      title="Générer OT maintenant"
                    >
                      <Zap className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>

              <h3 
                className="text-lg font-bold text-white leading-tight cursor-pointer hover:text-emerald-400 transition-colors flex items-center gap-2"
                onClick={() => setDetailPlanId(plan.id)}
              >
                {plan.intitule}
                <Eye className="w-4 h-4 text-muted-foreground opacity-50" />
              </h3>
              <p className="text-xs text-emerald-400/80 font-bold uppercase tracking-wider mt-2 mb-3">
                {freqLabels[plan.frequence] || plan.frequence}
              </p>

              <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl space-y-2 mt-auto">
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Cible:</span>
                  <span
                    className="text-white text-right max-w-[150px] truncate"
                    title={`${plan.atelier?.nom} > ${plan.poste?.nom}`}
                  >
                    {plan.poste?.nom}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>Prochaine exécution:</span>
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {plan.prochaineExecution
                      ? format(new Date(plan.prochaineExecution), 'dd MMM yyyy', { locale: fr })
                      : '-'}
                  </span>
                </div>
              </div>

              {isAdminOrChef && (
                <div className="mt-4 flex gap-2 pt-4 border-t border-white/[0.06]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 text-muted-foreground hover:text-white hover:bg-white/[0.05]"
                  >
                    Modifier
                  </Button>
                  <Button
                    onClick={() => togglePlan(plan.id, plan.actif)}
                    variant="ghost"
                    size="sm"
                    className={`flex-1 ${plan.actif ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-400/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'}`}
                  >
                    <Power className="w-4 h-4 mr-2" /> {plan.actif ? 'Désactiver' : 'Activer'}
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="py-24 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
            <CalendarDays className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aucun plan préventif</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            Vous n&apos;avez pas encore configuré de maintenance préventive. Créez un plan pour automatiser la génération de vos ordres de travail.
          </p>
          {isAdminOrChef && (
            <Button onClick={handleOpenCreate} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-2" />
              Créer le premier plan
            </Button>
          )}
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Modifier le Plan' : 'Créer un Plan de Maintenance'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Intitulé du plan</label>
            <Input
              type="text"
              required
              placeholder="Ex: Entretien mensuel compresseur"
              value={formData.intitule}
              onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
            />
          </div>

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
                  ?.filter((l: any) => !formData.atelierId || l.atelierId === Number(formData.atelierId))
                  .map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.nom}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-white">Poste (Équipement cible)</label>
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
            <label className="text-sm font-medium text-white">Description et instructions</label>
            <textarea
              rows={3}
              className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white placeholder-muted-foreground"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Fréquence</label>
              <select
                required
                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
                value={formData.frequence}
                onChange={(e) => setFormData({ ...formData, frequence: e.target.value })}
              >
                <option value="HEBDOMADAIRE">Hebdomadaire</option>
                <option value="MENSUELLE">Mensuelle</option>
                <option value="TRIMESTRIELLE">Trimestrielle</option>
                <option value="SEMESTRIELLE">Semestrielle</option>
                <option value="ANNUELLE">Annuelle</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Première/Prochaine exécution</label>
              <Input
                type="date"
                required={!isEditing}
                value={formData.prochaineExecution}
                onChange={(e) => setFormData({ ...formData, prochaineExecution: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.05]">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">
              {isEditing ? 'Enregistrer' : 'Créer le Plan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailPlanId}
        onClose={() => setDetailPlanId(null)}
        title="Détails du Plan Préventif"
      >
        {!detailPlanData ? (
          <div className="p-8 text-center text-muted-foreground">Chargement...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white">{detailPlanData.intitule}</h3>
              <p className="text-sm text-muted-foreground mt-1">{detailPlanData.description || 'Aucune description'}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl">
              <div>
                <div className="text-xs text-muted-foreground">Fréquence</div>
                <div className="font-semibold text-emerald-400 text-sm mt-1">{freqLabels[detailPlanData.frequence]}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Statut</div>
                <div className="font-semibold text-white text-sm mt-1">{detailPlanData.actif ? 'Actif' : 'Inactif'}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Dernière exécution</div>
                <div className="font-semibold text-white text-sm mt-1">
                  {detailPlanData.dernierExecution ? format(new Date(detailPlanData.dernierExecution), 'dd MMM yyyy', { locale: fr }) : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Prochaine exécution</div>
                <div className="font-semibold text-emerald-400 text-sm mt-1">
                  {detailPlanData.prochaineExecution ? format(new Date(detailPlanData.prochaineExecution), 'dd MMM yyyy', { locale: fr }) : '-'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">Historique des OTs (Générés)</h4>
              {detailPlanData.ordresTravail?.length > 0 ? (
                <div className="space-y-2">
                  {detailPlanData.ordresTravail.map((ot: any) => (
                    <div key={ot.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm">{ot.numeroOT}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[ot.statut]}`}>
                          {ot.statut.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Prévu le: {ot.datePrevue ? format(new Date(ot.datePrevue), 'dd/MM/yyyy') : '-'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-4 bg-white/[0.01] rounded-xl border border-white/[0.02] text-center">
                  Aucun OT n&apos;a encore été généré par ce plan.
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
