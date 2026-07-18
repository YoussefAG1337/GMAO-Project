'use client';

import { Button } from '@/components/ui/button';
import { Play, CheckCircle, FileText, Clock, XCircle, ThumbsDown, UserCog } from 'lucide-react';
import { format } from 'date-fns';
import { statutColors, statutLabels, typeColors } from '../lib/constants';
import { Ot } from '@/types/ot.types';
import { User } from '@/types';

interface OtCardProps {
  ot: Ot;
  user: User | null;
  isAdminOrChefTech: boolean;
  onStart: (id: number) => void;
  onOpenRapport: (id: number) => void;
  onValiderTechnicien: (id: number) => void;
  onValidate: (id: number) => void;
  onReporter: (id: number) => void;
  onAnnuler: (id: number) => void;
  onNonValider: (id: number) => void;
  onReassign: (ot: Ot) => void;
  onEdit: (ot: Ot) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (ot: Ot) => void;
}

export function OtCard({
  ot,
  user,
  isAdminOrChefTech,
  onStart,
  onOpenRapport,
  onValiderTechnicien,
  onValidate,
  onReporter,
  onAnnuler,
  onNonValider,
  onReassign,
  onEdit,
  onDelete,
  onOpenDetails,
}: OtCardProps) {
  const isTech =
    user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN';
  const isAssignedTech = user?.id === ot.technicienId;

  return (
    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group flex flex-col gap-4 shadow-lg">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-sm font-bold text-white">{ot.numeroOT}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statutColors[ot.statut] ?? ''}`}
            >
              {statutLabels[ot.statut] ?? ot.statut}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${typeColors[ot.typeMaintenance] ?? ''}`}
            >
              {ot.typeMaintenance}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {ot.description || 'Intervention de maintenance'}
          </p>
        </div>
        {ot.demandeIntervention?.numeroDI && (
          <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded shrink-0">
            DI: {ot.demandeIntervention.numeroDI}
          </span>
        )}
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
        <div className="w-full">
          📍 {ot.atelier?.nom} › {ot.ligne?.nom} › {ot.poste?.nom}
        </div>
        <div className="w-full flex justify-between mt-1">
          <span>
            👷 {ot.technicien ? `${ot.technicien.prenom} ${ot.technicien.nom}` : 'Non assigné'}
          </span>
          <span>
            📅 Prévu: {ot.datePrevue ? format(new Date(ot.datePrevue), 'dd/MM/yyyy') : 'Non défini'}
          </span>
        </div>
      </div>

      {/* Reason banners */}
      {ot.statut === 'REPORTE' && ot.raisonReport && (
        <div className="text-xs text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2">
          🕐 <span className="font-medium">Report :</span> {ot.raisonReport}
        </div>
      )}
      {ot.statut === 'ANNULE' && ot.raisonAnnulation && (
        <div className="text-xs text-zinc-300 bg-zinc-500/10 border border-zinc-500/20 rounded-lg px-3 py-2">
          ✖ <span className="font-medium">Annulé :</span> {ot.raisonAnnulation}
        </div>
      )}
      {ot.statut === 'NON_VALIDE' && ot.raisonNonValidation && (
        <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
          ⚠ <span className="font-medium">Non validé :</span> {ot.raisonNonValidation}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-auto pt-2 border-t border-white/[0.06] flex-wrap">

        {/* --- TECHNICIEN ACTIONS --- */}

        {/* ASSIGNE → start */}
        {isTech && isAssignedTech && ot.statut === 'ASSIGNE' && (
          <Button
            size="sm"
            onClick={() => onStart(ot.id)}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Play className="w-4 h-4 mr-1.5" /> Démarrer
          </Button>
        )}

        {/* EN_COURS → soumettre rapport / reporter / annuler */}
        {isTech && isAssignedTech && ot.statut === 'EN_COURS' && (
          <>
            <Button
              size="sm"
              onClick={() => onOpenRapport(ot.id)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <FileText className="w-4 h-4 mr-1.5" /> Soumettre Rapport
            </Button>
            <Button
              size="sm"
              onClick={() => onReporter(ot.id)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Clock className="w-4 h-4 mr-1.5" /> Reporter
            </Button>
            <Button
              size="sm"
              onClick={() => onAnnuler(ot.id)}
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-500/10"
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Annuler
            </Button>
          </>
        )}

        {/* RAPPORTE → modifier rapport / valider mon travail / non validé / annuler */}
        {isTech && isAssignedTech && ot.statut === 'RAPPORTE' && (
          <>
            <Button
              size="sm"
              onClick={() => onOpenRapport(ot.id)}
              variant="ghost"
              className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <FileText className="w-4 h-4 mr-1.5" /> Modifier Rapport
            </Button>
            <Button
              size="sm"
              onClick={() => onValiderTechnicien(ot.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" /> Valider mon travail
            </Button>
            <Button
              size="sm"
              onClick={() => onNonValider(ot.id)}
              variant="ghost"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <ThumbsDown className="w-4 h-4 mr-1.5" /> Non validé
            </Button>
            <Button
              size="sm"
              onClick={() => onAnnuler(ot.id)}
              variant="ghost"
              className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-500/10"
            >
              <XCircle className="w-4 h-4 mr-1.5" /> Annuler
            </Button>
          </>
        )}

        {/* --- ADMIN / CHEF ACTIONS --- */}

        {/* EN_ATTENTE_VALIDATION → valider définitivement / non validé */}
        {isAdminOrChefTech && ot.statut === 'EN_ATTENTE_VALIDATION' && (
          <>
            <Button
              size="sm"
              onClick={() => onValidate(ot.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" /> Valider OT
            </Button>
            <Button
              size="sm"
              onClick={() => onNonValider(ot.id)}
              variant="ghost"
              className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
            >
              <ThumbsDown className="w-4 h-4 mr-1.5" /> Non validé
            </Button>
          </>
        )}

        {/* NON_VALIDE → réassigner */}
        {isAdminOrChefTech && ot.statut === 'NON_VALIDE' && (
          <Button
            size="sm"
            onClick={() => onReassign(ot)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <UserCog className="w-4 h-4 mr-1.5" /> Réassigner
          </Button>
        )}

        {/* --- COMMON ACTIONS --- */}
        {isAdminOrChefTech && (
          <Button
            size="sm"
            onClick={() => onEdit(ot)}
            variant="ghost"
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
          >
            Modifier
          </Button>
        )}

        {user?.role === 'ADMIN' && (
          <Button
            size="sm"
            onClick={() => onDelete(ot.id)}
            variant="ghost"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
          >
            Supprimer
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => onOpenDetails(ot)}
          variant="ghost"
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
        >
          Détails
        </Button>
      </div>
    </div>
  );
}
