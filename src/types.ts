export type FuelType = 
  | 'gasolina_comum' 
  | 'gasolina_aditivada' 
  | 'etanol' 
  | 'gnv' 
  | 'diesel';

export type MaintenanceCategory = 
  | 'oleo_filtro' 
  | 'pneus_alinhamento' 
  | 'freios' 
  | 'suspensao' 
  | 'mecanica_geral' 
  | 'eletrica' 
  | 'lavagem' 
  | 'seguro_ipva' 
  | 'outros';

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  earningsDay: number; // R$ ganho turno dia
  earningsNight: number; // R$ ganho turno noite
  kmInitial: number; // KM inicial
  kmFinal: number; // KM final
  fuelCost: number; // Custo de combustível atribuído ao dia
  otherCosts: number; // Outros custos (alimentação, pedágio, etc.)
  otherCostsDescription?: string;
  hoursWorkedDay?: number; // Horas turno dia
  hoursWorkedNight?: number; // Horas turno noite
  ridesCount?: number; // Qtd corridas / viagens
  notes?: string;
}

export interface FuelRecord {
  id: string;
  date: string; // YYYY-MM-DD
  km: number; // KM no momento do abastecimento
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  totalValue: number;
  station?: string;
  fullTank: boolean;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  km: number;
  category: MaintenanceCategory;
  description: string;
  value: number;
  workshop?: string;
  nextMaintenanceKm?: number;
  nextMaintenanceDate?: string;
}

export interface VehicleProfile {
  name: string;
  plate: string;
  targetDailyProfit: number;
  targetMonthlyProfit: number;
  currentKm: number;
}
