import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Gauge, 
  Target, 
  CheckCircle2, 
  Trash2, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { VehicleProfile } from '../types';
import { formatCurrency } from '../utils/formatters';

interface VehicleSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: VehicleProfile;
  onSaveProfile: (profile: VehicleProfile) => void;
  onResetToDemoData: () => void;
  onClearAllData: () => void;
}

export const VehicleSettingsModal: React.FC<VehicleSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  onResetToDemoData,
  onClearAllData,
}) => {
  const [name, setName] = useState(profile.name || '');
  const [plate, setPlate] = useState(profile.plate || '');
  const [targetDailyProfit, setTargetDailyProfit] = useState(
    profile.targetDailyProfit ? profile.targetDailyProfit.toString() : '250'
  );
  const [targetMonthlyProfit, setTargetMonthlyProfit] = useState(
    profile.targetMonthlyProfit ? profile.targetMonthlyProfit.toString() : '5500'
  );
  const [currentKm, setCurrentKm] = useState(
    profile.currentKm ? profile.currentKm.toString() : '68420'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Meu Veículo',
      plate: plate.trim().toUpperCase(),
      targetDailyProfit: parseFloat(targetDailyProfit) || 250,
      targetMonthlyProfit: parseFloat(targetMonthlyProfit) || 5000,
      currentKm: parseFloat(currentKm) || 0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Perfil do Veículo & Metas
            </h3>
            <p className="text-xs text-slate-400">
              Personalize o veículo, quilometragem e metas de lucro
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Modelo / Nome do Veículo
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Chevrolet Onix 1.0, HB20, Moto Fan 160"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Placa (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: BRA-2E19"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono uppercase focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                KM Atual no Painel
              </label>
              <input
                type="number"
                step="1"
                placeholder="Ex: 68420"
                value={currentKm}
                onChange={(e) => setCurrentKm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta Diária (R$)
              </label>
              <input
                type="number"
                step="10"
                placeholder="Ex: 250"
                value={targetDailyProfit}
                onChange={(e) => setTargetDailyProfit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Meta Mensal (R$)
              </label>
              <input
                type="number"
                step="100"
                placeholder="Ex: 5500"
                value={targetMonthlyProfit}
                onChange={(e) => setTargetMonthlyProfit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Danger zone / Data management */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] text-slate-400 font-semibold block">
              Gerenciamento de Dados Locais:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja recarregar os dados de exemplo pré-configurados?')) {
                    onResetToDemoData();
                    onClose();
                  }
                }}
                className="flex-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                <span>Recarregar Exemplo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja apagar TODOS os registros salvos?')) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="flex-1 py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Limpar Tudo</span>
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-sky-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
