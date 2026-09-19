import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  Gauge, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Car,
  PieChart as PieChartIcon
} from 'lucide-react';
import { MaintenanceRecord, MaintenanceCategory } from '../types';
import { formatCurrency, formatNumber, formatDateBR, getMaintenanceCategoryName } from '../utils/formatters';

interface MaintenanceViewProps {
  records: MaintenanceRecord[];
  onSaveRecord: (record: MaintenanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  selectedMonth: string;
  currentVehicleKm?: number;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  records,
  onSaveRecord,
  onDeleteRecord,
  selectedMonth,
  currentVehicleKm = 68420,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(todayStr);
  const [km, setKm] = useState<string>(currentVehicleKm ? currentVehicleKm.toString() : '');
  const [category, setCategory] = useState<MaintenanceCategory>('oleo_filtro');
  const [description, setDescription] = useState<string>('');
  const [value, setValue] = useState<string>('');
  const [workshop, setWorkshop] = useState<string>('');
  const [nextMaintenanceKm, setNextMaintenanceKm] = useState<string>('');
  const [nextMaintenanceDate, setNextMaintenanceDate] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // Filter records by selected month
  const filteredRecords = useMemo(() => {
    let list = records;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [records, selectedMonth]);

  // Aggregate monthly stats & categories
  const stats = useMemo(() => {
    const totalSpent = filteredRecords.reduce((acc, r) => acc + (r.value || 0), 0);
    const categoryTotals: Record<string, number> = {};

    filteredRecords.forEach((r) => {
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + (r.value || 0);
    });

    // Preventive alerts: check all records with nextMaintenanceKm
    const alerts: { record: MaintenanceRecord; kmRemaining: number; isOverdue: boolean }[] = [];
    records.forEach((r) => {
      if (r.nextMaintenanceKm && r.nextMaintenanceKm > 0) {
        const kmRemaining = r.nextMaintenanceKm - currentVehicleKm;
        alerts.push({
          record: r,
          kmRemaining,
          isOverdue: kmRemaining <= 0,
        });
      }
    });

    // Sort alerts by urgency (lowest kmRemaining first)
    alerts.sort((a, b) => a.kmRemaining - b.kmRemaining);

    return {
      totalSpent,
      count: filteredRecords.length,
      categoryTotals,
      alerts,
    };
  }, [filteredRecords, records, currentVehicleKm]);

  const handleStartEdit = (record: MaintenanceRecord) => {
    setEditingId(record.id);
    setDate(record.date);
    setKm(record.km ? record.km.toString() : '');
    setCategory(record.category);
    setDescription(record.description);
    setValue(record.value ? record.value.toString() : '');
    setWorkshop(record.workshop || '');
    setNextMaintenanceKm(record.nextMaintenanceKm ? record.nextMaintenanceKm.toString() : '');
    setNextMaintenanceDate(record.nextMaintenanceDate || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setEditingId(null);
    setDate(todayStr);
    setKm(currentVehicleKm ? currentVehicleKm.toString() : '');
    setCategory('oleo_filtro');
    setDescription('');
    setValue('');
    setWorkshop('');
    setNextMaintenanceKm('');
    setNextMaintenanceDate('');
  };

  // Pre-fill next maintenance suggestion based on category
  const handleCategoryChange = (cat: MaintenanceCategory) => {
    setCategory(cat);
    const numKm = parseFloat(km) || currentVehicleKm || 0;
    if (cat === 'oleo_filtro' && numKm > 0) {
      setNextMaintenanceKm((numKm + 10000).toString());
      setDescription('Troca de Óleo e Filtros');
    } else if (cat === 'pneus_alinhamento' && numKm > 0) {
      setNextMaintenanceKm((numKm + 10000).toString());
      setDescription('Alinhamento e Balanceamento');
    } else if (cat === 'freios' && numKm > 0) {
      setNextMaintenanceKm((numKm + 25000).toString());
      setDescription('Troca de Pastilhas de Freio');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseFloat(value) || 0;
    const numKm = parseFloat(km) || 0;

    if (numValue <= 0) {
      alert('Por favor, informe o valor da manutenção ou gasto.');
      return;
    }

    if (!description.trim()) {
      alert('Por favor, informe a descrição da manutenção.');
      return;
    }

    const newRecord: MaintenanceRecord = {
      id: editingId || `maint-${Date.now()}`,
      date,
      km: numKm,
      category,
      description: description.trim(),
      value: numValue,
      workshop: workshop.trim() || undefined,
      nextMaintenanceKm: parseFloat(nextMaintenanceKm) || undefined,
      nextMaintenanceDate: nextMaintenanceDate || undefined,
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
          <span className="font-semibold text-sm">Manutenção registrada com sucesso!</span>
        </div>
      )}

      {/* Maintenance Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Gasto no Mês */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Manutenção no Período</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-400">
            {formatCurrency(stats.totalSpent)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {stats.count} serviço(s) realizado(s)
          </div>
        </div>

        {/* KM Atual do Veículo */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">KM Atual de Referência</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Gauge className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white">
            {formatNumber(currentVehicleKm, 0)} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Utilizado para alertas preventivos
          </div>
        </div>

        {/* Alertas Preventivos */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Revisões Preventivas</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-white">
            {stats.alerts.length > 0 ? (
              <span className={stats.alerts.some(a => a.isOverdue) ? 'text-rose-400' : 'text-emerald-400'}>
                {stats.alerts.length} agendada(s)
              </span>
            ) : (
              <span className="text-slate-400 text-sm">Nenhuma pendente</span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {stats.alerts.some(a => a.isOverdue) ? 'Atenção: existem revisões vencidas!' : 'Manutenções preventivas em dia'}
          </div>
        </div>
      </div>

      {/* Preventive Alerts Box if any exist */}
      {stats.alerts.length > 0 && (
        <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-lg">
          <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Quadro de Revisões Preventivas Programadas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {stats.alerts.slice(0, 3).map(({ record, kmRemaining, isOverdue }) => (
              <div 
                key={record.id} 
                className={`p-3 rounded-xl border text-xs ${
                  isOverdue 
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200' 
                    : kmRemaining < 1500 
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{getMaintenanceCategoryName(record.category)}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                    isOverdue ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {isOverdue ? 'Vencida!' : `${formatNumber(kmRemaining, 0)} km restantes`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Revisão prevista em: <strong className="text-white">{formatNumber(record.nextMaintenanceKm || 0, 0)} km</strong>
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  Última troca em {formatDateBR(record.date)} ({formatNumber(record.km, 0)} km)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Maintenance Form */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/70 gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
              {editingId ? 'Editar Manutenção / Despesa' : 'Novo Registro de Manutenção & Gastos'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cadastre trocas de óleo, pneus, freios, seguros, lavagens e programe a próxima revisão.
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
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Data da Manutenção *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* KM do Veículo */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                KM do Veículo *
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

            {/* Categoria */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                Categoria da Despesa
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as MaintenanceCategory)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              >
                <option value="oleo_filtro">Troca de Óleo e Filtros</option>
                <option value="pneus_alinhamento">Pneus, Alinhamento e Balanceamento</option>
                <option value="freios">Freios e Pastilhas</option>
                <option value="suspensao">Suspensão e Amortecedores</option>
                <option value="mecanica_geral">Mecânica Geral e Motor</option>
                <option value="eletrica">Elétrica e Bateria</option>
                <option value="lavagem">Lavagem e Higienização</option>
                <option value="seguro_ipva">Seguro, IPVA e Documentos</option>
                <option value="outros">Outros Gastos do Veículo</option>
              </select>
            </div>

            {/* Valor Pago */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Valor Total (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-amber-400 font-semibold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Descrição e Oficina */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descrição Detalhada do Serviço / Peças *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Troca de óleo sintético 5W30 + filtro de ar e combustível"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Oficina / Estabelecimento
              </label>
              <input
                type="text"
                placeholder="Ex: Centro Automotivo Lubrax, Mecânica do Zé"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Próxima Revisão Programada */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5">
            <div className="text-xs font-semibold text-sky-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              Previsão da Próxima Revisão (Preventiva)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Próxima Troca em KM
                </label>
                <input
                  type="number"
                  step="100"
                  placeholder="Ex: 78400 (revisar daqui a 10.000 km)"
                  value={nextMaintenanceKm}
                  onChange={(e) => setNextMaintenanceKm(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ou Próxima Data Prevista
                </label>
                <input
                  type="date"
                  value={nextMaintenanceDate}
                  onChange={(e) => setNextMaintenanceDate(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
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
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-lg shadow-amber-950/40 hover:shadow-amber-900/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingId ? 'Atualizar Manutenção' : 'Salvar Manutenção'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Maintenance History Table */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              Histórico de Manutenções & Despesas
            </h3>
            <p className="text-xs text-slate-400">
              {filteredRecords.length} registro(s) {selectedMonth !== 'all' ? `no mês selecionado` : 'no total'}
            </p>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Wrench className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-semibold text-slate-300">Nenhuma manutenção registrada para este período.</p>
            <p className="text-xs text-slate-500 mt-1">Registre manutenções preventivas e corretivas para acompanhar seus custos reais.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-700/80">
                  <th className="py-3 px-3 sm:px-4">Data</th>
                  <th className="py-3 px-3 sm:px-4">KM</th>
                  <th className="py-3 px-3 sm:px-4">Categoria</th>
                  <th className="py-3 px-3 sm:px-4">Descrição do Serviço</th>
                  <th className="py-3 px-3 sm:px-4">Oficina</th>
                  <th className="py-3 px-3 sm:px-4">Valor Total</th>
                  <th className="py-3 px-3 sm:px-4">Próxima Revisão</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((m) => {
                  return (
                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="py-3.5 px-3 sm:px-4 font-semibold text-white whitespace-nowrap">
                        {formatDateBR(m.date)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-sky-300 font-mono font-bold whitespace-nowrap">
                        {formatNumber(m.km, 0)} km
                      </td>

                      <td className="py-3.5 px-3 sm:px-4">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20 whitespace-nowrap">
                          {getMaintenanceCategoryName(m.category)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-200 font-medium max-w-[240px]">
                        {m.description}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-400">
                        {m.workshop || '-'}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 font-bold text-amber-400 whitespace-nowrap">
                        {formatCurrency(m.value)}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-slate-300 text-xs">
                        {m.nextMaintenanceKm ? (
                          <div className="font-mono text-sky-300">
                            {formatNumber(m.nextMaintenanceKm, 0)} km
                          </div>
                        ) : null}
                        {m.nextMaintenanceDate ? (
                          <div className="text-[11px] text-slate-400">
                            {formatDateBR(m.nextMaintenanceDate)}
                          </div>
                        ) : null}
                        {!m.nextMaintenanceKm && !m.nextMaintenanceDate && '-'}
                      </td>

                      <td className="py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleStartEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir a manutenção "${m.description}"?`)) {
                                onDeleteRecord(m.id);
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
