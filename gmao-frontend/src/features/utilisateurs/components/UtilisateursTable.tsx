'use client';

import { CheckCircle2, ShieldAlert, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UtilisateursTableProps {
  filteredUsers: any[];
  onApprove: (id: number) => void;
  onOpenEdit: (user: any) => void;
}

export function UtilisateursTable({
  filteredUsers,
  onApprove,
  onOpenEdit,
}: UtilisateursTableProps) {
  return (
    <div className="bg-zinc-950/50 border border-white/10 rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/10">
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Contact
              </th>
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Rôle
              </th>
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Statut
              </th>
              <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm">
                      {u.prenom.charAt(0)}
                      {u.nom.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {u.prenom} {u.nom}
                      </p>
                      <p className="text-xs text-muted-foreground">ID: {u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm text-zinc-300">{u.email}</p>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.actif ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
                      <ShieldAlert className="w-3.5 h-3.5" /> En attente
                    </span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  {!u.actif && (
                    <Button
                      size="sm"
                      onClick={() => onApprove(u.id)}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    >
                      Approuver
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenEdit(u)}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</div>
      )}
    </div>
  );
}
