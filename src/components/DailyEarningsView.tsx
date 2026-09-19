import React, { useState, useMemo } from 'react';
import { 
  Sun, 
  Moon, 
  Gauge, 
  Fuel, 
  DollarSign, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DailyRecord } from '../types';
import { formatCurrency, formatNumber, formatDateBR, getDayOfWeek } from '../utils/formatters';

interface DailyEarningsViewProps {
  records: DailyRecord[];
  onSaveRecord: (record: DailyRecord) => void;
  onDeleteRecord: (id: string) => void;
  selectedMonth: string;
  defaultKmInitial?: number;
}

export const DailyEarningsView: React.FC<DailyEarningsViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  selectedMonth,
  defaultKmInitial = 0,
}) => {
  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [earningsDay, setEarningsDay] = useState<string>('');
  const [earningsNight, setEarningsNight] = useState<string>('');
  const [kmInitial, setKmInitial] = useState<string>(defaultKmInitial ? defaultKmInitial.toString() : '');
  const [kmFinal, setKmFinal] = useState<string>('');
  const [fuelCost, setFuelCost] = useState<string>('');
  const [otherCosts, setOtherCosts] = useState<string>('');
  const [otherCostsDescription, setOtherCostsDescription] = useState<string>('');
  const [hoursWorkedDay, setHoursWorkedDay] = useState<string>('');
  const [hoursWorkedNight, setHoursWorkedNight] = useState<string>('');
  const [ridesCount, setRidesCount] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Auto-calculated fields for the form in real-time
  const numEarningsDay = parseFloat(earningsDay) || 0;
  const numEarningsNight = parseFloat(earningsNight) || 0;
  const numTotalGross = numEarningsDay + numEarningsNight;

  const numKmInitial = parseFloat(kmInitial) || 0;
  const numKmFinal = parseFloat(kmFinal) || 0;
  const numKmDriven = Math.max(0, numKmFinal - numKmInitial);

  const numFuelCost = parseFloat(fuelCost) || 0;
  const numOtherCosts = parseFloat(otherCosts) || 0;
  const numTotalCosts = numFuelCost + numOtherCosts;

  // CÁLCULO AUTOMÁTICO DE LUCRO LÍQUIDO DIÁRIO
  const numNetProfit = numTotalGross - numTotalCosts;
  const profitMargin = numTotalGross > 0 ? (numNetProfit / numTotalGross) * 100 : 0;
  const grossPerKm = numKmDriven > 0 ? numTotalGross / numKmDriven : 0;
  const netPerKm = numKmDriven > 0 ? numNetProfit / numKmDriven : 0;

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    let list = records;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [records, selectedMonth]);

  // Aggregate stats for filtered list
  const stats = useMemo(() => {
    const totalDay = filteredRecords.reduce((acc, r) => acc + (r.earningsDay || 0), 0);
    const totalNight = filteredRecords.reduce((acc, r) => acc + (r.earningsNight || 0), 0);
    const totalGross = totalDay + totalNight;
    const totalFuel = filteredRecords.reduce((acc, r) => acc + (r.fuelCost || 0), 0);
    const totalOthers = filteredRecords.reduce((acc, r) => acc + (r.otherCosts || 0), 0);
    const totalKm = filteredRecords.reduce((acc, r) => acc + Math.max(0, (r.kmFinal || 0) - (r.kmInitial || 0)), 0);
    const totalNet = totalGross - (totalFuel + totalOthers);
    const avgNetPerKm = totalKm > 0 ? totalNet / totalKm : 0;
    const avgDailyNet = filteredRecords.length > 0 ? totalNet / filteredRecords.length : 0;

    return {
      totalDay,
      totalNight,
      totalGross,
      totalFuel,
      totalOthers,
      totalKm,
      totalNet,
      avgNetPerKm,
      avgDailyNet,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Handle Edit
  const handleStartEdit = (record: DailyRecord) => {
    setEditingId(record.id);
    setDate(record.date);
    setEarningsDay(record.earningsDay ? record.earningsDay.toString() : '');
    setEarningsNight(record.earningsNight ? record.earningsNight.toString() : '');
    setKmInitial(record.kmInitial ? record.kmInitial.toString() : '');
    setKmFinal(record.kmFinal ? record.kmFinal.toString() : '');
    setFuelCost(record.fuelCost ? record.fuelCost.toString() : '');
    setOtherCosts(record.otherCosts ? record.otherCosts.toString() : '');
    setOtherCostsDescription(record.otherCostsDescription || '');
    setHoursWorkedDay(record.hoursWorkedDay ? record.hoursWorkedDay.toString() : '');
    setHoursWorkedNight(record.hoursWorkedNight ? record.hoursWorkedNight.toString() : '');
    setRidesCount(record.ridesCount ? record.ridesCount.toString() : '');
    setNotes(record.notes || '');

    // Scroll form into view
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setDate(todayStr);
    setEarningsDay('');
    setEarningsNight('');
    // Use last recorded kmFinal as new kmInitial if available
    if (records.length > 0) {
      const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
      if (sorted[0]?.kmFinal) {
        setKmInitial(sorted[0].kmFinal.toString());
      }
    }
    setKmFinal('');
    setFuelCost('');
    setOtherCosts('');
    setOtherCostsDescription('');
    setHoursWorkedDay('');
    setHoursWorkedNight('');
    setRidesCount('');
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      alert('Por favor, informe a data.');
      return;
    }

    if (numTotalGross === 0 && numKmDriven === 0) {
      alert('Por favor, informe ao menos os ganhos (dia ou noite) ou a quilometragem percorrida.');
      return;
    }

    if (numKmFinal > 0 && numKmInitial > 0 && numKmFinal < numKmInitial) {
      if (!confirm('Atenção: O KM Final é menor que o KM Inicial. Deseja salvar mesmo assim?')) {
        return;
      }
    }

    const newRecord: DailyRecord = {
      id: editingId || `daily-${Date.now()}`,
      date,
      earningsDay: numEarningsDay,
      earningsNight: numEarningsNight,
      kmInitial: numKmInitial,
      kmFinal: numKmFinal,
      fuelCost: numFuelCost,
      otherCosts: numOtherCosts,
      otherCostsDescription: otherCostsDescription.trim() || undefined,
      hoursWorkedDay: parseFloat(hoursWorkedDay) || undefined,
      hoursWorkedNight: parseFloat(hoursWorkedNight) || undefined,
      ridesCount: parseInt(ridesCount, 10) || undefined,
      notes: notes.trim() || undefined,
    };

    onSaveRecord(newRecord);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);

    // Prepare next day setup: new kmInitial = previous kmFinal
    const savedKmFinal = numKmFinal;
    handleResetForm();
    if (savedKmFinal > 0) {
      setKmInitial(savedKmFinal.toString());
    }
  };

  // Helper to auto-estimate fuel cost based on km driven (e.g. 11 km/L and R$ 5.90/L)
  const handleEstimateFuel = () => {
    if (numKmDriven <= 0) {
      alert('Informe primeiro o KM Inicial e KM Final para calcular os KM rodados.');
      return;
    }
    // Default estimated consumption: 11 km/L @ R$ 5.85 = ~R$ 0.53/km
    const estimated = (numKmDriven / 11) * 5.85;
    setFuelCost(estimated.toFixed(2));
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-semibold text-sm">Registro diário salvo com sucesso!</span>
        </div>
      )}

      {/* Stats Summary Cards for the Period */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Bruto */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faturamento Bruto</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white">
            {formatCurrency(stats.totalGross)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sun className="w-3 h-3 text-amber-400" /> {formatCurrency(stats.totalDay)}
            </span>
            <span className="flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-400" /> {formatCurrency(stats.totalNight)}
            </span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-slate-800/80 border border-emerald-500/30 rounded-xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400">Lucro Líquido Diário</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-400">
            {formatCurrency(stats.totalNet)}
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            Média: <span className="font-semibold text-white">{formatCurrency(stats.avgDailyNet)}</span>/dia ({stats.count} dias)
          </div>
        </div>

        {/* KM Rodados & Rendimento */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">KM Total Rodado</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white">
            {formatNumber(stats.totalKm, 0)} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            Rendimento: <span className="font-semibold text-emerald-400">{formatCurrency(stats.avgNetPerKm)}</span> líquido/km
          </div>
        </div>

        {/* Custos Operacionais */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Custos (Combustível + Outros)</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-400">
            {formatCurrency(stats.totalFuel + stats.totalOthers)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Combustível: {formatCurrency(stats.totalFuel)} | Outros: {formatCurrency(stats.totalOthers)}
          </div>
        </div>
      </div>

      {/* Main Form: Registro de Ganhos Dia / Noite + KM Inicial/Final + Cálculo Automático */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/70 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Editar Registro Diário' : 'Novo Registro de Ganhos e KM'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Informe os valores de Dia e Noite, KM inicial e final para o cálculo automático do lucro líquido.
            </p>
          </div>

          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg self-start sm:self-auto transition-colors"
            >
              Cancelar Edição
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Row 1: Data e Métricas Opcionais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                Data de Trabalho *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                Qtd. de Corridas / Entregas
              </label>
              <input
                type="number"
                min="0"
                placeholder="Ex: 24 viagens"
                value={ridesCount}
                onChange={(e) => setRidesCount(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Observação do Dia
              </label>
              <input
                type="text"
                placeholder="Ex: Chuva, dinâmica alta, aeroporto"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Turnos DIA e NOITE (Requested specifically by user) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Turno Dia */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-200">Ganhos Turno Dia (Diurno)</h3>
                    <p className="text-[11px] text-amber-300/70">Faturamento gerado no período da manhã e tarde</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">
                    Valor Bruto Dia (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-semibold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={earningsDay}
                      onChange={(e) => setEarningsDay(e.target.value)}
                      className="w-full bg-slate-900/90 border border-amber-500/40 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-amber-200/90 mb-1">
                    Horas Trabalhadas (Dia)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Ex: 5.5 h"
                    value={hoursWorkedDay}
                    onChange={(e) => setHoursWorkedDay(e.target.value)}
                    className="w-full bg-slate-900/90 border border-amber-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            {/* Turno Noite */}
            <div className="bg-indigo-950/25 border border-indigo-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-indigo-200">Ganhos Turno Noite (Noturno)</h3>
                    <p className="text-[11px] text-indigo-300/70">Faturamento gerado no período da noite e madrugada</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-indigo-200/90 mb-1">
                    Valor Bruto Noite (R$)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-indigo-400 font-semibold">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={earningsNight}
                      onChange={(e) => setEarningsNight(e.target.value)}
                      className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-indigo-200/90 mb-1">
                    Horas Trabalhadas (Noite)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="Ex: 4.0 h"
                    value={hoursWorkedNight}
                    onChange={(e) => setHoursWorkedNight(e.target.value)}
                    className="w-full bg-slate-900/90 border border-indigo-500/40 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: KM Inicial e KM Final (Automatic KM Rodados) */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Quilometragem Diária (Hodômetro)</h3>
              </div>
              <div className="text-xs text-sky-400 bg-sky-950/40 border border-sky-800/60 px-2.5 py-1 rounded-lg">
                KM Rodados: <strong className="text-white text-sm">{formatNumber(numKmDriven, 0)} km</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  KM Inicial do Dia
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="Ex: 68100"
                  value={kmInitial}
                  onChange={(e) => setKmInitial(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  KM Final do Dia
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder="Ex: 68290"
                  value={kmFinal}
                  onChange={(e) => setKmFinal(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-1 flex flex-col justify-end">
                <div className="bg-slate-800 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Distância Total:</span>
                  <span className="font-bold text-sky-300 text-sm">
                    {numKmDriven > 0 ? `+${formatNumber(numKmDriven, 0)} km percorridos` : 'Informe Inicial e Final'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Gastos do Dia (Combustível e Outros Custos) */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Fuel className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Despesas e Custos do Dia</h3>
              </div>
              <button
                type="button"
                onClick={handleEstimateFuel}
                className="text-[11px] text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="Calcula custo estimado com base no KM rodado (11 km/L a R$ 5,85)"
              >
                <Sparkles className="w-3 h-3" />
                Estimar Combustível p/ KM
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Combustível do Dia (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-rose-400 font-semibold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={fuelCost}
                    onChange={(e) => setFuelCost(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Outros Gastos (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-rose-400 font-semibold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={otherCosts}
                    onChange={(e) => setOtherCosts(e.target.value)}
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Descrição dos Outros Gastos
                </label>
                <input
                  type="text"
                  placeholder="Ex: Almoço, pedágio, taxa..."
                  value={otherCostsDescription}
                  onChange={(e) => setOtherCostsDescription(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Destaque em Tempo Real: CÁLCULO AUTOMÁTICO DE LUCRO LÍQUIDO DIÁRIO */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Cálculo Automático de Lucro Líquido Diário
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className={`text-2xl sm:text-3xl font-extrabold ${numNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatCurrency(numNetProfit)}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    (Lucro Líquido livre)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Bruto: <span className="text-white font-semibold">{formatCurrency(numTotalGross)}</span> (Dia: {formatCurrency(numEarningsDay)} + Noite: {formatCurrency(numEarningsNight)})
                  {' '}— Custos: <span className="text-rose-300 font-semibold">{formatCurrency(numTotalCosts)}</span>
                </p>
              </div>

              {/* Real-time KPIs */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-right">
                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-400">Margem Líquida</div>
                  <div className={`text-sm font-bold ${profitMargin >= 50 ? 'text-emerald-400' : profitMargin > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {profitMargin.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2">
                  <div className="text-[10px] text-slate-400">Líquido / KM</div>
                  <div className="text-sm font-bold text-sky-400">
                    {formatCurrency(netPerKm)}/km
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? 'Atualizar Registro Diário' : 'Salvar Registro Diário'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Daily Records List / Table */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Histórico de Ganhos e Lucro Diário
            </h3>
            <p className="text-xs text-slate-400">
              {filteredRecords.length} registro(s) {selectedMonth !== 'all' ? `no mês selecionado` : 'no total'}
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Calendar className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">Nenhum registro encontrado para este período.</p>
            <p className="text-xs text-slate-500 mt-1">Preencha o formulário acima para registrar seu primeiro dia de trabalho!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700/80">
                  <th className="py-3 px-3 sm:px-4">Data</th>
                  <th className="py-3 px-3 sm:px-4">Turno Dia ☀️</th>
                  <th className="py-3 px-3 sm:px-4">Turno Noite 🌙</th>
                  <th className="py-3 px-3 sm:px-4">Total Bruto</th>
                  <th className="py-3 px-3 sm:px-4">KM Rodados</th>
                  <th className="py-3 px-3 sm:px-4">Combustível</th>
                  <th className="py-3 px-3 sm:px-4">Outros</th>
                  <th className="py-3 px-3 sm:px-4 text-emerald-400 font-bold">Lucro Líquido</th>
                  <th className="py-3 px-3 sm:px-4">R$/KM</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((r) => {
                  const gross = (r.earningsDay || 0) + (r.earningsNight || 0);
                  const kmDriven = Math.max(0, (r.kmFinal || 0) - (r.kmInitial || 0));
                  const net = gross - ((r.fuelCost || 0) + (r.otherCosts || 0));
                  const netPerKmValue = kmDriven > 0 ? net / kmDriven : 0;

                  return (
                    <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-3 sm:px-4">
                        <div className="font-bold text-white whitespace-nowrap">
                          {formatDateBR(r.date)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {getDayOfWeek(r.date)} {r.ridesCount ? `• ${r.ridesCount} corridas` : ''}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-amber-300">
                        {formatCurrency(r.earningsDay || 0)}
                        {r.hoursWorkedDay ? (
                          <span className="block text-[10px] text-slate-400">{r.hoursWorkedDay}h</span>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-indigo-300">
                        {formatCurrency(r.earningsNight || 0)}
                        {r.hoursWorkedNight ? (
                          <span className="block text-[10px] text-slate-400">{r.hoursWorkedNight}h</span>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-bold text-white whitespace-nowrap">
                        {formatCurrency(gross)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300 font-mono">
                        <span className="font-semibold text-sky-400">{formatNumber(kmDriven, 0)} km</span>
                        <div className="text-[10px] text-slate-400">
                          {r.kmInitial} → {r.kmFinal}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-rose-300">
                        {formatCurrency(r.fuelCost || 0)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300">
                        {formatCurrency(r.otherCosts || 0)}
                        {r.otherCostsDescription ? (
                          <span className="block text-[10px] text-slate-400 truncate max-w-[100px]" title={r.otherCostsDescription}>
                            {r.otherCostsDescription}
                          </span>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          net >= 0 
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {formatCurrency(net)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300 font-mono text-xs whitespace-nowrap">
                        {formatCurrency(netPerKmValue)}/km
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleStartEdit(r)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir o registro de ${formatDateBR(r.date)}?`)) {
                                onDeleteRecord(r.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
