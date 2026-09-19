import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  X, 
  Download, 
  CheckCircle2, 
  Calendar, 
  Layers, 
  Table, 
  FileText,
  DollarSign,
  Fuel,
  Wrench
} from 'lucide-react';
import { DailyRecord, FuelRecord, MaintenanceRecord, VehicleProfile } from '../types';
import { exportDetailedExcelReport } from '../utils/excelExport';
import { formatMonthYear, formatCurrency } from '../utils/formatters';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  availableMonths: string[];
  vehicleProfile: VehicleProfile;
  dailyRecords: DailyRecord[];
  fuelRecords: FuelRecord[];
  maintenanceRecords: MaintenanceRecord[];
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  availableMonths,
  vehicleProfile,
  dailyRecords,
  fuelRecords,
  maintenanceRecords,
}) => {
  const [exportMonth, setExportMonth] = useState<string>(selectedMonth || 'all');
  const [isExporting, setIsExporting] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  if (!isOpen) return null;

  // Count items that will be exported in the selected filter
  const countDaily = exportMonth === 'all' 
    ? dailyRecords.length 
    : dailyRecords.filter(r => r.date.startsWith(exportMonth)).length;

  const countFuel = exportMonth === 'all' 
    ? fuelRecords.length 
    : fuelRecords.filter(r => r.date.startsWith(exportMonth)).length;

  const countMaint = exportMonth === 'all' 
    ? maintenanceRecords.length 
    : maintenanceRecords.filter(r => r.date.startsWith(exportMonth)).length;

  const handleExport = () => {
    setIsExporting(true);
    try {
      exportDetailedExcelReport({
        monthFilter: exportMonth,
        vehicleProfile,
        dailyRecords,
        fuelRecords,
        maintenanceRecords,
      });
      setExportedSuccess(true);
      setTimeout(() => {
        setExportedSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Erro ao exportar Excel:', err);
      alert('Ocorreu um erro ao gerar o arquivo Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Exportar Relatório Detalhado em Excel
            </h3>
            <p className="text-xs text-slate-400">
              Gere um arquivo .xlsx completo com múltiplas abas formatadas
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Period selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              Selecione o Período para Exportação:
            </label>
            <select
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Todo o Histórico (Todos os Meses)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthYear(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Worksheet preview list */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 space-y-2.5">
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              Abas inclusas na planilha Excel (.xlsx):
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 flex items-start space-x-2">
                <FileText className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">1. Resumo Geral</div>
                  <div className="text-[10px] text-slate-400">KPIs, faturamento dia/noite e margem</div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 flex items-start space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">2. Ganhos Diários</div>
                  <div className="text-[10px] text-slate-400">{countDaily} dia(s) com KM e lucro líquido</div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 flex items-start space-x-2">
                <Fuel className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">3. Abastecimentos</div>
                  <div className="text-[10px] text-slate-400">{countFuel} abastecimento(s), litros e R$/L</div>
                </div>
              </div>

              <div className="bg-slate-800 border border-slate-700/60 rounded-lg p-2.5 flex items-start space-x-2">
                <Wrench className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-200">4. Manutenções</div>
                  <div className="text-[10px] text-slate-400">{countMaint} serviço(s) e revisões preventivas</div>
                </div>
              </div>
            </div>
          </div>

          {/* Success badge */}
          {exportedSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Arquivo Excel gerado e baixado com sucesso no seu dispositivo!</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 flex items-center space-x-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Gerando Planilha...' : 'Baixar Planilha Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
