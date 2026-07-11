'use client';

import { useState } from 'react';
import { useReferenceData } from '@/hooks/useReferenceData';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { EquipementsHeader } from '@/features/equipements/components/EquipementsHeader';
import { EquipementTabs } from '@/features/equipements/components/EquipementTabs';
import { EquipementsGrid } from '@/features/equipements/components/EquipementsGrid';
import { EquipementFormModal } from '@/features/equipements/components/EquipementFormModal';
import { PannesListModal } from '@/features/equipements/components/PannesListModal';

interface EquipementsClientProps {
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
}

export function EquipementsClient({
  initialAteliers,
  initialLignes,
  initialPostes,
}: EquipementsClientProps) {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  const { ateliers, mutateAteliers, lignes, mutateLignes, postes, mutatePostes, techniciens } =
    useReferenceData({
      initialAteliers,
      initialLignes,
      initialPostes,
    });

  const [activeTab, setActiveTab] = useState<'ATELIERS' | 'LIGNES' | 'POSTES'>('ATELIERS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ATELIER' | 'LIGNE' | 'POSTE'>('ATELIER');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [isPannesModalOpen, setIsPannesModalOpen] = useState(false);
  const [selectedEquipementForPannes, setSelectedEquipementForPannes] = useState<{
    id: number;
    type: 'LIGNE' | 'POSTE';
    nom: string;
  } | null>(null);

  const [formData, setFormData] = useState<{
    nom: string;
    description: string;
    atelierId: string;
    ligneId: string;
    technicienIds: string[];
  }>({
    nom: '',
    description: '',
    atelierId: '',
    ligneId: '',
    technicienIds: [],
  });

  const handleOpenModal = (type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    setEditingId(null);
    setModalType(type);
    setFormData({ nom: '', description: '', atelierId: '', ligneId: '', technicienIds: [] });
    setIsModalOpen(true);
  };

  const handleEdit = (item: any, type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    setEditingId(item.id);
    setModalType(type);
    setFormData({
      nom: item.nom,
      description: item.description || '',
      atelierId: item.atelierId?.toString() || '',
      ligneId: item.ligneId?.toString() || '',
      technicienIds:
        type === 'LIGNE' ? item.techniciens?.map((t: any) => t.id.toString()) || [] : [],
    });
    setIsModalOpen(true);
  };

  const handleManagePannes = (item: any, type: 'LIGNE' | 'POSTE') => {
    setSelectedEquipementForPannes({
      id: item.id,
      type,
      nom: item.nom,
    });
    setIsPannesModalOpen(true);
  };

  const handleDelete = async (id: number, type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer définitivement cet équipement ? Cette action est irréversible.',
      )
    )
      return;
    try {
      const endpoint =
        type === 'ATELIER'
          ? `/equipements/ateliers/${id}`
          : type === 'LIGNE'
            ? `/equipements/lignes/${id}`
            : `/equipements/postes/${id}`;

      await api.delete(endpoint);
      toast.success('Équipement supprimé avec succès');

      if (type === 'ATELIER') mutateAteliers();
      if (type === 'LIGNE') mutateLignes();
      if (type === 'POSTE') mutatePostes();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (
    id: number,
    type: 'ATELIER' | 'LIGNE' | 'POSTE',
    currentStatus: boolean,
  ) => {
    try {
      const endpoint =
        type === 'ATELIER'
          ? `/equipements/ateliers/${id}`
          : type === 'LIGNE'
            ? `/equipements/lignes/${id}`
            : `/equipements/postes/${id}`;

      await api.put(endpoint, { actif: !currentStatus });
      toast.success(`Équipement ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);

      if (type === 'ATELIER') mutateAteliers();
      if (type === 'LIGNE') mutateLignes();
      if (type === 'POSTE') mutatePostes();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du changement d'état");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modalType === 'ATELIER') {
        if (editingId) {
          await api.put(`/equipements/ateliers/${editingId}`, {
            nom: formData.nom,
            description: formData.description,
          });
        } else {
          await api.post('/equipements/ateliers', {
            nom: formData.nom,
            description: formData.description,
          });
        }
        mutateAteliers();
      } else if (modalType === 'LIGNE') {
        if (editingId) {
          await api.put(`/equipements/lignes/${editingId}`, {
            nom: formData.nom,
            description: formData.description,
            atelierId: Number(formData.atelierId),
            technicienIds: formData.technicienIds.map(Number),
          });
        } else {
          await api.post('/equipements/lignes', {
            nom: formData.nom,
            description: formData.description,
            atelierId: Number(formData.atelierId),
            technicienIds: formData.technicienIds.map(Number),
          });
        }
        mutateLignes();
      } else if (modalType === 'POSTE') {
        if (editingId) {
          await api.put(`/equipements/postes/${editingId}`, {
            nom: formData.nom,
            description: formData.description,
            ligneId: Number(formData.ligneId),
          });
        } else {
          await api.post('/equipements/postes', {
            nom: formData.nom,
            description: formData.description,
            ligneId: Number(formData.ligneId),
          });
        }
        mutatePostes();
      }
      toast.success(
        `${modalType.charAt(0) + modalType.slice(1).toLowerCase()} ${editingId ? 'modifié' : 'créé'} avec succès`,
      );
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <EquipementsHeader isAdminOrChef={isAdminOrChef} onOpenModal={handleOpenModal} />

      <EquipementTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <EquipementsGrid
        activeTab={activeTab}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
        isAdminOrChef={isAdminOrChef}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
        onManagePannes={handleManagePannes}
      />

      <EquipementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        modalType={modalType}
        formData={formData}
        setFormData={setFormData}
        ateliers={ateliers || []}
        lignes={lignes || []}
        techniciens={techniciens || []}
        isEditing={!!editingId}
      />

      <PannesListModal
        isOpen={isPannesModalOpen}
        onClose={() => setIsPannesModalOpen(false)}
        equipementId={selectedEquipementForPannes?.id || null}
        equipementType={selectedEquipementForPannes?.type || null}
        equipementNom={selectedEquipementForPannes?.nom || ''}
      />
    </div>
  );
}
