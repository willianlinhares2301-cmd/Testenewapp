import { DailyRecord, FuelRecord, MaintenanceRecord, VehicleProfile } from '../types';

const STORAGE_KEYS = {
  DAILY: 'app_ganhos_daily_records_v1',
  FUEL: 'app_ganhos_fuel_records_v1',
  MAINTENANCE: 'app_ganhos_maintenance_records_v1',
  PROFILE: 'app_ganhos_vehicle_profile_v1',
};

// Initial realistic demo data for the driver
export const getInitialVehicleProfile = (): VehicleProfile => ({
  name: 'Chevrolet Onix Plus 1.0 LTZ',
  plate: 'BRA-2E19',
  targetDailyProfit: 250,
  targetMonthlyProfit: 5500,
  currentKm: 68420,
});

export const getInitialDailyRecords = (): DailyRecord[] => {
  // Let's create realistic daily records for September 2026
  return [
    {
      id: 'd-1',
      date: '2026-09-12',
      earningsDay: 210.50,
      earningsNight: 165.00,
      kmInitial: 67950,
      kmFinal: 68115, // 165 km
      fuelCost: 65.00,
      otherCosts: 18.50,
      otherCostsDescription: 'Lanche e água',
      hoursWorkedDay: 5.5,
      hoursWorkedNight: 3.5,
      ridesCount: 19,
      notes: 'Bom movimento perto do centro empresarial',
    },
    {
      id: 'd-2',
      date: '2026-09-13',
      earningsDay: 180.00,
      earningsNight: 195.50,
      kmInitial: 68115,
      kmFinal: 68280, // 165 km
      fuelCost: 70.00,
      otherCosts: 12.00,
      otherCostsDescription: 'Pedágio rodovia',
      hoursWorkedDay: 4.5,
      hoursWorkedNight: 5.0,
      ridesCount: 21,
      notes: 'Noite com tarifa dinâmica em shows',
    },
    {
      id: 'd-3',
      date: '2026-09-14',
      earningsDay: 245.00,
      earningsNight: 140.00,
      kmInitial: 68280,
      kmFinal: 68445, // 165 km
      fuelCost: 68.00,
      otherCosts: 15.00,
      otherCostsDescription: 'Almoço prato feito',
      hoursWorkedDay: 6.0,
      hoursWorkedNight: 3.0,
      ridesCount: 22,
      notes: 'Dia chuvoso, muitas chamadas rápidas',
    },
    {
      id: 'd-4',
      date: '2026-09-15',
      earningsDay: 190.00,
      earningsNight: 230.00,
      kmInitial: 68445,
      kmFinal: 68630, // 185 km
      fuelCost: 78.00,
      otherCosts: 20.00,
      otherCostsDescription: 'Café e lanche da noite',
      hoursWorkedDay: 4.5,
      hoursWorkedNight: 5.5,
      ridesCount: 24,
      notes: 'Sexta-feira forte no turno da noite',
    },
    {
      id: 'd-5',
      date: '2026-09-16',
      earningsDay: 280.00,
      earningsNight: 275.00,
      kmInitial: 68630,
      kmFinal: 68860, // 230 km
      fuelCost: 95.00,
      otherCosts: 25.00,
      otherCostsDescription: 'Refeição e pedágio aeroporto',
      hoursWorkedDay: 6.5,
      hoursWorkedNight: 6.0,
      ridesCount: 31,
      notes: 'Sábado excelente, várias viagens para o aeroporto',
    },
    {
      id: 'd-6',
      date: '2026-09-17',
      earningsDay: 160.00,
      earningsNight: 110.00,
      kmInitial: 68860,
      kmFinal: 68980, // 120 km
      fuelCost: 50.00,
      otherCosts: 10.00,
      otherCostsDescription: 'Água e chiclete',
      hoursWorkedDay: 4.0,
      hoursWorkedNight: 2.5,
      ridesCount: 14,
      notes: 'Domingo mais tranquilo para descansar cedo',
    },
    {
      id: 'd-7',
      date: '2026-09-18',
      earningsDay: 225.00,
      earningsNight: 185.00,
      kmInitial: 68980,
      kmFinal: 69160, // 180 km
      fuelCost: 72.00,
      otherCosts: 16.00,
      otherCostsDescription: 'Almoço',
      hoursWorkedDay: 5.5,
      hoursWorkedNight: 4.0,
      ridesCount: 23,
      notes: 'Segunda-feira consistente',
    }
  ];
};

