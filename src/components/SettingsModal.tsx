import React, { useState } from 'react';
import { X, Save, RotateCcw, AlertTriangle, Settings, Heart, HardDrive } from 'lucide-react';
import { RaffleConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RaffleConfig;
  onSaveConfig: (newConfig: RaffleConfig) => void;
  onResetAllData: () => void;
  onOpenGoogleDrive?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetAllData,
  onOpenGoogleDrive,
}) => {
  const [formData, setFormData] = useState<RaffleConfig>(config);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-soft">Configuración de la Rifa</h3>
              <p className="text-xs text-purple-100">Ajusta los parámetros generales del talonario</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-purple-200 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Nombre de la Rifa
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          {/* Prize */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Premio Mayor
            </label>
            <input
              type="text"
              required
              value={formData.prize}
              onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          {/* Ticket Price & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
                Valor por Boleta
              </label>
              <input
                type="number"
                min="0"
                step="500"
                required
                value={formData.ticketPrice}
                onChange={(e) => setFormData({ ...formData, ticketPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
                Moneda
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Bank / Payment accounts info */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Cuentas de Pago (Nequi / Daviplata / Llave)
            </label>
            <textarea
              rows={3}
              value={formData.bankInfo}
              onChange={(e) => setFormData({ ...formData, bankInfo: e.target.value })}
              className="w-full px-3 py-2 text-xs font-mono bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
            />
          </div>

          {/* Contact Phone & Organizer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={formData.contactPhone || ''}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
                Organizador(a)
              </label>
              <input
                type="text"
                value={formData.organizerName || ''}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Google Drive Integration */}
          {onOpenGoogleDrive && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-blue-950">Google Drive & Copias en la Nube</h4>
                  <p className="text-[10px] text-blue-700">Guarda respaldos automáticos y reportes en tu Drive</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleDrive();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold uppercase rounded-xl transition-colors shadow-xs shrink-0"
              >
                Abrir Drive
              </button>
            </div>
          )}

          {/* Reset System Danger Zone */}
          <div className="pt-4 border-t border-purple-100">
            {showResetConfirm ? (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>¿Reiniciar todos los 200 números?</span>
                </div>
                <p className="text-[11px] text-red-600">
                  Se restaurarán los números originales marcados en el talonario oficial del flyer.
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1 text-xs text-purple-700 hover:text-purple-950 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetAllData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 text-xs bg-red-600 text-white font-bold uppercase rounded-xl hover:bg-red-700"
                  >
                    Sí, Reiniciar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar números por defecto del talonario</span>
              </button>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-950 rounded-xl"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-purple-700/20 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
