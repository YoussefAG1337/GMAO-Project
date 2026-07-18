'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { statutColors, prioriteColors } from '../lib/constants';

import { Di } from '@/types/di.types';

interface DiCardProps {
  di: Di;
  isAdmin: boolean;
  isAdminOrChef: boolean;
  isTechnician: boolean;
  currentUserId?: number;
  onEdit: (di: Di) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (di: Di) => void;
  onStartWork: (id: number) => void;
}

export function DiCard({
  di,
  isAdmin,
  isAdminOrChef,
  isTechnician,
  currentUserId,
  onEdit,
  onDelete,
  onOpenDetails,
  onStartWork,
}: DiCardProps) {
  const canStartWork =
    isTechnician && di.statut === 'NOUVELLE' && di.technicienId === currentUserId;

  return (
    <div className="p-4 md:p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between group">
      <div className="flex items-start gap-4 flex-1">
        <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">{di.numeroDI}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white text-base md:text-lg">
              {di.produit?.nom || 'Équipement en panne'}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statutColors[di.statut]}`}
            >
              {di.statut.replace('_', ' ')}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${prioriteColors[di.priorite]}`}
            >
              • {di.priorite}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground line-clamp-1">
              {di.panne?.nom ? `Panne signalée : ${di.panne.nom}` : 'Aucune description détaillée'}
            </p>
            {di.panne?.type && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                  di.panne.type === 'QUALITE'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {di.panne.type === 'QUALITE' ? 'Qualité' : 'Technique'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
            <span>
              📍 {di.atelier?.nom} &rsaquo; {di.ligne?.nom} &rsaquo; {di.poste?.nom}
            </span>
            <span>
              👤 {di.declarePar?.nom} {di.declarePar?.prenom}
            </span>
            <span>
              🕒 {format(new Date(di.dateDeclaration), 'dd MMM yyyy HH:mm', { locale: fr })}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
        {canStartWork && (
          <Button
            onClick={() => onStartWork(di.id)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Commencer le travail
          </Button>
        )}
        {isAdminOrChef && (
          <Button
            onClick={() => onEdit(di)}
            size="sm"
            variant="ghost"
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
          >
            Modifier
          </Button>
        )}
        {isAdmin && (
          <Button
            onClick={() => onDelete(di.id)}
            size="sm"
            variant="ghost"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
          >
            Supprimer
          </Button>
        )}
        <Button
          onClick={() => onOpenDetails(di)}
          size="sm"
          variant="ghost"
          className="text-muted-foreground hover:text-white"
        >
          Détails <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
