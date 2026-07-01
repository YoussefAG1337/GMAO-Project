'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

import { DisHeader } from '@/features/dis/components/DisHeader';
import { DiList } from '@/features/dis/components/DiList';
import { DiFormModal } from '@/features/dis/components/DiFormModal';
import { DiDetailModal } from '@/features/dis/components/DiDetailModal';
import { DiEditModal } from '@/features/dis/components/DiEditModal';
import { DiCreateOtModal } from '@/features/dis/components/DiCreateOtModal';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

interface DisClientProps {
  initialDis: any;
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
  initialTechniciens: any[];
}

export function DisClient({
  initialDis,
  initialAteliers,
  initialLignes,
  initialPostes,
  initialTechniciens,
}: DisClientProps) {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';
  const isAdminOrChefTech = user?.role === 'ADMIN' || user?.role === 'CHEF_TECHNICIEN';

  const { data: disResponse, mutate } = useSWR('/dis', fetcher, {
    fallbackData: initialDis,
  });
  const dis = disResponse?.dis || [];

  const { data: ateliers } = useSWR('/equipements/ateliers', fetcher, {
    fallbackData: initialAteliers,
  });
  const { data: lignes } = useSWR('/equipements/lignes', fetcher, {
    fallbackData: initialLignes,
  });
  const { data: postes } = useSWR('/equipements/postes', fetcher, {
    fallbackData: initialPostes,
  });
  const { data: techniciensList } = useSWR('/users/techniciens', fetcher, {
    fallbackData: initialTechniciens,
  });
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

  const handleOpenDetails = (di: any) => {
    setSelectedItem(di);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <DisHeader onOpenCreate={() => setIsModalOpen(true)} />

      <DiList
        dis={dis}
        isAdminOrChef={isAdminOrChef}
        isAdminOrChefTech={isAdminOrChefTech}
        onOpenCreateOT={handleOpenCreateOT}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteDI}
        onOpenDetails={handleOpenDetails}
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
      />

      <DiCreateOtModal
        isOpen={isCreateOTModalOpen}
        onClose={() => setIsCreateOTModalOpen(false)}
        onSubmit={handleSubmitOT}
        otFormData={otFormData}
        setOtFormData={setOtFormData}
        techniciens={techniciens}
      />
    </div>
  );
}
