'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Factory, Layers, Cpu, Edit2, Trash2 } from 'lucide-react';

interface EquipementsGridProps {
  activeTab: 'ATELIERS' | 'LIGNES' | 'POSTES';
  ateliers: any[];
  lignes: any[];
  postes: any[];
  isAdminOrChef: boolean;
}

export function EquipementsGrid({
  activeTab,
  ateliers,
  lignes,
  postes,
  isAdminOrChef,
}: EquipementsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {activeTab === 'ATELIERS' &&
        ateliers?.map((item: any) => (
          <Card
            key={item.id}
            className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-purple-500/30 transition-all group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Factory className="w-6 h-6" />
                </div>
                {isAdminOrChef && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-muted-foreground hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{item.nom}</h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description || 'Aucune description'}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="bg-white/5 px-2.5 py-1 rounded-md">
                  {item._count?.lignes || 0} Ligne(s)
                </span>
                {item.actif ? (
                  <span className="text-emerald-400">Actif</span>
                ) : (
                  <span className="text-rose-400">Inactif</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

      {activeTab === 'LIGNES' &&
        lignes?.map((item: any) => (
          <Card
            key={item.id}
            className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-blue-500/30 transition-all group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Layers className="w-6 h-6" />
                </div>
                {isAdminOrChef && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-muted-foreground hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{item.nom}</h3>
              <p className="text-xs text-blue-300/70 font-semibold mb-2 uppercase tracking-wider">
                {item.atelier?.nom}
              </p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description || 'Aucune description'}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span className="bg-white/5 px-2.5 py-1 rounded-md">
                  {item._count?.postes || 0} Poste(s)
                </span>
                {item.actif ? (
                  <span className="text-emerald-400">Actif</span>
                ) : (
                  <span className="text-rose-400">Inactif</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

      {activeTab === 'POSTES' &&
        postes?.map((item: any) => (
          <Card
            key={item.id}
            className="border-white/[0.06] bg-zinc-950/45 backdrop-blur-xl hover:border-emerald-500/30 transition-all group"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Cpu className="w-6 h-6" />
                </div>
                {isAdminOrChef && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-muted-foreground hover:text-white">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{item.nom}</h3>
              <p className="text-xs text-emerald-300/70 font-semibold mb-2 uppercase tracking-wider">
                {item.ligne?.atelier?.nom} &rsaquo; {item.ligne?.nom}
              </p>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {item.description || 'Aucune description'}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                {item.actif ? (
                  <span className="text-emerald-400">Actif</span>
                ) : (
                  <span className="text-rose-400">Inactif</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}
