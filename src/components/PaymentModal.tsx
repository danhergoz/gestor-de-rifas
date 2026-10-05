import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, DollarSign, CreditCard, ShieldCheck, Heart } from 'lucide-react';
import { Ticket, RaffleConfig } from '../types';
import { formatCurrency, formatTicketNumber } from '../utils/formatters';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onConfirmPayment: (paymentData: {
    ticketNumber: number;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
  config: RaffleConfig;
}

const PAYMENT_METHODS = [
  'Nequi',
  'Daviplata',
  'Llave',
  'Efectivo',
  'Bancolombia',
  'Transferencia',
  'Otro',
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  ticket,
  onConfirmPayment,
  config,
}) => {
  const [amount, setAmount] = useState(config.ticketPrice);
  const [paymentMethod, setPaymentMethod] = useState('Nequi');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('Marcado con X en el talonario oficial');

  useEffect(() => {
    if (ticket) {
      setAmount(ticket.pricePaid || config.ticketPrice);
      setPaymentMethod(ticket.paymentMethod || 'Nequi');
      setReferenceNumber('');
      setNotes('Marcado con X en el talonario oficial');
    }
  }, [ticket, config]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPayment({
      ticketNumber: ticket.number,
      amount: Number(amount),
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-soft">Confirmar Pago de Boleta</h3>
              <p className="text-xs text-emerald-100">
                Marcar con X oficial en el talonario y registrar pago
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-100 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ticket & Buyer Summary Card */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-800 text-white rounded-2xl flex items-center justify-center font-mono font-black text-xl shadow-sm">
                #{ticket.number}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-purple-600 font-bold">Comprador</p>
                <p className="text-sm font-bold text-purple-950 uppercase leading-tight">
                  {ticket.buyerName || 'Sin nombre'}
                </p>
                <p className="text-xs text-purple-700 font-mono">
                  {ticket.buyerPhone || 'Sin teléfono'}
                </p>
              </div>
            </div>
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Monto Recibido ({config.currency})
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2.5 text-sm font-mono font-bold bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Medio de Pago
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-medium"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Comprobante / Referencia (Opcional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Ej. REF-31889 o Nequi M1234"
              className="w-full px-3.5 py-2 text-sm bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white font-mono placeholder:text-purple-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-purple-800 font-bold mb-1">
              Notas Administrativas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas del pago..."
              className="w-full px-3.5 py-2 text-xs bg-purple-50/60 border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-emerald-600 focus:bg-white placeholder:text-purple-400"
            />
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Pago Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
