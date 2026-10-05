import React from 'react';
import { Ticket, RaffleConfig } from '../types';
import {
  formatCurrency,
  formatDate,
  formatTicketNumber,
  getTimeRemaining,
  maskName,
  maskPhone,
} from '../utils/formatters';
import { SearchX, Phone, CheckCircle2, Clock, Eye, ShieldCheck, Printer, X, Shield } from 'lucide-react';

interface ParticipantsTableProps {
  tickets: Ticket[];
  config: RaffleConfig;
  isAdmin: boolean;
  onTicketClick: (ticket: Ticket) => void;
  onOpenPaymentModal: (ticket: Ticket) => void;
  onOpenReceiptModal: (ticket: Ticket) => void;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  tickets,
  config,
  isAdmin,
  onTicketClick,
  onOpenPaymentModal,
  onOpenReceiptModal,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 p-12 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-purple-950 mb-1">
          No hay boletas para mostrar
        </h3>
        <p className="text-xs text-purple-600 max-w-sm mx-auto">
          Prueba cambiando el término de búsqueda o los filtros superiores.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 shadow-xl overflow-hidden space-y-0">
      {/* Privacy Notice Header in Participant Mode */}
      {!isAdmin && (
        <div className="px-5 py-2.5 bg-purple-100/90 border-b border-purple-200 flex items-center justify-between text-xs text-purple-900">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <span>Vista de Participante: Nombres y teléfonos de otros compradores protegidos por privacidad.</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-200/70 px-2 py-0.5 rounded-full">
            Modo Privado
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-purple-100/80 border-b border-purple-200 text-purple-900 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4"># Boleta</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Participante</th>
              <th className="py-3.5 px-4">Teléfono</th>
              <th className="py-3.5 px-4">Medio de Pago</th>
              <th className="py-3.5 px-4 text-right">Valor</th>
              <th className="py-3.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100 text-purple-950">
            {tickets.map((t) => {
              const isAvailable = t.status === 'disponible';
              const isReserved = t.status === 'reservado';
              const isPaid = t.status === 'pagado';
              const timeInfo = isReserved ? getTimeRemaining(t.expiresAt, t.reservedAt, 24) : null;

              return (
                <tr
                  key={t.number}
                  className="hover:bg-purple-50/70 transition-colors cursor-pointer"
                  onClick={() => onTicketClick(t)}
                >
                  {/* Ticket Number */}
                  <td className="py-3.5 px-4 font-mono font-black text-sm">
                    <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
                      #{t.number}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                        <X className="w-3 h-3 stroke-[3]" />
                        Marcada (Pagada)
                      </span>
                    ) : isReserved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Apartada ({timeInfo?.isExpired ? 'Vencida' : `${timeInfo?.hoursLeft}h`})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Libre
                      </span>
                    )}
                  </td>

                  {/* Buyer Name (Masked if not Admin) */}
                  <td className="py-3.5 px-4 font-bold uppercase">
                    {isAvailable ? (
                      <span className="text-purple-300 font-normal italic">Sin asignar</span>
                    ) : isAdmin ? (
                      t.buyerName || 'Sin asignar'
                    ) : (
                      <span className="text-purple-800 tracking-wide">{maskName(t.buyerName)}</span>
                    )}
                  </td>

                  {/* Phone (Masked if not Admin) */}
                  <td className="py-3.5 px-4 font-mono text-purple-700">
                    {isAvailable ? '—' : isAdmin ? t.buyerPhone || '—' : maskPhone(t.buyerPhone)}
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 px-4 font-bold text-pink-700">
                    {t.paymentMethod || (isPaid ? 'Nequi' : '—')}
                  </td>

                  {/* Value */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    {formatCurrency(t.pricePaid || config.ticketPrice, config.currency, config.currencySymbol)}
                  </td>

                  {/* Actions */}
                  <td
                    className="py-3.5 px-4 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onTicketClick(t)}
                        className="p-1.5 text-purple-600 hover:text-purple-950 hover:bg-purple-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isPaid && isAdmin && (
                        <button
                          onClick={() => onOpenReceiptModal(t)}
                          className="p-1.5 text-purple-600 hover:text-purple-950 hover:bg-purple-100 rounded-lg transition-colors"
                          title="Imprimir comprobante"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      )}

                      {isReserved && isAdmin && (
                        <button
                          onClick={() => onOpenPaymentModal(t)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors"
                          title="Confirmar Pago y Marcar X"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>Marcar X</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

