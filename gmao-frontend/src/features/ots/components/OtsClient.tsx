'use client';

import { useState } from 'react';
import { useReferenceData } from '@/hooks/useReferenceData';
import { useOts } from '@/features/ots/hooks/useOts';
import { useMagasin } from '@/features/magasin/hooks/useMagasin';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { OtsHeader } from '@/features/ots/components/OtsHeader';
import { OtList } from '@/features/ots/components/OtList';
import { OtFormModal } from '@/features/ots/components/OtFormModal';
import { OtRapportModal } from '@/features/ots/components/OtRapportModal';
import { OtDetailModal } from '@/features/ots/components/OtDetailModal';
import { OtEditModal } from '@/features/ots/components/OtEditModal';
import { ReasonModal } from '@/components/ui/ReasonModal';
import { getErrorMessage } from '@/lib/error';
import { CreateOtFormData, UpdateOtFormData, SubmitRapportFormData } from '@/lib/validations/ot';
import { Ot } from '@/types/ot.types';

interface OtsClientProps {
  initialOts: any;
  initialAteliers: any[];
  initialLignes: any[];
  initialPostes: any[];
  initialTechniciens: any[];
}

// Controls which ReasonModal is open and for which OT
type ReasonModalType = 'reporter' | 'annuler' | 'nonValider' | null;