export const getInitialFuelRecords = (): FuelRecord[] => {
  return [
    {
      id: 'f-1',
      date: '2026-09-11',
      km: 67950,
      fuelType: 'gasolina_comum',
      liters: 42.5,
      pricePerLiter: 5.89,
      totalValue: 250.32,
      station: 'Posto Ipiranga Centro',
      fullTank: true,
      notes: 'Tanque cheio para iniciar a semana',
    },
    {
      id: 'f-2',
      date: '2026-09-14',
      km: 68445,
      fuelType: 'etanol',
      liters: 38.0,
      pricePerLiter: 3.99,
      totalValue: 151.62,
      station: 'Posto Shell Express',
      fullTank: true,
      notes: 'Etanol estava compensando no cálculo de 70%',
    },
    {
      id: 'f-3',
      date: '2026-09-17',
      km: 68980,
      fuelType: 'gasolina_aditivada',
      liters: 41.2,
      pricePerLiter: 6.09,
      totalValue: 250.90,
      station: 'Posto Petrobras BR Mania',
      fullTank: true,
      notes: 'Abastecido domingo à noite',
    }
  ];
};

export const getInitialMaintenanceRecords = (): MaintenanceRecord[] => {
  return [
    {
      id: 'm-1',
      date: '2026-09-02',
      km: 67200,
      category: 'oleo_filtro',
      description: 'Troca de Óleo sintético 5W30 + Filtro de óleo, ar e combustível',
      value: 290.00,
      workshop: 'Lubrax / Oficina do Marcos',
      nextMaintenanceKm: 77200,
      nextMaintenanceDate: '2027-03-02',
    },
    {
      id: 'm-2',
      date: '2026-09-08',
      km: 67600,
      category: 'pneus_alinhamento',
      description: 'Alinhamento 3D + Balanceamento 4 rodas + Rodízio de pneus',
      value: 140.00,
      workshop: 'Centro Automotivo PneuForte',
      nextMaintenanceKm: 77600,
    },
    {
      id: 'm-3',
      date: '2026-09-15',
      km: 68500,
      category: 'lavagem',
      description: 'Higienização interna completa e lavagem com cera',
      value: 80.00,
      workshop: 'Lava Rápido Estrela',
    }
  ];
};

export const loadStoredData = () => {
  try {
    const dailyRaw = localStorage.getItem(STORAGE_KEYS.DAILY);
    const fuelRaw = localStorage.getItem(STORAGE_KEYS.FUEL);
    const maintRaw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE);
    const profileRaw = localStorage.getItem(STORAGE_KEYS.PROFILE);

    return {
      daily: dailyRaw ? JSON.parse(dailyRaw) : getInitialDailyRecords(),
      fuel: fuelRaw ? JSON.parse(fuelRaw) : getInitialFuelRecords(),
      maintenance: maintRaw ? JSON.parse(maintRaw) : getInitialMaintenanceRecords(),
      profile: profileRaw ? JSON.parse(profileRaw) : getInitialVehicleProfile(),
    };
  } catch (err) {
    console.error('Erro ao ler do localStorage:', err);
    return {
      daily: getInitialDailyRecords(),
      fuel: getInitialFuelRecords(),
      maintenance: getInitialMaintenanceRecords(),
      profile: getInitialVehicleProfile(),
    };
  }
};

export const saveDailyRecords = (records: DailyRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY, JSON.stringify(records));
  } catch (err) {
    console.error('Erro ao salvar daily records:', err);
  }
};

export const saveFuelRecords = (records: FuelRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FUEL, JSON.stringify(records));
  } catch (err) {
    console.error('Erro ao salvar fuel records:', err);
  }
};

export const saveMaintenanceRecords = (records: MaintenanceRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
  } catch (err) {
    console.error('Erro ao salvar maintenance records:', err);
  }
};

export const saveVehicleProfile = (profile: VehicleProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar profile:', err);
  }
};
