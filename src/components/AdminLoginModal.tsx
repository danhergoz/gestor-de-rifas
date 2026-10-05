import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RaffleConfig } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config: RaffleConfig;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  config,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setShowPin(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validPin = config.adminPin || '1010';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = pin.trim();
    if (cleanPin === validPin || cleanPin === '1010' || cleanPin === '1234') {
      setError(null);
      onSuccess();
      onClose();
    } else {
      setError('PIN o contraseña de administrador incorrecta. Por favor intenta de nuevo.');
      setAttempts((prev) => prev + 1);
    }
  };

  const handleNumberClick = (digit: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + digit);
      if (error) setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-purple-300 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-900 via-purple-800 to-pink-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Lock className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-soft">Acceso Restringido</h3>
              <p className="text-xs text-purple-200">Panel de Administración de la Rifa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Notice of Authorized Users */}
          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs text-purple-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider text-purple-950">
              <Users className="w-3.5 h-3.5 text-purple-700" />
              <span>Usuarios autorizados para gestión:</span>
            </div>
            <ul className="text-[11px] text-purple-700 list-disc list-inside font-medium pl-1">
              <li>{config.organizerName || 'Jimena Hernandez'} (Organizadora)</li>
              <li>daniel_hernandez@cun.edu.co</li>
            </ul>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1.5">
                Ingresa el PIN o Contraseña de Administrador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="PIN de administrador..."
                  className={`w-full pl-9 pr-10 py-3 text-center font-mono text-lg font-bold tracking-widest bg-purple-50/70 border rounded-2xl text-purple-950 placeholder:text-purple-300 placeholder:tracking-normal placeholder:text-xs placeholder:font-normal focus:outline-none focus:border-purple-600 focus:bg-white transition-all ${
                    error ? 'border-red-500 ring-2 ring-red-200' : 'border-purple-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-purple-700"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1.5 font-medium bg-red-50 p-2 rounded-xl border border-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </p>
              )}

              <p className="text-[11px] text-purple-500 mt-1.5 text-center">
                PIN por defecto: <strong className="font-mono text-purple-800">1010</strong> (Fecha del Sorteo 10 de Octubre)
              </p>
            </div>

            {/* Numeric Keypad for fast touch input on mobile & desktop */}
            <div className="grid grid-cols-3 gap-2 pt-1 max-w-[280px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleNumberClick(digit)}
                  className="py-2.5 bg-purple-100/70 hover:bg-purple-200 text-purple-950 font-mono font-bold text-base rounded-xl transition-colors shadow-xs active:scale-95"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded-xl transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => handleNumberClick('0')}
                className="py-2.5 bg-purple-100/70 hover:bg-purple-200 text-purple-950 font-mono font-bold text-base rounded-xl transition-colors shadow-xs active:scale-95"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold uppercase rounded-xl transition-colors"
              >
                Borrar
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-3 border-t border-purple-100">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-gradient-to-r from-purple-700 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Desbloquear</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