export function OtsClient({
  initialOts,
  initialAteliers,
  initialLignes,
  initialPostes,
  initialTechniciens,
}: OtsClientProps) {
  const { user } = useAuth();
  const isAdminOrChefTech = user?.role === 'ADMIN' || user?.role === 'CHEF_TECHNICIEN';

  const {
    ots,
    createOt,
    updateOt,
    assignOt,
    deleteOt,
    startOt,
    submitRapport,
    validerTechnicien,
    validateOt,
    reporterOt,
    annulerOt,
    nonValiderOt,
  } = useOts(initialOts);

  const { ateliers, lignes, postes, techniciens } = useReferenceData({
    initialAteliers,
    initialLignes,
    initialPostes,
    initialTechniciens,
    fetchTechniciens: isAdminOrChefTech,
  });

  const { pieces: magasinPieces } = useMagasin();

  // --- Modal states ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRapportModalOpen, setIsRapportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);

  const [selectedOtId, setSelectedOtId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<Ot | null>(null);
  const [initialEditData, setInitialEditData] = useState<any>(null);

  // ReasonModal state
  const [reasonModalType, setReasonModalType] = useState<ReasonModalType>(null);
  const [reasonOtId, setReasonOtId] = useState<number | null>(null);

  // --- Helper to open a ReasonModal ---
  const openReasonModal = (type: ReasonModalType, id: number) => {
    setReasonOtId(id);
    setReasonModalType(type);
  };

  const closeReasonModal = () => {
    setReasonModalType(null);
    setReasonOtId(null);
  };

  // --- OT creation ---
  const handleSubmit = async (data: CreateOtFormData) => {
    try {
      await createOt({
        ...data,
        atelierId: Number(data.atelierId),
        ligneId: Number(data.ligneId),
        posteId: Number(data.posteId),
        priorite: data.priorite as any,
        typeMaintenance: data.typeMaintenance as any,
        datePrevue: data.datePrevue ? new Date(data.datePrevue).toISOString() : undefined,
      });
      toast.success('Ordre de Travail créé avec succès');
      setIsCreateModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la création');
    }
  };

  // --- Edit ---
  const handleOpenEdit = (ot: Ot) => {
    setSelectedOtId(ot.id);
    setInitialEditData({
      description: ot.description || '',
      priorite: ot.priorite || 'MOYENNE',
      datePrevue: ot.datePrevue ? format(new Date(ot.datePrevue), 'yyyy-MM-dd') : '',
      technicienId: ot.technicienId ? Number(ot.technicienId) : undefined,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (data: UpdateOtFormData) => {
    if (!selectedOtId) return;
    try {
      await updateOt(selectedOtId, {
        description: data.description,
        priorite: data.priorite as any,
        datePrevue: data.datePrevue ? new Date(data.datePrevue).toISOString() : undefined,
      });
      if (data.technicienId) {
        await assignOt(selectedOtId, { technicienId: Number(data.technicienId) });
      }
      toast.success('Ordre de Travail modifié avec succès');
      setIsEditModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la modification');
    }
  };

  // --- Delete ---
  const handleDeleteOT = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet Ordre de Travail ?')) return;
    try {
      await deleteOt(id);
      toast.success('Ordre de Travail supprimé');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la suppression');
    }
  };

  // --- Start ---
  const handleStartOT = async (id: number) => {
    try {
      await startOt(id);
      toast.success('Ordre de travail démarré');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors du démarrage');
    }
  };

  // --- Rapport ---
  const handleOpenRapport = (id: number) => {
    setSelectedOtId(id);
    setIsRapportModalOpen(true);
  };

  const handleSubmitRapport = async (data: SubmitRapportFormData) => {
    if (!selectedOtId) return;
    try {
      await submitRapport(selectedOtId, {
        diagnostic: data.diagnostic,
        causePanne: data.causePanne || '',
        actionsRealisees: data.actionsRealisees,
        commentaires: data.commentaires || '',
        tempsIntervention: Number(data.tempsIntervention),
        tempsArret: data.tempsArret ? Number(data.tempsArret) : undefined,
        piecesUtilisees:
          data.piecesUtilisees && data.piecesUtilisees.length > 0
            ? data.piecesUtilisees
            : undefined,
      });
      toast.success('Rapport soumis avec succès');
      setIsRapportModalOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la soumission');
    }
  };

  // --- Technicien self-validation ---
  const handleValiderTechnicien = async (id: number) => {
    try {
      await validerTechnicien(id);
      toast.success('Travail validé — en attente de validation admin');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la validation');
    }
  };

  // --- Admin/Chef final validation ---
  const handleValidateOT = async (id: number) => {
    try {
      await validateOt(id);
      toast.success('OT validé et clôturé');
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors de la validation');
    }
  };

  // --- Reporter (reason modal confirm) ---
  const handleConfirmReporter = async (raison: string) => {
    if (!reasonOtId) return;
    try {
      await reporterOt(reasonOtId, { raison });
      toast.success('Intervention reportée à une autre date');
      closeReasonModal();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors du report');
    }
  };

  // --- Annuler (reason modal confirm) ---
  const handleConfirmAnnuler = async (raison: string) => {
    if (!reasonOtId) return;
    try {
      await annulerOt(reasonOtId, { raison });
      toast.success('OT annulé');
      closeReasonModal();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || "Erreur lors de l'annulation");
    }
  };

  // --- Non Validé (reason modal confirm) ---
  const handleConfirmNonValider = async (raison: string) => {
    if (!reasonOtId) return;
    try {
      await nonValiderOt(reasonOtId, { raison });
      toast.success('OT marqué comme non validé');
      closeReasonModal();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err) || 'Erreur lors du refus');
    }
  };

  // --- Reassign (open edit modal with reassign intent) ---
  const handleReassign = (ot: Ot) => {
    handleOpenEdit(ot);
  };

  // --- Details ---
  const handleOpenDetails = (ot: Ot) => {
    setSelectedItem(ot);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <OtsHeader
        isAdminOrChefTech={isAdminOrChefTech}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      <OtList
        ots={ots}
        user={user}
        isAdminOrChefTech={isAdminOrChefTech}
        onStart={handleStartOT}
        onOpenRapport={handleOpenRapport}
        onValiderTechnicien={handleValiderTechnicien}
        onValidate={handleValidateOT}
        onReporter={(id) => openReasonModal('reporter', id)}
        onAnnuler={(id) => openReasonModal('annuler', id)}
        onNonValider={(id) => openReasonModal('nonValider', id)}
        onReassign={handleReassign}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteOT}
        onOpenDetails={handleOpenDetails}
      />

      <OtFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleSubmit}
        ateliers={ateliers || []}
        lignes={lignes || []}
        postes={postes || []}
      />

      <OtRapportModal
        isOpen={isRapportModalOpen}
        onClose={() => setIsRapportModalOpen(false)}
        onSubmit={handleSubmitRapport}
        magasinPieces={magasinPieces || []}
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
        initialData={initialEditData}
        techniciens={techniciens}
      />

      {/* ── Reason Modals ── */}
      <ReasonModal
        isOpen={reasonModalType === 'reporter'}
        title="Reporter l'intervention"
        description="Indiquez la raison pour laquelle cette intervention est reportée à une autre date."
        confirmLabel="Confirmer le report"
        confirmClassName="bg-orange-500 hover:bg-orange-600 text-white"
        onConfirm={handleConfirmReporter}
        onClose={closeReasonModal}
      />

      <ReasonModal
        isOpen={reasonModalType === 'annuler'}
        title="Annuler l'OT"
        description="Indiquez la raison de l'annulation de cet ordre de travail."
        confirmLabel="Confirmer l'annulation"
        confirmClassName="bg-zinc-500 hover:bg-zinc-600 text-white"
        onConfirm={handleConfirmAnnuler}
        onClose={closeReasonModal}
      />

      <ReasonModal
        isOpen={reasonModalType === 'nonValider'}
        title="Marquer comme Non Validé"
        description="Indiquez la raison du refus. Un admin ou chef pourra réassigner cet OT."
        confirmLabel="Confirmer le refus"
        confirmClassName="bg-rose-500 hover:bg-rose-600 text-white"
        onConfirm={handleConfirmNonValider}
        onClose={closeReasonModal}
      />
    </div>
  );
}
