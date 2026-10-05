import React, { useState, useEffect } from 'react';
import { X, Check, Phone, User, MessageCircle, AlertCircle, Heart, Sparkles, CreditCard } from 'lucide-react';
import { RaffleConfig } from '../types';
import { formatCurrency, formatTicketNumber } from '../utils/formatters';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNumbers: number[];
  onConfirmReservation: (data: {
    numbers: number[];
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    notes?: string;
    sendWhatsApp: boolean;
  }) => void;
  config: RaffleConfig;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  selectedNumbers,
  onConfirmReservation,
  config,
}) => {
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (isOpen) {
      setBuyerName('');
      setBuyerPhone('');
      setBuyerEmail('');
      setNotes('');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen || selectedNumbers.length === 0) return null;

  const totalPrice = selectedNumbers.length * config.ticketPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; phone?: string } = {};

    if (!buyerName.trim()) {
      newErrors.name = 'Por favor ingresa tu nombre completo.';
    }
    if (!buyerPhone.trim() || buyerPhone.trim().length < 7) {
      newErrors.phone = 'Por favor ingresa un número de teléfono o WhatsApp válido.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onConfirmReservation({
      numbers: selectedNumbers,
      buyerName: buyerName.trim(),
      buyerPhone: buyerPhone.trim(),
      buyerEmail: buyerEmail.trim(),
      notes: notes.trim(),
      sendWhatsApp,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 via-purple-700 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-soft">Apartar Boleta(s)</h3>
              <p className="text-xs text-purple-100">
                Completa tus datos para apartar tus números de la Rifa Solidaria
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-200 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Numbers Pill display */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-700">
                Número(s) Seleccionado(s): ({selectedNumbers.length})
              </span>
              <span className="text-xs font-mono font-bold text-purple-900">
                Total: {formatCurrency(totalPrice, config.currency, config.currencySymbol)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {selectedNumbers.map((num) => (
                <span
                  key={num}
                  className="px-2.5 py-1 bg-purple-700 text-white font-mono font-bold text-xs rounded-lg shadow-xs"
                >
                  #{formatTicketNumber(num)}
                </span>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Nombre Completo <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={buyerName}
                onChange={(e) => {
                  setBuyerName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                placeholder="Ej. Carlos Ruiz Mendoza"
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-purple-50/60 border rounded-xl text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-purple-600 focus:bg-white ${
                  errors.name ? 'border-red-500' : 'border-purple-200'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Teléfono / WhatsApp <span className="text-pink-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                value={buyerPhone}
                onChange={(e) => {
                  setBuyerPhone(e.target.value);
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder="Ej. 318 895 2423"
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-purple-50/60 border rounded-xl text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-purple-600 focus:bg-white ${
                  errors.phone ? 'border-red-500' : 'border-purple-200'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.phone}
              </p>
            )}
          </div>

          {/* Bank instructions and 24-hour limit reminder */}
          <div className="bg-purple-50/80 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-purple-950">
                <CreditCard className="w-3.5 h-3.5 text-pink-600" />
                <span>Cuentas para Pago:</span>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] flex items-center gap-1">
                ⏰ Plazo: 24 horas (1 día)
              </span>
            </div>
            <p className="text-[11px] text-purple-900 whitespace-pre-line font-mono font-medium">
              {config.bankInfo}
            </p>
            <div className="pt-1.5 border-t border-purple-200/60 text-[11px] text-purple-700 flex items-start gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Al apartar tu boleta, dispondrás de <strong>1 día (24 horas)</strong> para enviar el comprobante de pago. Si no se reporta el pago, el número quedará libre para otros participantes.
              </span>
            </div>
          </div>

          {/* WhatsApp redirect toggle */}
          {config.contactPhone && (
            <label className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl cursor-pointer">
              <input
                type="checkbox"
                checked={sendWhatsApp}
                onChange={(e) => setSendWhatsApp(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-emerald-900 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> Enviar comprobante por WhatsApp a Jimena
                </span>
                <span className="text-[11px] text-emerald-700 block mt-0.5">
                  Abre WhatsApp automáticamente con los datos de tu reserva para confirmar tu número con la X oficial.
                </span>
              </div>
            </label>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-700 hover:text-purple-950 hover:bg-purple-50 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Apartado ({formatCurrency(totalPrice, config.currency, config.currencySymbol)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
