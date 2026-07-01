'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { EquipementsHeader } from '@/features/equipements/components/EquipementsHeader';
import { EquipementTabs } from '@/features/equipements/components/EquipementTabs';
import { EquipementsGrid } from '@/features/equipements/components/EquipementsGrid';
import { EquipementFormModal } from '@/features/equipements/components/EquipementFormModal';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

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

  const { data: ateliers, mutate: mutateAteliers } = useSWR('/equipements/ateliers', fetcher, {
    fallbackData: initialAteliers,
  });
  const { data: lignes, mutate: mutateLignes } = useSWR('/equipements/lignes', fetcher, {
    fallbackData: initialLignes,
  });
  const { data: postes, mutate: mutatePostes } = useSWR('/equipements/postes', fetcher, {
    fallbackData: initialPostes,
  });

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
      />
    </div>
  );
}
