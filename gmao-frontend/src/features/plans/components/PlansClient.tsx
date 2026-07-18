'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useReferenceData } from '@/hooks/useReferenceData';
import { usePlans } from '@/features/plans/hooks/usePlans';
import { planService } from '@/services/plan.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { PlansHeader } from '@/features/plans/components/PlansHeader';
import { PlanList } from '@/features/plans/components/PlanList';
import { PlanFormModal } from '@/features/plans/components/PlanFormModal';
import { PlanDetailModal } from '@/features/plans/components/PlanDetailModal';
import { getErrorMessage } from '@/lib/error';
import { type PlanFormData } from '@/lib/validations/plan';

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

  const { plans, updatePlan, deletePlan, togglePlanActive, triggerPlan } = usePlans(initialPlans);

  const { ateliers, lignes, postes } = useReferenceData({
    initialAteliers,
    initialLignes,
    initialPostes,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [detailPlanId, setDetailPlanId] = useState<number | null>(null);

  const { data: detailPlanData } = useSWR(
    detailPlanId ? planService.keys.detail(detailPlanId) : null,
    () => planService.getById(detailPlanId!),
  );

  const isEditing = !!editingPlan;

  // Derive initialData for the modal from the plan being edited
  const initialData = editingPlan
    ? {
        intitule: editingPlan.intitule,
        description: editingPlan.description || '',
        atelierId: editingPlan.atelierId,
        ligneId: editingPlan.ligneId,
        posteId: editingPlan.posteId,
        frequence: editingPlan.frequence,
        prochaineExecution: editingPlan.prochaineExecution
          ? new Date(editingPlan.prochaineExecution).toISOString().split('T')[0]
          : '',
      }
    : undefined;

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: PlanFormData) => {
    try {
      const payload = {
        ...data,
        atelierId: Number(data.atelierId),
        ligneId: Number(data.ligneId),
        posteId: Number(data.posteId),
        frequence: data.frequence,
        prochaineExecution: data.prochaineExecution
          ? new Date(data.prochaineExecution).toISOString()
          : '',
      };

      if (isEditing) {
        await updatePlan(editingPlan.id, payload);
        toast.success('Plan de maintenance mis à jour');
      } else {
        await planService.create(payload as any);
        toast.success('Plan de maintenance créé avec succès');
      }
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erreur lors de l'enregistrement");
    }
  };

  const togglePlan = async (id: number, actif: boolean) => {
    try {
      await togglePlanActive(id, !actif);
      toast.success(actif ? 'Plan désactivé' : 'Plan activé');
    } catch {
      toast.error('Erreur lors du changement de statut');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce plan de maintenance ?')) return;
    try {
      await deletePlan(id);
      toast.success('Plan de maintenance supprimé');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };

  const handleTrigger = async (id: number) => {
    if (!window.confirm('Générer un OT maintenant pour ce plan ?')) return;
    try {
      const response = await triggerPlan(id);
      toast.success(`OT préventif généré : ${(response as any)!.numeroOT}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la génération');
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
        isEditing={isEditing}
        initialData={initialData}
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
