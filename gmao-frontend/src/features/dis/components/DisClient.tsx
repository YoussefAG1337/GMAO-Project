'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { useReferenceData } from '@/hooks/useReferenceData';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { DisHeader } from '@/features/dis/components/DisHeader';
import { DiList } from '@/features/dis/components/DiList';
import { DiFormModal } from '@/features/dis/components/DiFormModal';
import { DiDetailModal } from '@/features/dis/components/DiDetailModal';
import { DiEditModal } from '@/features/dis/components/DiEditModal';

interface DisClientProps {
  initialDis: any;
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
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

  const { data: disResponse, mutate } = useSWR('/dis', {
    fallbackData: initialDis,
  });
  const dis = disResponse?.dis || [];

  const { ateliers, lignes, postes } = useReferenceData({
    initialAteliers,
    initialLignes,
    initialPostes,
  });

  const { data: familles } = useSWR('/produits/familles');
  const { data: produits } = useSWR('/produits');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    atelierId: '',
    ligneId: '',
    posteId: '',
    familleId: '',
    produitId: '',
    panneId: '',
    nouvellePanneNom: '',
    priorite: 'MOYENNE',
    document: null as File | null,
  });

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDiId, setSelectedDiId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({
    atelierId: '',
    ligneId: '',
    posteId: '',
    familleId: '',
    produitId: '',
    panneId: '',
    nouvellePanneNom: '',
    priorite: 'MOYENNE',
  });

  const handleOpenEdit = (di: any) => {
    setSelectedDiId(di.id);
    setEditFormData({
      atelierId: di.atelierId?.toString() || '',
      ligneId: di.ligneId?.toString() || '',
      posteId: di.posteId?.toString() || '',
      familleId: di.produit?.familleProduitId?.toString() || '',
      produitId: di.produitId?.toString() || '',
      panneId: di.panneId?.toString() || '',
      nouvellePanneNom: '',
      priorite: di.priorite || 'MOYENNE',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDiId) return;

    setIsSubmitting(true);
    try {
      await api.put(`/dis/${selectedDiId}`, editFormData);
      toast.success("Demande d'intervention modifiée avec succès");
      setIsEditModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la modification');
    } finally {
      setIsSubmitting(false);
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

  const handleStartWork = async (diId: number) => {
    try {
      await api.post(`/ots/start-from-di/${diId}`);
      toast.success('Travail commencé, OT généré !');
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du démarrage du travail');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('atelierId', formData.atelierId);
      data.append('ligneId', formData.ligneId);
      data.append('posteId', formData.posteId);
      if (formData.produitId) data.append('produitId', formData.produitId);
      if (formData.panneId) data.append('panneId', formData.panneId);
      if (formData.nouvellePanneNom) data.append('nouvellePanneNom', formData.nouvellePanneNom);
      data.append('priorite', formData.priorite);

      if (formData.document) {
        data.append('document', formData.document);
      }

      await api.post('/dis', data);

      toast.success("Demande d'intervention créée avec succès");
      setIsModalOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = (di: any) => {
    setSelectedItem(di);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <DisHeader onOpenCreate={() => setIsModalOpen(true)} />

      <DiList
        dis={dis}
        isAdmin={isAdmin}
        isAdminOrChef={isAdminOrChef}
        isTechnician={user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN'}
        currentUserId={user?.id}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteDI}
        onOpenDetails={handleOpenDetails}
        onStartWork={handleStartWork}
      />

      <DiFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
        familles={familles || []}
        produits={produits || []}
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
        editFormData={editFormData}
        setEditFormData={setEditFormData}
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
