'use client';

import { useState } from 'react';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useEquipementManager } from '@/features/equipements/hooks/useEquipementManager';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { EquipementsHeader } from '@/features/equipements/components/EquipementsHeader';
import { EquipementTabs } from '@/features/equipements/components/EquipementTabs';
import { EquipementsGrid } from '@/features/equipements/components/EquipementsGrid';
import { EquipementFormModal } from '@/features/equipements/components/EquipementFormModal';
import { PannesListModal } from '@/features/equipements/components/PannesListModal';
import { EquipementKpisModal } from '@/features/equipements/components/EquipementKpisModal';

import { Atelier, Ligne, Poste } from '@/types/equipement.types';
import { getErrorMessage } from '@/lib/error';
import {
  AtelierFormData,
  LigneFormData,
  PosteFormData,
} from '@/lib/validations/equipement';

type EquipementFormData = AtelierFormData | LigneFormData | PosteFormData;

interface EquipementsClientProps {
  initialAteliers: Atelier[];
  initialLignes: Ligne[];
  initialPostes: Poste[];
}

export function EquipementsClient({
  initialAteliers,
  initialLignes,
  initialPostes,
}: EquipementsClientProps) {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  const { ateliers, lignes, postes, techniciens } = useReferenceData({
    initialAteliers,
    initialLignes,
    initialPostes,
    fetchTechniciens: true,
  });

  const manager = useEquipementManager();

  const [activeTab, setActiveTab] = useState<'ATELIERS' | 'LIGNES' | 'POSTES'>('ATELIERS');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'ATELIER' | 'LIGNE' | 'POSTE'>('ATELIER');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<Record<string, any> | undefined>(undefined);

  const [isPannesModalOpen, setIsPannesModalOpen] = useState(false);
  const [selectedEquipementForPannes, setSelectedEquipementForPannes] = useState<{
    id: number;
    type: 'LIGNE' | 'POSTE';
    nom: string;
  } | null>(null);

  const [isKpisModalOpen, setIsKpisModalOpen] = useState(false);
  const [selectedEquipementForKpis, setSelectedEquipementForKpis] = useState<{
    id: number;
    type: 'LIGNE' | 'POSTE';
    nom: string;
  } | null>(null);

  const handleOpenModal = (type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    setEditingId(null);
    setModalType(type);
    setInitialFormData(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Atelier | Ligne | Poste, type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    setEditingId(item.id);
    setModalType(type);
    setInitialFormData({
      nom: item.nom,
      description: item.description || '',
      atelierId: (item as any).atelierId,
      ligneId: (item as any).ligneId,
      technicienIds:
        type === 'LIGNE' ? (item as any).techniciens?.map((t: any) => t.id) || [] : [],
    });
    setIsModalOpen(true);
  };

  const handleManagePannes = (item: Ligne | Poste, type: 'LIGNE' | 'POSTE') => {
    setSelectedEquipementForPannes({ id: item.id, type, nom: item.nom });
    setIsPannesModalOpen(true);
  };

  const handleViewKpis = (item: Ligne | Poste, type: 'LIGNE' | 'POSTE') => {
    setSelectedEquipementForKpis({ id: item.id, type, nom: item.nom });
    setIsKpisModalOpen(true);
  };

  const handleDelete = async (id: number, type: 'ATELIER' | 'LIGNE' | 'POSTE') => {
    if (
      !confirm(
        'Êtes-vous sûr de vouloir supprimer définitivement cet équipement ? Cette action est irréversible.',
      )
    )
      return;
    try {
      if (type === 'ATELIER') await manager.deleteAtelier(id);
      else if (type === 'LIGNE') await manager.deleteLigne(id);
      else await manager.deletePoste(id);
      toast.success('Équipement supprimé avec succès');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };

  const handleToggleActive = async (
    id: number,
    type: 'ATELIER' | 'LIGNE' | 'POSTE',
    currentStatus: boolean,
  ) => {
    try {
      if (type === 'ATELIER') await manager.toggleAtelierActive(id, !currentStatus);
      else if (type === 'LIGNE') await manager.toggleLigneActive(id, !currentStatus);
      else await manager.togglePosteActive(id, !currentStatus);
      toast.success(`Équipement ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erreur lors du changement d'état");
    }
  };

  const handleSubmit = async (data: EquipementFormData) => {
    try {
      if (modalType === 'ATELIER') {
        const payload = { nom: data.nom, description: data.description ?? '' };
        if (editingId) await manager.updateAtelier(editingId, payload);
        else await manager.createAtelier(payload);
      } else if (modalType === 'LIGNE') {
        const ligneData = data as LigneFormData;
        const payload = {
          nom: ligneData.nom,
          description: ligneData.description ?? '',
          atelierId: Number(ligneData.atelierId),
          technicienIds: ligneData.technicienIds?.map(Number) || [],
        };
        if (editingId) await manager.updateLigne(editingId, payload);
        else await manager.createLigne(payload);
      } else if (modalType === 'POSTE') {
        const posteData = data as PosteFormData;
        const payload = {
          nom: posteData.nom,
          description: posteData.description ?? '',
          ligneId: Number(posteData.ligneId),
        };
        if (editingId) await manager.updatePoste(editingId, payload);
        else await manager.createPoste(payload);
      }
      toast.success(
        `${modalType.charAt(0) + modalType.slice(1).toLowerCase()} ${editingId ? 'modifié' : 'créé'} avec succès`,
      );
      setIsModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la création');
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
        onViewKpis={handleViewKpis}
      />

      <EquipementFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        modalType={modalType}
        initialData={initialFormData}
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

      <EquipementKpisModal
        isOpen={isKpisModalOpen}
        onClose={() => setIsKpisModalOpen(false)}
        equipementId={selectedEquipementForKpis?.id || null}
        equipementType={selectedEquipementForKpis?.type || null}
        equipementNom={selectedEquipementForKpis?.nom || ''}
      />
    </div>
  );
}
