import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  Plus, 
  Calendar, 
  Gauge, 
  DollarSign, 
  Droplet, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  MapPin, 
  Zap,
  Sparkles,
  Info
} from 'lucide-react';
import { FuelRecord, FuelType } from '../types';
import { formatCurrency, formatNumber, formatDateBR, getFuelTypeName } from '../utils/formatters';

interface FuelViewProps {
  records: FuelRecord[];
  onSaveRecord: (record: FuelRecord) => void;
  onDeleteRecord: (id: string) => void;
  selectedMonth: string;
  defaultKm?: number;
}

export const FuelView: React.FC<FuelViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  selectedMonth,
  defaultKm = 0,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [km, setKm] = useState<string>(defaultKm ? defaultKm.toString() : '');
  const [fuelType, setFuelType] = useState<FuelType>('gasolina_comum');
  const [liters, setLiters] = useState<string>('');
  const [totalValue, setTotalValue] = useState<string>('');
  const [pricePerLiter, setPricePerLiter] = useState<string>('');
  const [station, setStation] = useState<string>('');
  const [fullTank, setFullTank] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // Auto calculate price per liter or total value
  const handleLitersChange = (val: string) => {
    setLiters(val);
    const numLiters = parseFloat(val);
    const numTotal = parseFloat(totalValue);
    if (numLiters > 0 && numTotal > 0) {
      setPricePerLiter((numTotal / numLiters).toFixed(3));
    } else if (numLiters > 0 && parseFloat(pricePerLiter) > 0) {
      setTotalValue((numLiters * parseFloat(pricePerLiter)).toFixed(2));
    }
  };

  const handleTotalValueChange = (val: string) => {
    setTotalValue(val);
    const numTotal = parseFloat(val);
    const numLiters = parseFloat(liters);
    if (numTotal > 0 && numLiters > 0) {
      setPricePerLiter((numTotal / numLiters).toFixed(3));
    }
  };

  const handlePricePerLiterChange = (val: string) => {
    setPricePerLiter(val);
    const numPrice = parseFloat(val);
    const numLiters = parseFloat(liters);
    if (numPrice > 0 && numLiters > 0) {
      setTotalValue((numPrice * numLiters).toFixed(2));
    }
  };

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    let list = records;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [records, selectedMonth]);

  // Compute fuel stats & km/L consumption
  const fuelStats = useMemo(() => {
    const totalSpent = filteredRecords.reduce((acc, r) => acc + (r.totalValue || 0), 0);
    const totalLiters = filteredRecords.reduce((acc, r) => acc + (r.liters || 0), 0);
    const avgPricePerLiter = totalLiters > 0 ? totalSpent / totalLiters : 0;

    // Calculate consumption between consecutive full tank entries
    // Sort all records chronologically
    const allSorted = [...records].sort((a, b) => a.km - b.km);
    const consumptions: number[] = [];

    for (let i = 1; i < allSorted.length; i++) {
      const prev = allSorted[i - 1];
      const curr = allSorted[i];
      if (curr.fullTank && prev.fullTank) {
        const kmDiff = curr.km - prev.km;
        if (kmDiff > 0 && curr.liters > 0) {
          consumptions.push(kmDiff / curr.liters);
        }
      }
    }

    const avgKmPerLiter = consumptions.length > 0 
      ? consumptions.reduce((a, b) => a + b, 0) / consumptions.length 
      : 0;

    return {
      totalSpent,
      totalLiters,
      avgPricePerLiter,
      avgKmPerLiter,
      count: filteredRecords.length,
    };
  }, [filteredRecords, records]);

  const handleStartEdit = (record: FuelRecord) => {
    setEditingId(record.id);
    setDate(record.date);
    setKm(record.km ? record.km.toString() : '');
    setFuelType(record.fuelType);
    setLiters(record.liters ? record.liters.toString() : '');
    setTotalValue(record.totalValue ? record.totalValue.toString() : '');
    setPricePerLiter(record.pricePerLiter ? record.pricePerLiter.toString() : '');
    setStation(record.station || '');
    setFullTank(record.fullTank);
    setNotes(record.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setDate(todayStr);
    // Suggest highest km from existing records
    if (records.length > 0) {
      const maxKm = Math.max(...records.map(r => r.km));
      setKm(maxKm.toString());
    } else {
      setKm(defaultKm ? defaultKm.toString() : '');
    }
    setFuelType('gasolina_comum');
    setLiters('');
    setTotalValue('');
    setPricePerLiter('');
    setStation('');
    setFullTank(true);
    setNotes('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numKm = parseFloat(km) || 0;
    const numLiters = parseFloat(liters) || 0;
    const numTotal = parseFloat(totalValue) || 0;
    const numPrice = parseFloat(pricePerLiter) || (numLiters > 0 ? numTotal / numLiters : 0);

    if (numLiters <= 0 || numTotal <= 0) {
      alert('Por favor, informe a quantidade de litros e o valor total pago.');
      return;
    }

    const newRecord: FuelRecord = {
      id: editingId || `fuel-${Date.now()}`,
      date,
      km: numKm,
      fuelType,
      liters: numLiters,
      totalValue: numTotal,
      pricePerLiter: numPrice,
      station: station.trim() || undefined,
      fullTank,
      notes: notes.trim() || undefined,
    };

    onSaveRecord(newRecord);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    handleResetForm();
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 border border-emerald-400">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="font-semibold text-sm">Abastecimento salvo no histórico!</span>
        </div>
      )}

      {/* Fuel KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Gasto no Mês */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Gastos com Combustível</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-400">
            {formatCurrency(fuelStats.totalSpent)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {fuelStats.count} abastecimento(s) no período
          </div>
        </div>

        {/* Total de Litros */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Litros Abastecidos</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Droplet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white">
            {formatNumber(fuelStats.totalLiters, 1)} <span className="text-sm font-normal text-slate-400">L</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Volume total colocado no tanque
          </div>
        </div>

        {/* Preço Médio / Litro */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Preço Médio / Litro</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-400">
            {formatCurrency(fuelStats.avgPricePerLiter)}
            <span className="text-xs text-slate-400 font-normal">/L</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Média ponderada paga por litro
          </div>
        </div>

        {/* Média de Consumo km/L */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Consumo Médio (Tanque Cheio)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-400">
            {fuelStats.avgKmPerLiter > 0 ? (
              <>
                {formatNumber(fuelStats.avgKmPerLiter, 1)}{' '}
                <span className="text-sm font-normal text-slate-300">km/L</span>
              </>
            ) : (
              <span className="text-sm text-slate-400 font-normal">Aguardando 2º tanque cheio</span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {fuelStats.avgKmPerLiter > 0 ? 'Eficiência calculada do veículo' : 'Marque "Tanque Cheio" para medir'}
          </div>
        </div>
      </div>

      {/* New Fuel Refill Form */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/70 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-sm font-bold">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Editar Abastecimento' : 'Novo Registro de Abastecimento'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Informe data, KM inicial/atual, combustível, valor e litros para controle e média de consumo.
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Data */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" />
                Data do Abastecimento *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* KM Atual / Hodômetro */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                KM Inicial / Hodômetro *
              </label>
              <input
                type="number"
                required
                step="1"
                placeholder="Ex: 68420"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Tipo de Combustível */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                Tipo de Combustível
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="gasolina_comum">Gasolina Comum</option>
                <option value="gasolina_aditivada">Gasolina Aditivada</option>
                <option value="etanol">Etanol (Álcool)</option>
                <option value="gnv">GNV (Gás Natural)</option>
                <option value="diesel">Diesel S10</option>
              </select>
            </div>

            {/* Posto / Bandeira */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Posto / Bandeira
              </label>
              <input
                type="text"
                placeholder="Ex: Ipiranga, Shell, BR"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Litros, Valor Total, Preço por Litro e Tanque Cheio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
            {/* Litros */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Litros Abastecidos *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 40.50"
                  value={liters}
                  onChange={(e) => handleLitersChange(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-rose-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-semibold">Litros</span>
              </div>
            </div>

            {/* Valor Total Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor Total Pago (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-rose-400 font-semibold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 235.00"
                  value={totalValue}
                  onChange={(e) => handleTotalValueChange(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            {/* Preço por Litro (calculado automaticamente ou inserido) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Preço por Litro</span>
                <span className="text-[10px] text-amber-400 font-normal">Auto-calculado</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-amber-400 font-semibold">R$</span>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Ex: 5.89"
                  value={pricePerLiter}
                  onChange={(e) => handlePricePerLiterChange(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Tanque Cheio Checkbox */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center space-x-2.5 p-2.5 bg-slate-900/90 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={fullTank}
                  onChange={(e) => setFullTank(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-600 bg-slate-800"
                />
                <span className="text-xs font-semibold text-slate-200">
                  Completou até o tanque cheio?
                </span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações
            </label>
            <input
              type="text"
              placeholder="Ex: Preço promocional do dia, pagamento em dinheiro com desconto"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-rose-950/40 hover:shadow-rose-900/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? 'Atualizar Abastecimento' : 'Salvar Abastecimento'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Fuel History Table */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-rose-400" />
              Histórico Detalhado de Abastecimentos
            </h3>
            <p className="text-xs text-slate-400">
              {filteredRecords.length} registro(s) {selectedMonth !== 'all' ? `no mês selecionado` : 'no total'}
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Fuel className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">Nenhum abastecimento registrado para este período.</p>
            <p className="text-xs text-slate-500 mt-1">Preencha o formulário acima para registrar seus abastecimentos!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700/80">
                  <th className="py-3 px-3 sm:px-4">Data</th>
                  <th className="py-3 px-3 sm:px-4">KM Inicial / Atual</th>
                  <th className="py-3 px-3 sm:px-4">Combustível</th>
                  <th className="py-3 px-3 sm:px-4">Litros</th>
                  <th className="py-3 px-3 sm:px-4">Valor Total</th>
                  <th className="py-3 px-3 sm:px-4">Preço/L</th>
                  <th className="py-3 px-3 sm:px-4">Tanque Cheio</th>
                  <th className="py-3 px-3 sm:px-4">Posto</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((fuel) => {
                  return (
                    <tr key={fuel.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-white whitespace-nowrap">
                        {formatDateBR(fuel.date)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-sky-300 font-mono font-bold">
                        {formatNumber(fuel.km, 0)} km
                      </td>

                      <td className="py-3.5 px-3 sm:px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {getFuelTypeName(fuel.fuelType)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-bold text-white">
                        {formatNumber(fuel.liters, 2)} L
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-bold text-rose-400 whitespace-nowrap">
                        {formatCurrency(fuel.totalValue)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300 font-mono">
                        {formatCurrency(fuel.pricePerLiter || (fuel.liters > 0 ? fuel.totalValue / fuel.liters : 0))}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4">
                        {fuel.fullTank ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Sim
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-700 text-slate-400">
                            Parcial
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300">
                        {fuel.station || '-'}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleStartEdit(fuel)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir o abastecimento de ${formatDateBR(fuel.date)}?`)) {
                                onDeleteRecord(fuel.id);
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
