import * as XLSX from 'xlsx';
import { DailyRecord, FuelRecord, MaintenanceRecord, VehicleProfile } from '../types';
import { formatDateBR, getDayOfWeek, getFuelTypeName, getMaintenanceCategoryName } from './formatters';

export interface ExportReportOptions {
  monthFilter?: string; // YYYY-MM or 'all'
  vehicleProfile?: VehicleProfile;
  dailyRecords: DailyRecord[];
  fuelRecords: FuelRecord[];
  maintenanceRecords: MaintenanceRecord[];
}

export const exportDetailedExcelReport = (options: ExportReportOptions) => {
  const { monthFilter, vehicleProfile, dailyRecords, fuelRecords, maintenanceRecords } = options;

  // Filter records by month if requested
  const filteredDaily = monthFilter && monthFilter !== 'all'
    ? dailyRecords.filter(r => r.date.startsWith(monthFilter))
    : dailyRecords;

  const filteredFuel = monthFilter && monthFilter !== 'all'
    ? fuelRecords.filter(r => r.date.startsWith(monthFilter))
    : fuelRecords;

  const filteredMaintenance = monthFilter && monthFilter !== 'all'
    ? maintenanceRecords.filter(r => r.date.startsWith(monthFilter))
    : maintenanceRecords;

  // Sort chronologically
  const sortedDaily = [...filteredDaily].sort((a, b) => a.date.localeCompare(b.date));
  const sortedFuel = [...filteredFuel].sort((a, b) => a.date.localeCompare(b.date));
  const sortedMaintenance = [...filteredMaintenance].sort((a, b) => a.date.localeCompare(b.date));

  // Compute summary totals
  const totalEarningsDay = sortedDaily.reduce((acc, r) => acc + (r.earningsDay || 0), 0);
  const totalEarningsNight = sortedDaily.reduce((acc, r) => acc + (r.earningsNight || 0), 0);
  const totalGrossEarnings = totalEarningsDay + totalEarningsNight;
  
  const totalDailyFuelCost = sortedDaily.reduce((acc, r) => acc + (r.fuelCost || 0), 0);
  const totalActualFuelSpent = sortedFuel.reduce((acc, r) => acc + (r.totalValue || 0), 0);
  const totalOtherCosts = sortedDaily.reduce((acc, r) => acc + (r.otherCosts || 0), 0);
  const totalMaintenanceCost = sortedMaintenance.reduce((acc, r) => acc + (r.value || 0), 0);

  const totalKmDriven = sortedDaily.reduce((acc, r) => {
    const km = Math.max(0, (r.kmFinal || 0) - (r.kmInitial || 0));
    return acc + km;
  }, 0);

  const totalNetProfit = totalGrossEarnings - (totalDailyFuelCost + totalOtherCosts);
  const totalNetProfitAfterMaintenance = totalNetProfit - totalMaintenanceCost;

  const avgGrossPerKm = totalKmDriven > 0 ? totalGrossEarnings / totalKmDriven : 0;
  const avgNetProfitPerKm = totalKmDriven > 0 ? totalNetProfit / totalKmDriven : 0;
  const totalLitersFuel = sortedFuel.reduce((acc, r) => acc + (r.liters || 0), 0);

  const daysWorked = sortedDaily.length;
  const avgDailyProfit = daysWorked > 0 ? totalNetProfit / daysWorked : 0;

  // Create new workbook
  const workbook = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // Sheet 1: RESUMO DO MÊS / EXECUTIVO
  // -------------------------------------------------------------
  const periodLabel = monthFilter && monthFilter !== 'all' 
    ? `Mês: ${monthFilter.split('-')[1]}/${monthFilter.split('-')[0]}` 
    : 'Período Completo (Todos os Registros)';

  const summaryData = [
    ['RELATÓRIO FINANCEIRO E OPERACIONAL DE GANHOS E CUSTOS'],
    ['Veículo:', vehicleProfile?.name || 'Não informado', 'Placa:', vehicleProfile?.plate || 'Não informada'],
    ['Período:', periodLabel, 'Gerado em:', new Date().toLocaleString('pt-BR')],
    [''],
    ['INDICADOR OPERACIONAL', 'VALOR / QUANTIDADE', 'OBSERVAÇÃO'],
    ['Dias Trabalhados', daysWorked, 'Total de dias com registro'],
    ['KM Total Rodado', totalKmDriven, 'Km calculados (KM Final - KM Inicial)'],
    [''],
    ['RESUMO DE RECEITAS', 'VALOR (R$)', '% DO TOTAL'],
    ['Ganhos Turno Dia', totalEarningsDay, totalGrossEarnings > 0 ? `${((totalEarningsDay / totalGrossEarnings) * 100).toFixed(1)}%` : '0%'],
    ['Ganhos Turno Noite', totalEarningsNight, totalGrossEarnings > 0 ? `${((totalEarningsNight / totalGrossEarnings) * 100).toFixed(1)}%` : '0%'],
    ['FATURAMENTO BRUTO TOTAL', totalGrossEarnings, '100%'],
    [''],
    ['RESUMO DE CUSTOS E DESPESAS', 'VALOR (R$)', '% DA RECEITA'],
    ['Combustível Diário Atribuído', totalDailyFuelCost, totalGrossEarnings > 0 ? `${((totalDailyFuelCost / totalGrossEarnings) * 100).toFixed(1)}%` : '0%'],
    ['Outros Gastos Diários (Pedágio, Refeição, etc.)', totalOtherCosts, totalGrossEarnings > 0 ? `${((totalOtherCosts / totalGrossEarnings) * 100).toFixed(1)}%` : '0%'],
    ['Abastecimentos Reais Efetivados no Período', totalActualFuelSpent, `${totalLitersFuel.toFixed(1)} Litros abastecidos`],
    ['Manutenção e Despesas de Oficina no Período', totalMaintenanceCost, `${sortedMaintenance.length} serviços realizados`],
    [''],
    ['RESULTADO LÍQUIDO', 'VALOR (R$)', 'MÉTRICA'],
    ['LUCRO LÍQUIDO OPERACIONAL DIÁRIO', totalNetProfit, `Média R$ ${avgDailyProfit.toFixed(2)} / dia`],
    ['LUCRO LÍQUIDO FINAL (DESCONTANDO MANUTENÇÃO)', totalNetProfitAfterMaintenance, 'Lucro livre real'],
    ['Margem de Lucro Operacional', totalGrossEarnings > 0 ? `${((totalNetProfit / totalGrossEarnings) * 100).toFixed(1)}%` : '0%', 'Lucro / Faturamento'],
    [''],
    ['EFICIÊNCIA POR QUILÔMETRO (KM)', 'VALOR', 'MÉTRICA'],
    ['Faturamento Bruto por KM', `R$ ${avgGrossPerKm.toFixed(2)} / km`, 'R$ Bruto / KM rodado'],
    ['Lucro Líquido por KM', `R$ ${avgNetProfitPerKm.toFixed(2)} / km`, 'R$ Líquido / KM rodado'],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 45 }, { wch: 25 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo Geral');

  // -------------------------------------------------------------
  // Sheet 2: GANHOS DIÁRIOS
  // -------------------------------------------------------------
  const dailyHeaders = [
    'Data',
    'Dia Semana',
    'Ganhos Dia (R$)',
    'Ganhos Noite (R$)',
    'Faturamento Total (R$)',
    'KM Inicial',
    'KM Final',
    'KM Rodados',
    'Gasto Combustível (R$)',
    'Outros Gastos (R$)',
    'Desc. Outros Gastos',
    'Lucro Líquido (R$)',
    'Margem Lucro (%)',
    'R$/KM Bruto',
    'R$/KM Líquido',
    'Horas Dia',
    'Horas Noite',
    'Qtd Corridas',
    'Observações'
  ];

  const dailyRows = sortedDaily.map(record => {
    const gross = (record.earningsDay || 0) + (record.earningsNight || 0);
    const kmDriven = Math.max(0, (record.kmFinal || 0) - (record.kmInitial || 0));
    const net = gross - ((record.fuelCost || 0) + (record.otherCosts || 0));
    const margin = gross > 0 ? ((net / gross) * 100).toFixed(1) + '%' : '0%';
    const grossKm = kmDriven > 0 ? (gross / kmDriven).toFixed(2) : '0.00';
    const netKm = kmDriven > 0 ? (net / kmDriven).toFixed(2) : '0.00';

    return [
      formatDateBR(record.date),
      getDayOfWeek(record.date),
      record.earningsDay || 0,
      record.earningsNight || 0,
      gross,
      record.kmInitial || 0,
      record.kmFinal || 0,
      kmDriven,
      record.fuelCost || 0,
      record.otherCosts || 0,
      record.otherCostsDescription || '',
      net,
      margin,
      parseFloat(grossKm),
      parseFloat(netKm),
      record.hoursWorkedDay || 0,
      record.hoursWorkedNight || 0,
      record.ridesCount || 0,
      record.notes || ''
    ];
  });

  // Append Total Row for daily
  if (sortedDaily.length > 0) {
    dailyRows.push([
      'TOTAL DO PERÍODO',
      '',
      totalEarningsDay,
      totalEarningsNight,
      totalGrossEarnings,
      '-',
      '-',
      totalKmDriven,
      totalDailyFuelCost,
      totalOtherCosts,
      '',
      totalNetProfit,
      totalGrossEarnings > 0 ? `${((totalNetProfit / totalGrossEarnings) * 100).toFixed(1)}%` : '0%',
      parseFloat(avgGrossPerKm.toFixed(2)),
      parseFloat(avgNetProfitPerKm.toFixed(2)),
      sortedDaily.reduce((acc, r) => acc + (r.hoursWorkedDay || 0), 0),
      sortedDaily.reduce((acc, r) => acc + (r.hoursWorkedNight || 0), 0),
      sortedDaily.reduce((acc, r) => acc + (r.ridesCount || 0), 0),
      'Totais consolidados'
    ]);
  }

  const dailySheet = XLSX.utils.aoa_to_sheet([dailyHeaders, ...dailyRows]);
  dailySheet['!cols'] = [
    { wch: 12 }, // Data
    { wch: 12 }, // Dia Semana
    { wch: 16 }, // Ganhos Dia
    { wch: 18 }, // Ganhos Noite
    { wch: 22 }, // Total Bruto
    { wch: 12 }, // KM Inicial
    { wch: 12 }, // KM Final
    { wch: 14 }, // KM Rodados
    { wch: 22 }, // Combustível
    { wch: 18 }, // Outros Gastos
    { wch: 25 }, // Desc Outros
    { wch: 18 }, // Lucro Líquido
    { wch: 16 }, // Margem
    { wch: 14 }, // R$/KM Bruto
    { wch: 14 }, // R$/KM Líquido
    { wch: 12 }, // Horas Dia
    { wch: 12 }, // Horas Noite
    { wch: 14 }, // Corridas
    { wch: 30 }, // Obs
  ];
  XLSX.utils.book_append_sheet(workbook, dailySheet, 'Ganhos Diários');

  // -------------------------------------------------------------
  // Sheet 3: ABASTECIMENTOS
  // -------------------------------------------------------------
  const fuelHeaders = [
    'Data',
    'KM Inicial / Abastecimento',
    'Tipo Combustível',
    'Litros',
    'Valor Total (R$)',
    'Preço por Litro (R$)',
    'Tanque Cheio',
    'Posto / Bandeira',
    'Observações'
  ];

  const fuelRows = sortedFuel.map(fuel => [
    formatDateBR(fuel.date),
    fuel.km || 0,
    getFuelTypeName(fuel.fuelType),
    fuel.liters || 0,
    fuel.totalValue || 0,
    fuel.pricePerLiter || (fuel.liters > 0 ? parseFloat((fuel.totalValue / fuel.liters).toFixed(3)) : 0),
    fuel.fullTank ? 'Sim' : 'Não',
    fuel.station || '',
    fuel.notes || ''
  ]);

  if (sortedFuel.length > 0) {
    fuelRows.push([
      'TOTAL',
      '-',
      '-',
      totalLitersFuel,
      totalActualFuelSpent,
      totalLitersFuel > 0 ? parseFloat((totalActualFuelSpent / totalLitersFuel).toFixed(3)) : 0,
      '-',
      '',
      `${sortedFuel.length} abastecimentos registrados`
    ]);
  }

  const fuelSheet = XLSX.utils.aoa_to_sheet([fuelHeaders, ...fuelRows]);
  fuelSheet['!cols'] = [
    { wch: 14 }, // Data
    { wch: 25 }, // KM
    { wch: 20 }, // Tipo
    { wch: 14 }, // Litros
    { wch: 16 }, // Valor
    { wch: 20 }, // Preço/L
    { wch: 14 }, // Tanque cheio
    { wch: 22 }, // Posto
    { wch: 30 }, // Obs
  ];
  XLSX.utils.book_append_sheet(workbook, fuelSheet, 'Abastecimentos');

  // -------------------------------------------------------------
  // Sheet 4: MANUTENÇÕES E GASTOS
  // -------------------------------------------------------------
  const maintHeaders = [
    'Data',
    'KM do Veículo',
    'Categoria',
    'Descrição do Serviço / Peça',
    'Oficina / Estabelecimento',
    'Valor (R$)',
    'Próxima Revisão (KM)',
    'Próxima Revisão (Data)'
  ];

  const maintRows = sortedMaintenance.map(m => [
    formatDateBR(m.date),
    m.km || 0,
    getMaintenanceCategoryName(m.category),
    m.description || '',
    m.workshop || '',
    m.value || 0,
    m.nextMaintenanceKm || '-',
    m.nextMaintenanceDate ? formatDateBR(m.nextMaintenanceDate) : '-'
  ]);

  if (sortedMaintenance.length > 0) {
    maintRows.push([
      'TOTAL MANUTENÇÕES',
      '-',
      '-',
      `${sortedMaintenance.length} serviços realizados`,
      '',
      totalMaintenanceCost,
      '-',
      '-'
    ]);
  }

  const maintSheet = XLSX.utils.aoa_to_sheet([maintHeaders, ...maintRows]);
  maintSheet['!cols'] = [
    { wch: 14 }, // Data
    { wch: 16 }, // KM
    { wch: 32 }, // Categoria
    { wch: 35 }, // Descrição
    { wch: 25 }, // Oficina
    { wch: 16 }, // Valor
    { wch: 22 }, // Próxima KM
    { wch: 22 }, // Próxima Data
  ];
  XLSX.utils.book_append_sheet(workbook, maintSheet, 'Manutenções e Gastos');

  // Generate file name
  const monthFileName = monthFilter && monthFilter !== 'all' ? monthFilter : 'completo';
  const fileName = `Relatorio_Ganhos_Custos_${monthFileName}.xlsx`;

  // Write file to download
  XLSX.writeFile(workbook, fileName);
};
