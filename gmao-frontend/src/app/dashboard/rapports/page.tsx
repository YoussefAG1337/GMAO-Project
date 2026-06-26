'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FileText, Search, Clock, MapPin, Wrench, Calendar, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const fetcher = (url: string) => api.get(url).then((res: any) => res.data);

export default function RapportsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: rapports, error, isLoading } = useSWR('/ots/rapports', fetcher);

  const filteredRapports = rapports?.filter((r: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.diagnostic?.toLowerCase().includes(searchLower) ||
      r.actionsRealisees?.toLowerCase().includes(searchLower) ||
      r.ordreTravail?.numeroOT?.toLowerCase().includes(searchLower) ||
      r.redacteur?.nom?.toLowerCase().includes(searchLower) ||
      r.redacteur?.prenom?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Erreur lors du chargement des rapports.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            Rapports d&apos;Intervention
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role === 'TECHNICIEN' ? 'Consultez l\'historique de vos interventions.' : 'Consultez tous les rapports d\'intervention de l\'usine.'}
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher (OT, diagnostic, technicien)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-muted-foreground focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredRapports.map((rapport: any) => (
          <div key={rapport.id} className="bg-zinc-950/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 text-xs font-semibold border border-purple-500/20 mb-2">
                  <Wrench className="w-3 h-3" />
                  {rapport.ordreTravail?.numeroOT || 'OT Inconnu'}
                </span>
                <h3 className="text-lg font-medium text-white line-clamp-1" title={rapport.diagnostic}>{rapport.diagnostic}</h3>
              </div>
              <div className="text-xs text-muted-foreground flex flex-col items-end gap-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(rapport.createdAt), "d MMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <UserIcon className="w-3 h-3" />
                  {rapport.redacteur?.prenom} {rapport.redacteur?.nom}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Actions Réalisées</h4>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{rapport.actionsRealisees}</p>
              </div>

              {rapport.causePanne && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Cause de la Panne</h4>
                  <p className="text-sm text-zinc-300">{rapport.causePanne}</p>
                </div>
              )}

              {rapport.piecesUtilisees && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Pièces Utilisées</h4>
                  <p className="text-sm text-amber-200/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">{rapport.piecesUtilisees}</p>
                </div>
              )}

              {rapport.ordreTravail?.atelier && (
                <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.02] p-2 rounded-lg border border-white/[0.05]">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    {rapport.ordreTravail.atelier.nom} 
                    {rapport.ordreTravail.ligne ? ` › ${rapport.ordreTravail.ligne.nom}` : ''}
                    {rapport.ordreTravail.poste ? ` › ${rapport.ordreTravail.poste.nom}` : ''}
                  </span>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Intervention</p>
                    <p className="text-sm font-semibold text-white">{rapport.tempsIntervention} min</p>
                  </div>
                </div>
                {(rapport.tempsArret > 0) && (
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Arrêt machine</p>
                      <p className="text-sm font-semibold text-white">{rapport.tempsArret} min</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredRapports.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-xl">
            <p className="text-muted-foreground">Aucun rapport trouvé.</p>
          </div>
        )}
      </div>
    </div>
  );
}
