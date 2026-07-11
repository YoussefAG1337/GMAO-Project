'use client';

interface EquipmentSelectProps {
  formData: any;
  setFormData: (data: any) => void;
  ateliers: any[];
  lignes: any[];
  postes: any[];
}

export function EquipmentSelect({
  formData,
  setFormData,
  ateliers,
  lignes,
  postes,
}: EquipmentSelectProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Atelier</label>
        <select
          required
          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
          value={formData.atelierId}
          onChange={(e) => setFormData({ ...formData, atelierId: e.target.value })}
        >
          <option value="">Sélectionner</option>
          {ateliers?.map((a: any) => (
            <option key={a.id} value={a.id}>
              {a.nom}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-white">Ligne</label>
        <select
          required
          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
          value={formData.ligneId}
          onChange={(e) => setFormData({ ...formData, ligneId: e.target.value })}
        >
          <option value="">Sélectionner</option>
          {lignes
            ?.filter((l: any) => !formData.atelierId || l.atelierId === Number(formData.atelierId))
            .map((l: any) => (
              <option key={l.id} value={l.id}>
                {l.nom}
              </option>
            ))}
        </select>
      </div>
      <div className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-white">Poste (Équipement)</label>
        <select
          required
          className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-white"
          value={formData.posteId}
          onChange={(e) => setFormData({ ...formData, posteId: e.target.value })}
        >
          <option value="">Sélectionner</option>
          {postes
            ?.filter((p: any) => !formData.ligneId || p.ligneId === Number(formData.ligneId))
            .map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.nom}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}
