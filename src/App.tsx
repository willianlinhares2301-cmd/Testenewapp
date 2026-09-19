import React, { useState, useEffect, useMemo } from 'react';
import { 
  DailyRecord, 
  FuelRecord, 
  MaintenanceRecord, 
  VehicleProfile 
} from './types';
import { 
  loadStoredData, 
  saveDailyRecords, 
  saveFuelRecords, 
  saveMaintenanceRecords, 
  saveVehicleProfile,
  getInitialDailyRecords,
  getInitialFuelRecords,
  getInitialMaintenanceRecords,
  getInitialVehicleProfile
} from './utils/storage';
import { Header } from './components/Header';
import { DailyEarningsView } from './components/DailyEarningsView';
import { FuelView } from './components/FuelView';
import { MaintenanceView } from './components/MaintenanceView';
import { MonthlyChartsView } from './components/MonthlyChartsView';
import { ExcelExportModal } from './components/ExcelExportModal';
import { VehicleSettingsModal } from './components/VehicleSettingsModal';

export default function App() {
  const [initialData] = useState(() => loadStoredData());
  const [dailyRecords, setDailyRecords] = useState<DailyRecord[]>(initialData.daily);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>(initialData.fuel);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>(initialData.maintenance);
  const [vehicleProfile, setVehicleProfile] = useState<VehicleProfile>(initialData.profile);

  const [activeTab, setActiveTab] = useState<string>('daily');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-09');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    saveDailyRecords(dailyRecords);
  }, [dailyRecords]);

  useEffect(() => {
    saveFuelRecords(fuelRecords);
  }, [fuelRecords]);

  useEffect(() => {
    saveMaintenanceRecords(maintenanceRecords);
  }, [maintenanceRecords]);

  useEffect(() => {
    saveVehicleProfile(vehicleProfile);
  }, [vehicleProfile]);

  // Extract all available months from records
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    dailyRecords.forEach(r => {
      if (r.date) monthsSet.add(r.date.substring(0, 7));
    });
    fuelRecords.forEach(r => {
      if (r.date) monthsSet.add(r.date.substring(0, 7));
    });
    maintenanceRecords.forEach(r => {
      if (r.date) monthsSet.add(r.date.substring(0, 7));
    });

    // Make sure current month or 2026-09 is included
    monthsSet.add('2026-09');
    return Array.from(monthsSet).sort().reverse();
  }, [dailyRecords, fuelRecords, maintenanceRecords]);

  // Highest recorded KM to suggest next KM
  const latestKm = useMemo(() => {
    let max = vehicleProfile.currentKm || 0;
    dailyRecords.forEach(r => {
      if (r.kmFinal && r.kmFinal > max) max = r.kmFinal;
    });
    fuelRecords.forEach(r => {
      if (r.km && r.km > max) max = r.km;
    });
    return max;
  }, [dailyRecords, fuelRecords, vehicleProfile.currentKm]);

  // Record Handlers: Daily
  const handleSaveDailyRecord = (record: DailyRecord) => {
    setDailyRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    // If record has a higher kmFinal, update current vehicle km automatically
    if (record.kmFinal && record.kmFinal > vehicleProfile.currentKm) {
      setVehicleProfile(p => ({ ...p, currentKm: record.kmFinal }));
    }
  };

  const handleDeleteDailyRecord = (id: string) => {
    setDailyRecords(prev => prev.filter(r => r.id !== id));
  };

  // Record Handlers: Fuel
  const handleSaveFuelRecord = (record: FuelRecord) => {
    setFuelRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    if (record.km && record.km > vehicleProfile.currentKm) {
      setVehicleProfile(p => ({ ...p, currentKm: record.km }));
    }
  };

  const handleDeleteFuelRecord = (id: string) => {
    setFuelRecords(prev => prev.filter(r => r.id !== id));
  };

  // Record Handlers: Maintenance
  const handleSaveMaintenanceRecord = (record: MaintenanceRecord) => {
    setMaintenanceRecords(prev => {
      const idx = prev.findIndex(r => r.id === record.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = record;
        return next;
      }
      return [record, ...prev];
    });

    if (record.km && record.km > vehicleProfile.currentKm) {
      setVehicleProfile(p => ({ ...p, currentKm: record.km }));
    }
  };

  const handleDeleteMaintenanceRecord = (id: string) => {
    setMaintenanceRecords(prev => prev.filter(r => r.id !== id));
  };

  // Reset to Demo Data
  const handleResetToDemo = () => {
    const d = getInitialDailyRecords();
    const f = getInitialFuelRecords();
    const m = getInitialMaintenanceRecords();
    const p = getInitialVehicleProfile();
    setDailyRecords(d);
    setFuelRecords(f);
    setMaintenanceRecords(m);
    setVehicleProfile(p);
  };

  // Clear all data
  const handleClearAll = () => {
    setDailyRecords([]);
    setFuelRecords([]);
    setMaintenanceRecords([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation & App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableMonths={availableMonths}
        vehicleProfile={vehicleProfile}
        onOpenVehicleModal={() => setIsVehicleModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'daily' && (
          <DailyEarningsView
            records={dailyRecords}
            onSaveRecord={handleSaveDailyRecord}
            onDeleteRecord={handleDeleteDailyRecord}
            selectedMonth={selectedMonth}
            defaultKmInitial={latestKm}
          />
        )}

        {activeTab === 'fuel' && (
          <FuelView
            records={fuelRecords}
            onSaveRecord={handleSaveFuelRecord}
            onDeleteRecord={handleDeleteFuelRecord}
            selectedMonth={selectedMonth}
            defaultKm={latestKm}
          />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceView
            records={maintenanceRecords}
            onSaveRecord={handleSaveMaintenanceRecord}
            onDeleteRecord={handleDeleteMaintenanceRecord}
            selectedMonth={selectedMonth}
            currentVehicleKm={latestKm}
          />
        )}

        {activeTab === 'charts' && (
          <MonthlyChartsView
            dailyRecords={dailyRecords}
            fuelRecords={fuelRecords}
            maintenanceRecords={maintenanceRecords}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            availableMonths={availableMonths}
            vehicleProfile={vehicleProfile}
            onOpenExportModal={() => setIsExportModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Controle de Ganhos & Custos • Cálculo Automático de Lucro Líquido</span>
          <span className="text-slate-600">Exportação nativa formatada em Microsoft Excel (.xlsx)</span>
        </div>
      </footer>

      {/* Modals */}
      <ExcelExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
        vehicleProfile={vehicleProfile}
        dailyRecords={dailyRecords}
        fuelRecords={fuelRecords}
        maintenanceRecords={maintenanceRecords}
      />

      <VehicleSettingsModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        profile={vehicleProfile}
        onSaveProfile={setVehicleProfile}
        onResetToDemoData={handleResetToDemo}
        onClearAllData={handleClearAll}
      />
    </div>
  );
}
