import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Sun, 
  Moon, 
  Fuel, 
  Wrench, 
  Gauge, 
  Calendar,
  Percent,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { DailyRecord, FuelRecord, MaintenanceRecord, VehicleProfile } from '../types';
import { formatCurrency, formatNumber, formatDateBR, formatMonthYear } from '../utils/formatters';

interface MonthlyChartsViewProps {
  dailyRecords: DailyRecord[];
  fuelRecords: FuelRecord[];
  maintenanceRecords: MaintenanceRecord[];
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  availableMonths: string[];
  vehicleProfile: VehicleProfile;
  onOpenExportModal: () => void;
}

export const MonthlyChartsView: React.FC<MonthlyChartsViewProps> = ({
  dailyRecords,
  fuelRecords,
  maintenanceRecords,
  selectedMonth,
  setSelectedMonth,
  availableMonths,
  vehicleProfile,
  onOpenExportModal,
}) => {
  // Filter by month
  const filteredDaily = useMemo(() => {
    let list = dailyRecords;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyRecords, selectedMonth]);

  const filteredFuel = useMemo(() => {
    let list = fuelRecords;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [fuelRecords, selectedMonth]);

  const filteredMaint = useMemo(() => {
    let list = maintenanceRecords;
    if (selectedMonth && selectedMonth !== 'all') {
      list = list.filter(r => r.date.startsWith(selectedMonth));
    }
    return [...list].sort((a, b) => a.date.localeCompare(b.date));
  }, [maintenanceRecords, selectedMonth]);

  // Aggregate monthly stats
  const stats = useMemo(() => {
    const grossDay = filteredDaily.reduce((acc, r) => acc + (r.earningsDay || 0), 0);
    const grossNight = filteredDaily.reduce((acc, r) => acc + (r.earningsNight || 0), 0);
    const totalGross = grossDay + grossNight;

    const dailyFuel = filteredDaily.reduce((acc, r) => acc + (r.fuelCost || 0), 0);
    const actualFuelSpent = filteredFuel.reduce((acc, r) => acc + (r.totalValue || 0), 0);
    const otherCosts = filteredDaily.reduce((acc, r) => acc + (r.otherCosts || 0), 0);
    const maintenanceCost = filteredMaint.reduce((acc, r) => acc + (r.value || 0), 0);

    const totalKm = filteredDaily.reduce((acc, r) => {
      return acc + Math.max(0, (r.kmFinal || 0) - (r.kmInitial || 0));
    }, 0);

    // Operacional = Bruto - (Combustível diário + outros)
    const netProfitOperacional = totalGross - (dailyFuel + otherCosts);
    // Líquido Real = Descontando também manutenções de oficina
    const netProfitReal = netProfitOperacional - maintenanceCost;

    const profitMargin = totalGross > 0 ? (netProfitReal / totalGross) * 100 : 0;
    const grossPerKm = totalKm > 0 ? totalGross / totalKm : 0;
    const netPerKm = totalKm > 0 ? netProfitReal / totalKm : 0;

    return {
      grossDay,
      grossNight,
      totalGross,
      dailyFuel,
      actualFuelSpent,
      otherCosts,
      maintenanceCost,
      totalKm,
      netProfitOperacional,
      netProfitReal,
      profitMargin,
      grossPerKm,
      netPerKm,
      daysCount: filteredDaily.length,
    };
  }, [filteredDaily, filteredFuel, filteredMaint]);

  // Daily evolution chart data
  const dailyChartData = useMemo(() => {
    return filteredDaily.map((r) => {
      const gross = (r.earningsDay || 0) + (r.earningsNight || 0);
      const costs = (r.fuelCost || 0) + (r.otherCosts || 0);
      const net = gross - costs;
      const km = Math.max(0, (r.kmFinal || 0) - (r.kmInitial || 0));

      const [year, month, day] = r.date.split('-');
      return {
        dia: `${day}/${month}`,
        bruto: parseFloat(gross.toFixed(2)),
        gastos: parseFloat(costs.toFixed(2)),
        liquido: parseFloat(net.toFixed(2)),
        diaVal: parseFloat((r.earningsDay || 0).toFixed(2)),
        noiteVal: parseFloat((r.earningsNight || 0).toFixed(2)),
        km,
        lucroKm: km > 0 ? parseFloat((net / km).toFixed(2)) : 0,
      };
    });
  }, [filteredDaily]);

  // Expenses pie chart data
  const expensesPieData = useMemo(() => {
    const fuelVal = stats.actualFuelSpent > 0 ? stats.actualFuelSpent : stats.dailyFuel;
    const maintVal = stats.maintenanceCost;
    const otherVal = stats.otherCosts;

    return [
      { name: 'Combustível', value: fuelVal, color: '#f43f5e' },
      { name: 'Manutenção / Oficina', value: maintVal, color: '#f59e0b' },
      { name: 'Outros (Alimentação/Pedágio)', value: otherVal, color: '#8b5cf6' },
    ].filter(item => item.value > 0);
  }, [stats]);

  // Shift Day vs Night comparison pie
  const shiftPieData = useMemo(() => {
    return [
      { name: 'Turno Dia ☀️', value: stats.grossDay, color: '#f59e0b' },
      { name: 'Turno Noite 🌙', value: stats.grossNight, color: '#6366f1' },
    ].filter(item => item.value > 0);
  }, [stats]);

  const targetMonthly = vehicleProfile.targetMonthlyProfit || 5000;
  const targetProgress = Math.min(100, Math.max(0, (stats.netProfitReal / targetMonthly) * 100));

  return (
    <div className="space-y-6">
      {/* Header controls for Monthly Charts */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Painel de Desempenho & Gráficos Mensais
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Análise detalhada de faturamento, turnos dia/noite, gastos operacionais e lucro real do veículo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Visualizando:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-800 text-white">Todos os Meses (Consolidado)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m} className="bg-slate-800 text-white">
                  {formatMonthYear(m)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Monthly KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Faturamento Bruto */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white">
            {formatCurrency(stats.totalGross)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-amber-400">☀️ {formatCurrency(stats.grossDay)}</span>
            <span className="text-indigo-400">🌙 {formatCurrency(stats.grossNight)}</span>
          </div>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-slate-800/80 border border-emerald-500/40 rounded-2xl p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>Lucro Líquido Final</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-emerald-400">
            {formatCurrency(stats.netProfitReal)}
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            Margem Líquida: <strong className="text-emerald-300">{stats.profitMargin.toFixed(1)}%</strong>
          </div>
        </div>

        {/* Total Despesas (Combustível + Manutenção) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Gastos Totais</span>
            <Fuel className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-rose-400">
            {formatCurrency(stats.dailyFuel + stats.otherCosts + stats.maintenanceCost)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            Combustível: {formatCurrency(stats.dailyFuel)} | Manut: {formatCurrency(stats.maintenanceCost)}
          </div>
        </div>

        {/* KM Total & Eficiência */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>KM Total e Rendimento</span>
            <Gauge className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-white">
            {formatNumber(stats.totalKm, 0)} <span className="text-sm font-normal text-slate-400">km</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            Rendimento: <strong className="text-sky-300">{formatCurrency(stats.netPerKm)}</strong> líquido/km
          </div>
        </div>
      </div>

      {/* Meta Mensal Progress Bar */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 mb-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            Progresso da Meta Mensal de Lucro ({formatCurrency(targetMonthly)})
          </span>
          <span className="text-emerald-400 font-bold">
            {formatCurrency(stats.netProfitReal)} ({targetProgress.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700/80">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${targetProgress}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span>0%</span>
          <span>
            {stats.netProfitReal >= targetMonthly 
              ? '🎉 Parabéns! Meta mensal atingida!' 
              : `Faltam ${formatCurrency(Math.max(0, targetMonthly - stats.netProfitReal))} para bater a meta`}
          </span>
          <span>100%</span>
        </div>
      </div>

      {/* Chart 1: Evolução Diária no Mês (Faturamento Bruto x Custos x Lucro Líquido) */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700/70 gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Evolução Diária: Faturamento vs Custos vs Lucro Líquido
            </h3>
            <p className="text-xs text-slate-400">
              Acompanhe dia a dia o dinheiro que entra, os custos de rodagem e o lucro livre de cada jornada.
            </p>
          </div>
        </div>

        <div className="h-72 sm:h-80 mt-4 w-full">
          {dailyChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Sem dados para exibir no gráfico neste período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Bar dataKey="bruto" name="Faturamento Bruto" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gastos" name="Custos do Dia" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="liquido" name="Lucro Líquido" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row with 2 Charts: Comparativo Turno Dia vs Noite and Distribuição de Gastos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Comparativo Turno Dia (☀️) vs Noite (🌙) */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <Moon className="w-4 h-4 text-indigo-400" />
              Comparativo de Turnos: Dia vs Noite
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Descubra qual turno rende mais financeiramente na sua rotina.
            </p>
          </div>

          <div className="h-64 mt-4">
            {shiftPieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Sem registros de turnos dia/noite.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shiftPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      name && percent !== undefined ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {shiftPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Faturamento']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700/60 text-xs">
            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3">
              <div className="text-amber-300 font-semibold flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5" /> Turno Dia
              </div>
              <div className="text-base font-bold text-white mt-1">{formatCurrency(stats.grossDay)}</div>
              <div className="text-[10px] text-slate-400">
                {stats.totalGross > 0 ? `${((stats.grossDay / stats.totalGross) * 100).toFixed(1)}% do total` : '0%'}
              </div>
            </div>

            <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3">
              <div className="text-indigo-300 font-semibold flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" /> Turno Noite
              </div>
              <div className="text-base font-bold text-white mt-1">{formatCurrency(stats.grossNight)}</div>
              <div className="text-[10px] text-slate-400">
                {stats.totalGross > 0 ? `${((stats.grossNight / stats.totalGross) * 100).toFixed(1)}% do total` : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3: Distribuição de Despesas (Combustível vs Manutenção vs Outros) */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-rose-400" />
              Distribuição de Gastos do Período
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Veja para onde está indo seu dinheiro: combustível, manutenção de oficina ou outros custos.
            </p>
          </div>

          <div className="h-64 mt-4">
            {expensesPieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                Sem despesas registradas no período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: { name?: string; percent?: number }) => 
                      name && percent !== undefined ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {expensesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                    formatter={(value: any) => [formatCurrency(Number(value)), 'Total Gasto']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-xs">
            <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-2.5">
              <div className="text-rose-300 font-semibold truncate">Combustível</div>
              <div className="text-sm font-bold text-white mt-1">{formatCurrency(stats.dailyFuel)}</div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-2.5">
              <div className="text-amber-300 font-semibold truncate">Manutenção</div>
              <div className="text-sm font-bold text-white mt-1">{formatCurrency(stats.maintenanceCost)}</div>
            </div>

            <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-2.5">
              <div className="text-purple-300 font-semibold truncate">Outros</div>
              <div className="text-sm font-bold text-white mt-1">{formatCurrency(stats.otherCosts)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart 4: Eficiência e KM Rodados por Dia */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="pb-3 border-b border-slate-700/70">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Gauge className="w-4 h-4 text-sky-400" />
            Distância Rodada (KM) e Lucro Líquido por KM
          </h3>
          <p className="text-xs text-slate-400">
            Quilometragem percorrida a cada dia e o rendimento líquido gerado por cada quilômetro rodado.
          </p>
        </div>

        <div className="h-64 sm:h-72 mt-4">
          {dailyChartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-slate-500 text-sm">
              Sem dados para exibir no gráfico neste período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="dia" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#38bdf8" fontSize={11} tickFormatter={(v) => `${v}km`} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickFormatter={(v) => `R$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Line yAxisId="left" type="monotone" dataKey="km" name="KM Rodados" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
                <Line yAxisId="right" type="monotone" dataKey="lucroKm" name="Lucro Líquido / KM (R$)" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
