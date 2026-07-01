'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { OtsHeader } from '@/features/ots/components/OtsHeader';
import { OtList } from '@/features/ots/components/OtList';
import { OtFormModal } from '@/features/ots/components/OtFormModal';
import { OtRapportModal } from '@/features/ots/components/OtRapportModal';
import { OtDetailModal } from '@/features/ots/components/OtDetailModal';
import { OtEditModal } from '@/features/ots/components/OtEditModal';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

interface OtsClientProps {
  initialOts: any;
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
  initialTechniciens: any[];
}

export function OtsClient({
  initialOts,
  initialAteliers,
  initialLignes,
  initialPostes,
  initialTechniciens,
}: OtsClientProps) {
  const { user } = useAuth();
  const isAdminOrChefTech = user?.role === 'ADMIN' || user?.role === 'CHEF_TECHNICIEN';

  const { data: otsResponse, mutate } = useSWR('/ots', fetcher, {
    fallbackData: initialOts,
  });
  const ots = otsResponse?.ots || [];

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

  const handleOpenDetails = (ot: any) => {
    setSelectedItem(ot);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <OtsHeader isAdminOrChefTech={isAdminOrChefTech} onOpenCreate={() => setIsModalOpen(true)} />

      <OtList
        ots={ots}
        user={user}
        isAdminOrChefTech={isAdminOrChefTech}
        onStart={handleStartOT}
        onOpenRapport={handleOpenRapport}
        onValidate={handleValidateOT}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteOT}
        onOpenDetails={handleOpenDetails}
      />

      <OtFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
      />

      <OtRapportModal
        isOpen={isRapportModalOpen}
        onClose={() => setIsRapportModalOpen(false)}
        onSubmit={handleSubmitRapport}
        rapportData={rapportData}
        setRapportData={setRapportData}
      />

      <OtDetailModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        selectedItem={selectedItem}
      />

      <OtEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        techniciens={techniciens}
      />
    </div>
  );
}
