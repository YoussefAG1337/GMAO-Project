export const statutColors: Record<string, string> = {
  CREE: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  ASSIGNE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  EN_COURS: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  REPORTE: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  RAPPORTE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  EN_ATTENTE_VALIDATION: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  NON_VALIDE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  ANNULE: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  FERME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export const statutLabels: Record<string, string> = {
  CREE: 'Créé',
  ASSIGNE: 'Assigné',
  EN_COURS: 'En cours',
  REPORTE: 'Reporté',
  RAPPORTE: 'Rapporté',
  EN_ATTENTE_VALIDATION: 'En attente validation',
  NON_VALIDE: 'Non validé',
  ANNULE: 'Annulé',
  FERME: 'Fermé',
};

export const typeColors: Record<string, string> = {
  PREVENTIVE: 'text-emerald-400 border-emerald-400/30',
  CORRECTIVE: 'text-rose-400 border-rose-400/30',
  AMELIORATIVE: 'text-blue-400 border-blue-400/30',
};
