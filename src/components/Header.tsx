import React, { useState } from 'react';
import { 
  DollarSign, 
  Sun, 
  Moon, 
  Gauge, 
  Fuel, 
  Wrench, 
  FileSpreadsheet, 
  Calendar,
  SlidersHorizontal,
  PlusCircle,
  TrendingUp,
  Car
} from 'lucide-react';
import { VehicleProfile } from '../types';
import { formatMonthYear } from '../utils/formatters';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  availableMonths: string[];
  vehicleProfile: VehicleProfile;
  onOpenVehicleModal: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  vehicleProfile,
  onOpenVehicleModal,
  onOpenExportModal,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-30">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Controle de Ganhos & Custos
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Driver Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestão financeira, turnos dia/noite, combustível, manutenção e relatórios Excel
              </p>
            </div>
          </div>

          {/* Quick Profile info on mobile */}
          <button
            onClick={onOpenVehicleModal}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-700/50"
            title="Configurar Veículo"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Global Controls: Month Selector + Vehicle info + Export Excel */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Month Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 hidden sm:inline">Mês:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-800 text-white">Todos os Meses</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-800 text-white">
                  {formatMonthYear(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle summary badge (desktop) */}
          <button
            onClick={onOpenVehicleModal}
            className="hidden md:flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors"
            title="Clique para editar veículo e metas"
          >
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-medium text-slate-200">{vehicleProfile.name || 'Meu Veículo'}</span>
            {vehicleProfile.plate && (
              <span className="bg-slate-700/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300 uppercase tracking-wider font-mono">
                {vehicleProfile.plate}
              </span>
            )}
          </button>

          {/* Excel Export Button */}
          <button
            id="btn-export-excel-header"
            onClick={onOpenExportModal}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs sm:text-sm shadow-md shadow-emerald-950/40 hover:shadow-emerald-900/50 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Exportar Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-800/80 text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('daily')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'daily'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Ganhos Diários (Dia/Noite)</span>
          </button>

          <button
            onClick={() => setActiveTab('fuel')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'fuel'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Abastecimento & Histórico</span>
          </button>

          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'maintenance'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Manutenção & Gastos</span>
          </button>

          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeTab === 'charts'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Gráficos Mensais & Métricas</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
