import React from 'react';
import { PaymentRecord, RaffleConfig } from '../types';
import { formatCurrency, formatDate, maskName, maskPhone } from '../utils/formatters';
import { Receipt, DollarSign, Calendar, CreditCard, Hash, CheckCircle2, Shield } from 'lucide-react';

interface PaymentHistoryProps {
  payments: PaymentRecord[];
  config: RaffleConfig;
  isAdmin: boolean;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ payments, config, isAdmin }) => {
  const totalAmount = payments.reduce((acc, p) => acc + p.amount, 0);

  if (payments.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 p-12 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-purple-950 mb-1">
          No hay registros de pago aún
        </h3>
        <p className="text-xs text-purple-600 max-w-sm mx-auto">
          Los pagos confirmados por el administrador aparecerán listados aquí en orden cronológico.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Summary Box */}
      <div className="bg-gradient-to-r from-purple-800 to-pink-600 rounded-3xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight font-soft">Historial de Pagos Verificados</h3>
            <p className="text-xs text-purple-100">
              Total de transacciones confirmadas en el talonario
            </p>
          </div>
        </div>

        <div className="bg-white/15 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200 block">
            Total Recaudado ({payments.length} Boletas)
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono">
            {formatCurrency(totalAmount, config.currency, config.currencySymbol)}
          </span>
        </div>
      </div>

      {/* Privacy Notice in Participant Mode */}
      {!isAdmin && (
        <div className="px-5 py-2.5 bg-purple-100/90 rounded-2xl border border-purple-200 flex items-center justify-between text-xs text-purple-900 shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Los datos de contacto personales se encuentran anonimizados en la vista pública.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-200/70 px-2 py-0.5 rounded-full">
            Privacidad Activa
          </span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-purple-100/80 border-b border-purple-200 text-purple-900 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Boleta</th>
                <th className="py-3.5 px-4">Comprador</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">Medio de Pago</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Comprobante / Ref</th>
                <th className="py-3.5 px-4 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-100 text-purple-950">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-purple-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-black">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
                      #{payment.ticketNumber}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold uppercase">
                    {isAdmin ? payment.buyerName : maskName(payment.buyerName)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-purple-700">
                    {isAdmin ? payment.buyerPhone || '—' : maskPhone(payment.buyerPhone)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-pink-100 text-pink-800 border border-pink-200">
                      {payment.paymentMethod}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-purple-600 text-[11px]">
                    {formatDate(payment.date)}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-purple-700 text-[11px]">
                    {payment.referenceNumber || '—'}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-emerald-800">
                    {formatCurrency(payment.amount, config.currency, config.currencySymbol)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

