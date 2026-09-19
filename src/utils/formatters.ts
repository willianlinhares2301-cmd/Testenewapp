export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};

export const formatNumber = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0);
};

export const formatDateBR = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

export const formatMonthYear = (monthStr: string): string => {
  // monthStr: YYYY-MM
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const idx = parseInt(month, 10) - 1;
  return `${months[idx] || month} de ${year}`;
};

export const getFuelTypeName = (type: string): string => {
  switch (type) {
    case 'gasolina_comum':
      return 'Gasolina Comum';
    case 'gasolina_aditivada':
      return 'Gasolina Aditivada';
    case 'etanol':
      return 'Etanol (Álcool)';
    case 'gnv':
      return 'GNV';
    case 'diesel':
      return 'Diesel';
    default:
      return type;
  }
};

export const getMaintenanceCategoryName = (cat: string): string => {
  switch (cat) {
    case 'oleo_filtro':
      return 'Troca de Óleo e Filtros';
    case 'pneus_alinhamento':
      return 'Pneus, Alinhamento e Balanceamento';
    case 'freios':
      return 'Freios e Pastilhas';
    case 'suspensao':
      return 'Suspensão e Amortecedores';
    case 'mecanica_geral':
      return 'Mecânica Geral e Motor';
    case 'eletrica':
      return 'Elétrica e Bateria';
    case 'lavagem':
      return 'Lavagem e Higienização';
    case 'seguro_ipva':
      return 'Seguro, IPVA e Licenciamento';
    case 'outros':
      return 'Outros Gastos';
    default:
      return cat;
  }
};

export const getDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[date.getDay()] || '';
};
