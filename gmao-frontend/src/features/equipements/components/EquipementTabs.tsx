'use client';

import { Factory, Layers, Cpu } from 'lucide-react';

interface EquipementTabsProps {
  activeTab: 'ATELIERS' | 'LIGNES' | 'POSTES';
  setActiveTab: (tab: 'ATELIERS' | 'LIGNES' | 'POSTES') => void;
}

export function EquipementTabs({ activeTab, setActiveTab }: EquipementTabsProps) {
  return (
    <div className="flex gap-4 border-b border-white/[0.06] pb-px">
      <button
        onClick={() => setActiveTab('ATELIERS')}
        className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${
          activeTab === 'ATELIERS'
            ? 'border-purple-400 text-purple-400'
            : 'border-transparent text-muted-foreground hover:text-white'
        }`}
      >
        <Factory className="w-4 h-4 inline-block mr-2" /> Ateliers
      </button>
      <button
        onClick={() => setActiveTab('LIGNES')}
        className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${
          activeTab === 'LIGNES'
            ? 'border-purple-400 text-purple-400'
            : 'border-transparent text-muted-foreground hover:text-white'
        }`}
      >
        <Layers className="w-4 h-4 inline-block mr-2" /> Lignes
      </button>
      <button
        onClick={() => setActiveTab('POSTES')}
        className={`pb-4 px-2 text-sm font-semibold transition-all border-b-2 ${
          activeTab === 'POSTES'
            ? 'border-purple-400 text-purple-400'
            : 'border-transparent text-muted-foreground hover:text-white'
        }`}
      >
        <Cpu className="w-4 h-4 inline-block mr-2" /> Postes
      </button>
    </div>
  );
}
