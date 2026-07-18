import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Box } from 'lucide-react';
import { FamilleProduit } from '@/types/produit.types';

interface FamillesTableProps {
  familles: FamilleProduit[];
  onAdd: () => void;
  onEdit: (famille: FamilleProduit) => void;
  onDelete: (id: number) => void;
}

export function FamillesTable({ familles, onAdd, onEdit, onDelete }: FamillesTableProps) {
  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-white/[0.06]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Box className="w-5 h-5 text-emerald-400" />
          Liste des Familles
        </h2>
        <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle Famille
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/[0.06]">
            <tr>
              <th className="px-6 py-4 font-medium">Nom de la famille</th>
              <th className="px-6 py-4 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {familles?.map((f) => (
              <tr key={f.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{f.nom}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(f)}
                      className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(f.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!familles?.length && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-gray-500">
                  Aucune famille de produit trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
