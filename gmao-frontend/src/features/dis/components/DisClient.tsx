'use client';

import { useState } from 'react';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useDis } from '@/features/dis/hooks/useDis';
import { useProduits } from '@/features/produits/hooks/useProduits';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { DisHeader } from '@/features/dis/components/DisHeader';
import { DiList } from '@/features/dis/components/DiList';
import { DiFormModal } from '@/features/dis/components/DiFormModal';
import { DiDetailModal } from '@/features/dis/components/DiDetailModal';
import { DiEditModal } from '@/features/dis/components/DiEditModal';

import { Di } from '@/types/di.types';
import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { getErrorMessage } from '@/lib/error';
import { CreateDiFormData, UpdateDiFormData } from '@/lib/validations/di';

interface DisClientProps {
  initialDis: Di[];
  initialAteliers: Atelier[];
  initialLignes: Ligne[];
  initialPostes: Poste[];
}

export function DisClient({
  initialDis,
  initialAteliers,
  initialLignes,
  initialPostes,
}: DisClientProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrChef = isAdmin || user?.role === 'CHEF_MAINTENANCE';

  const { dis, createDi, updateDi, deleteDi, startWork } = useDis(initialDis);

  const { ateliers, lignes, postes, techniciens } = useReferenceData({
    initialAteliers,
    initialLignes,
    initialPostes,
    fetchTechniciens: isAdminOrChef,
  });

  const { familles, produits } = useProduits();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Di | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDiId, setSelectedDiId] = useState<number | null>(null);
  const [initialEditData, setInitialEditData] = useState<any>(null);

  const handleOpenEdit = (di: Di) => {
    setSelectedDiId(di.id);
    setInitialEditData({
      atelierId: di.atelierId,
      ligneId: di.ligneId,
      posteId: di.posteId,
      familleId: di.produit?.familleProduitId,
      produitId: di.produitId,
      panneId: di.panneId,
      nouvellePanneNom: di.nouvellePanneNom || '',
      priorite: di.priorite || 'MOYENNE',
      technicienId: di.technicienId,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (formData: UpdateDiFormData) => {
    if (!selectedDiId) return;

    setIsSubmitting(true);
    try {
      await updateDi(selectedDiId, formData as any);
      toast.success("Demande d'intervention modifiée avec succès");
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDI = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette DI ?')) return;
    try {
      await deleteDi(id);
      toast.success("Demande d'intervention supprimée avec succès");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };

  const handleStartWork = async (diId: number) => {
    try {
      await startWork(diId);
      toast.success('Travail commencé, OT généré !');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors du démarrage du travail');
    }
  };

  const handleSubmit = async (formData: CreateDiFormData) => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('atelierId', String(formData.atelierId));
      data.append('ligneId', String(formData.ligneId));
      data.append('posteId', String(formData.posteId));
      if (formData.produitId) data.append('produitId', String(formData.produitId));
      if (formData.panneId && formData.panneId !== 'NOUVELLE')
        data.append('panneId', String(formData.panneId));
      if (formData.nouvellePanneNom) data.append('nouvellePanneNom', formData.nouvellePanneNom);
      data.append('priorite', formData.priorite);
      if (formData.technicienId) data.append('technicienId', String(formData.technicienId));

      if (formData.document && formData.document.length > 0) {
        data.append('document', formData.document[0]);
      }

      await createDi(data);

      toast.success("Demande d'intervention créée avec succès");
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = (di: Di) => {
    setSelectedItem(di);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <DisHeader onOpenCreate={() => setIsModalOpen(true)} />

      <DiList
        dis={dis}
        currentUserId={user?.id as any}
        user={user as any}
        isAdmin={isAdmin}
        isAdminOrChef={isAdminOrChef}
        isTechnician={user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN'}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteDI}
        onOpenDetails={handleOpenDetails}
        onStartWork={handleStartWork}
      />

      <DiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
        familles={familles || []}
        produits={produits || []}
        techniciens={techniciens || []}
        isAdminOrChef={isAdminOrChef}
        isSubmitting={isSubmitting}
      />

      <DiDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedItem={selectedItem}
      />

      <DiEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={initialEditData}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
        familles={familles || []}
        produits={produits || []}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
