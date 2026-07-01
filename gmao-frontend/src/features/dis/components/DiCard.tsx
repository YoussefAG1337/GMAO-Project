'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { statutColors, prioriteColors } from '../lib/constants';

interface DiCardProps {
  di: any;
  isAdminOrChef: boolean;
  isAdminOrChefTech: boolean;
  onOpenCreateOT: (di: any) => void;
  onEdit: (di: any) => void;
  onDelete: (id: number) => void;
  onOpenDetails: (di: any) => void;
}

export function DiCard({
  di,
  isAdminOrChef,
  isAdminOrChefTech,
  onOpenCreateOT,
  onEdit,
  onDelete,
  onOpenDetails,
}: DiCardProps) {
  return (
    <div className="p-4 md:p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between group">
      <div className="flex items-start gap-4 flex-1">
        <div className="hidden sm:flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 shrink-0">
          <span className="text-xs text-muted-foreground font-mono">{di.numeroDI}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-white text-base md:text-lg">
              {di.produit || 'Équipement en panne'}
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
          <p className="text-sm text-muted-foreground line-clamp-1">{di.description}</p>
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
        {isAdminOrChefTech && di.statut === 'NOUVELLE' && (
          <Button
            onClick={() => onOpenCreateOT(di)}
            size="sm"
            className="bg-[#651FAA] hover:bg-purple-600 text-white"
          >
            Créer OT
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
        {isAdminOrChef && di.statut === 'NOUVELLE' && (
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
