'use client';

import { Users, Search } from 'lucide-react';

interface UtilisateursHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function UtilisateursHeader({ searchTerm, setSearchTerm }: UtilisateursHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-400" />
          Gestion des Utilisateurs
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les accès, approuvez les nouvelles inscriptions et assignez les rôles.
        </p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-zinc-900 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
        />
      </div>
    </div>
  );
}
