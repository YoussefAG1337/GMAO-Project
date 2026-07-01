'use client';

import { Button } from '@/components/ui/button';
import { Play, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { statutColors, typeColors } from '../lib/constants';

interface OtCardProps {
  ot: any;
  user: any;
  isAdminOrChefTech: boolean;
  onStart: (id: number) => void;
  onOpenRapport: (id: number) => void;
  onValidate: (id: number) => void;
  onEdit: (ot: any) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (ot: any) => void;
}

export function OtCard({
  ot,
  user,
  isAdminOrChefTech,
  onStart,
  onOpenRapport,
  onValidate,
  onEdit,
  onDelete,
  onOpenDetails,
}: OtCardProps) {
  return (
    <div className="p-5 rounded-2xl bg-zinc-950/40 border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.02] transition-all group flex flex-col gap-4 shadow-lg">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-sm font-bold text-white">{ot.numeroOT}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statutColors[ot.statut]}`}
            >
              {ot.statut.replace(/_/g, ' ')}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${typeColors[ot.typeMaintenance]}`}
            >
              {ot.typeMaintenance}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {ot.description || 'Intervention de maintenance'}
          </p>
        </div>
        {ot.demandeIntervention?.numeroDI && (
          <span className="text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-1 rounded">
            DI: {ot.demandeIntervention.numeroDI}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground bg-white/[0.02] p-3 rounded-xl border border-white/[0.03]">
        <div className="w-full">
          📍 {ot.atelier?.nom} &rsaquo; {ot.ligne?.nom} &rsaquo; {ot.poste?.nom}
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

      <div className="flex items-center justify-end gap-2 mt-auto pt-2 border-t border-white/[0.06]">
        {(user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN') &&
          ot.statut === 'ASSIGNE' &&
          user?.id === ot.technicienId && (
            <Button
              size="sm"
              onClick={() => onStart(ot.id)}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" /> Démarrer
            </Button>
          )}
        {(user?.role === 'TECHNICIEN' || user?.role === 'CHEF_TECHNICIEN') &&
          ot.statut === 'EN_COURS' &&
          user?.id === ot.technicienId && (
            <Button
              size="sm"
              onClick={() => onOpenRapport(ot.id)}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              <FileText className="w-4 h-4 mr-2" /> Soumettre Rapport
            </Button>
          )}
        {isAdminOrChefTech && ot.statut === 'EN_ATTENTE_VALIDATION' && (
          <Button
            size="sm"
            onClick={() => onValidate(ot.id)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" /> Valider OT
          </Button>
        )}
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
        {isAdminOrChefTech && ot.statut === 'CREE' && (
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
