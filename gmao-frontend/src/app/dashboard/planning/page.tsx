'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Calendar, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { toast } from 'sonner';
import {
  format,
  startOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

const fetcher = (url: string) => api.get<any>(url).then((res) => res.data);

export default function PlanningPage() {
  const { user } = useAuth();
  const isAdminOrChef = user?.role === 'ADMIN' || user?.role === 'CHEF_MAINTENANCE';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  const { data: calendarData, mutate } = useSWR(
    `/calendar?month=${month}&year=${year}`,
    fetcher
  );

  const ots = calendarData?.ots || [];
  const upcomingPlans = calendarData?.upcomingPlans || [];

  // Generate calendar grid days (42 cells: 6 rows x 7 cols)
  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentDate);

    // getDay returns 0 for Sunday, 1 for Monday. We want Monday=0, Sunday=6
    const startDay = (getDay(start) + 6) % 7; 
    
    // We need 42 days total (6 weeks * 7 days)
    const startDate = new Date(start);
    startDate.setDate(startDate.getDate() - startDay);
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 41);

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleGenerateNow = async (planId: number) => {
    if (!window.confirm('Générer un OT maintenant pour ce plan ?')) return;
    try {
      const response = await api.post<any>(`/plans/${planId}/trigger`);
      toast.success(`OT préventif généré : ${response.data.numeroOT}`);
      mutate();
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la génération');
    }
  };

  const selectedDayOTs = selectedDate
    ? ots.filter((ot: any) => isSameDay(new Date(ot.datePrevue), selectedDate))
    : [];

  const selectedDayPlans = selectedDate
    ? upcomingPlans.filter((p: any) => isSameDay(new Date(p.prochaineExecution), selectedDate))
    : [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-violet-400" />
              Planning de Maintenance
            </h2>
            <p className="text-muted-foreground mt-2">
              Calendrier des interventions préventives et correctives planifiées.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-white/[0.05]">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-white/[0.05]">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-32 text-center font-bold text-white capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </div>
            <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:bg-white/[0.05]">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" onClick={handleToday} className="ml-2 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30">
              Aujourd&apos;hui
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center text-xs text-muted-foreground font-medium px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          OT Préventif
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
          OT Correctif
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-violet-400"></div>
          Planifié (Non généré)
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border border-white/[0.06] bg-zinc-950/40 backdrop-blur-xl overflow-hidden rounded-2xl shadow-xl">
        <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.02]">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground/70 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr">
          {daysInMonth.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            
            const dayOTs = ots.filter((ot: any) => isSameDay(new Date(ot.datePrevue), day));
            const dayPlans = upcomingPlans.filter((p: any) => isSameDay(new Date(p.prochaineExecution), day));
            const totalEvents = dayOTs.length + dayPlans.length;

            return (
              <div 
                key={idx} 
                onClick={() => setSelectedDate(day)}
                className={`
                  min-h-[100px] p-2 border-b border-r border-white/[0.04] cursor-pointer transition-colors
                  hover:bg-white/[0.03] flex flex-col gap-1.5
                  ${!isCurrentMonth ? 'opacity-40 bg-black/20' : ''}
                  ${idx % 7 === 6 ? 'border-r-0' : ''} 
                  ${idx >= 35 ? 'border-b-0' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                    ${isTodayDate ? 'bg-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.6)]' : 'text-zinc-400'}
                  `}>
                    {format(day, 'd')}
                  </span>
                </div>
                
                <div className="flex-1 flex flex-wrap gap-1 content-start overflow-hidden">
                  {dayOTs.slice(0, 3).map((ot: any) => (
                    <div 
                      key={ot.id} 
                      title={ot.numeroOT}
                      className={`w-2 h-2 xl:w-auto xl:h-auto xl:px-1.5 xl:py-0.5 rounded-full text-[10px] font-bold truncate max-w-full
                        ${ot.typeMaintenance === 'PREVENTIVE' 
                          ? 'bg-emerald-500 xl:bg-emerald-500/20 xl:text-emerald-400' 
                          : 'bg-rose-500 xl:bg-rose-500/20 xl:text-rose-400'}
                      `}
                    >
                      <span className="hidden xl:inline">{ot.numeroOT}</span>
                    </div>
                  ))}
                  
                  {dayPlans.slice(0, Math.max(0, 3 - dayOTs.length)).map((p: any) => (
                    <div 
                      key={`p-${p.id}`} 
                      title={p.intitule}
                      className="w-2 h-2 xl:w-auto xl:h-auto xl:px-1.5 xl:py-0.5 rounded-full border border-dashed border-violet-400 text-[10px] text-violet-400 font-bold truncate max-w-full"
                    >
                      <span className="hidden xl:inline">Plan</span>
                    </div>
                  ))}
                  
                  {totalEvents > 3 && (
                    <div className="text-[10px] text-muted-foreground font-bold w-full text-center mt-0.5">
                      +{totalEvents - 3}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Details Modal */}
      <Modal 
        isOpen={!!selectedDate} 
        onClose={() => setSelectedDate(null)} 
        title={selectedDate ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr }) : ""}
      >
        <div className="space-y-6">
          {selectedDayOTs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Ordres de Travail ({selectedDayOTs.length})
              </h4>
              <div className="space-y-2">
                {selectedDayOTs.map((ot: any) => (
                  <div key={ot.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">{ot.numeroOT}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase
                        ${ot.typeMaintenance === 'PREVENTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}
                      `}>
                        {ot.typeMaintenance}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Cible: <span className="text-zinc-300 font-medium">{ot.poste?.nom}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Assigné à: <span className="text-zinc-300">{ot.technicien ? `${ot.technicien.prenom} ${ot.technicien.nom}` : 'Non assigné'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDayPlans.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border-2 border-dashed border-violet-400"></span>
                Planifiés / Non générés ({selectedDayPlans.length})
              </h4>
              <div className="space-y-2">
                {selectedDayPlans.map((plan: any) => (
                  <div key={plan.id} className="p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex flex-col gap-3">
                    <div>
                      <div className="font-bold text-white text-sm leading-tight">{plan.intitule}</div>
                      <div className="text-xs text-muted-foreground mt-1">Cible: {plan.poste?.nom}</div>
                    </div>
                    
                    {isAdminOrChef && (
                      <Button 
                        size="sm" 
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white"
                        onClick={() => handleGenerateNow(plan.id)}
                      >
                        <Play className="w-3.5 h-3.5 mr-2" />
                        Générer maintenant
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedDayOTs.length === 0 && selectedDayPlans.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Aucune intervention planifiée à cette date.
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
