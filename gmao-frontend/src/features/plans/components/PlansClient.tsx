'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { PlansHeader } from '@/features/plans/components/PlansHeader';
import { PlanList } from '@/features/plans/components/PlanList';
import { PlanFormModal } from '@/features/plans/components/PlanFormModal';
import { PlanDetailModal } from '@/features/plans/components/PlanDetailModal';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

interface PlansClientProps {
  initialPlans: any[];
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
}

export function PlansClient({
  initialPlans,
  initialAteliers,
  initialLignes,
  initialPostes,
}: PlansClientProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrChef = isAdmin || user?.role === 'CHEF_MAINTENANCE';

  const { data: plansResponse, mutate } = useSWR('/plans', fetcher, {
    fallbackData: initialPlans,
  });
  // Si initialPlans vient en tant que array brut ou object {plans: []}, à vérifier
  // En se basant sur le code original: const plans = plansResponse || []
  const plans = plansResponse || [];

  const { data: ateliers } = useSWR('/equipements/ateliers', fetcher, {
    fallbackData: initialAteliers,
  });
  const { data: lignes } = useSWR('/equipements/lignes', fetcher, {
    fallbackData: initialLignes,
  });
  const { data: postes } = useSWR('/equipements/postes', fetcher, {
    fallbackData: initialPostes,
  });

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
      prochaineExecution: plan.prochaineExecution
        ? new Date(plan.prochaineExecution).toISOString().split('T')[0]
        : '',
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

  return (
    <div className="space-y-8 animate-fade-in-up">
      <PlansHeader isAdminOrChef={isAdminOrChef} onOpenCreate={handleOpenCreate} />

      <PlanList
        plans={plans}
        isAdmin={isAdmin}
        isAdminOrChef={isAdminOrChef}
        onToggle={togglePlan}
        onDelete={handleDelete}
        onTrigger={handleTrigger}
        onEdit={handleOpenEdit}
        onViewDetail={setDetailPlanId}
        onOpenCreate={handleOpenCreate}
      />

      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEditing={isEditing}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
      />

      <PlanDetailModal
        isOpen={!!detailPlanId}
        onClose={() => setDetailPlanId(null)}
        detailPlanData={detailPlanData}
      />
    </div>
  );
}
