import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Package, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Piece } from '@/types/magasin.types';

interface PiecesTableProps {
  pieces: Piece[];
  onAdd: () => void;
  onEdit: (piece: Piece) => void;
  onDelete: (id: number) => void;
  onMouvement: (piece: Piece, type: 'ENTREE' | 'SORTIE') => void;
  canManage: boolean;
}

export function PiecesTable({
  pieces,
  onAdd,
  onEdit,
  onDelete,
  onMouvement,
  canManage,
}: PiecesTableProps) {
  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-white/[0.06]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          Stock des Pièces
        </h2>
        {canManage && (
          <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Plus className="w-4 h-4 mr-2" /> Nouvelle Pièce
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/[0.06]">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Nom</th>
              <th className="px-6 py-4 font-medium">Quantité</th>
              <th className="px-6 py-4 font-medium">Prix U.</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {pieces?.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.code}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">{p.nom}</div>
                  <div className="text-xs text-gray-500">{p.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${p.quantiteStock <= p.seuilAlerte ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}
                  >
                    {p.quantiteStock}
                  </span>
                </td>
                <td className="px-6 py-4">{p.prixUnitaire ? p.prixUnitaire + ' TND' : '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onMouvement(p, 'ENTREE')}
                      className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                      title="Entrée"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMouvement(p, 'SORTIE')}
                      className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                      title="Sortie"
                    >
                      <ArrowUpFromLine className="w-4 h-4" />
                    </button>
                    {canManage && (
                      <>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                          onClick={() => onEdit(p)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(p.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {!pieces?.length && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucune pièce trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
