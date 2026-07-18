import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import { Produit } from '@/types/produit.types';

interface ProduitsTableProps {
  produits: Produit[];
  onAdd: () => void;
  onEdit: (produit: Produit) => void;
  onDelete: (id: number) => void;
}

export function ProduitsTable({ produits, onAdd, onEdit, onDelete }: ProduitsTableProps) {
  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden">
      <div className="p-6 flex justify-between items-center border-b border-white/[0.06]">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          Liste des Produits
        </h2>
        <Button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Nouveau Produit
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs uppercase bg-white/[0.02] text-gray-400 border-b border-white/[0.06]">
            <tr>
              <th className="px-6 py-4 font-medium">Nom du produit</th>
              <th className="px-6 py-4 font-medium">Famille</th>
              <th className="px-6 py-4 font-medium w-32">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {produits?.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4 font-medium text-white">{p.nom}</td>
                <td className="px-6 py-4">{p.famille?.nom || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(p)}
                      className="p-1.5 text-gray-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
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
                  </div>
                </td>
              </tr>
            ))}
            {!produits?.length && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  Aucun produit trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
