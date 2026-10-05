import React from 'react';
import { Check, ShieldCheck, Clock, AlertTriangle } from 'lucide-react';
import { Ticket } from '../types';
import { getTimeRemaining } from '../utils/formatters';

interface TicketCardProps {
  ticket: Ticket;
  isSelected: boolean;
  isAdmin: boolean;
  onSelect: (num: number, e: React.MouseEvent) => void;
  onClick: (ticket: Ticket) => void;
  onQuickConfirmPayment?: (ticket: Ticket, e: React.MouseEvent) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  isSelected,
  isAdmin,
  onSelect,
  onClick,
  onQuickConfirmPayment,
}) => {
  const isAvailable = ticket.status === 'disponible';
  const isReserved = ticket.status === 'reservado';
  const isPaid = ticket.status === 'pagado';
  const isMarked = !isAvailable; // Marked with Red X in flyer

  // Calculate reservation expiration for reserved tickets
  const timeInfo = isReserved ? getTimeRemaining(ticket.expiresAt, ticket.reservedAt, 24) : null;

  return (
    <div
      id={`ticket-card-${ticket.number}`}
      onClick={() => onClick(ticket)}
      className={`group relative rounded-xl border transition-all duration-150 cursor-pointer flex flex-col items-center justify-center p-1.5 sm:p-2 min-h-[50px] sm:min-h-[60px] select-none ${
        isSelected
          ? 'bg-purple-100 border-purple-600 ring-2 ring-purple-500 shadow-md scale-105 z-10'
          : isPaid
          ? 'bg-red-50/40 border-red-200/70 hover:border-red-300 hover:bg-red-50'
          : isReserved
          ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 hover:bg-amber-100/50'
          : 'bg-white border-purple-200/80 hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-xs'
      }`}
    >
      {/* Selection checkbox indicator for available tickets */}
      {isAvailable && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onSelect(ticket.number, e);
          }}
          className={`absolute top-1 right-1 w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-purple-700 border-purple-700 text-white'
              : 'border-purple-200 bg-white/80 opacity-0 group-hover:opacity-100 hover:border-purple-400 text-transparent'
          }`}
          title="Seleccionar para reserva múltiple"
        >
          <Check className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      )}

      {/* Reservation countdown badge for reserved tickets */}
      {isReserved && timeInfo && (
        <div
          className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-tight flex items-center gap-0.5 shadow-xs z-20 ${
            timeInfo.isExpired
              ? 'bg-red-600 text-white'
              : 'bg-amber-500 text-white'
          }`}
          title={
            isAdmin
              ? `Apartado por ${ticket.buyerName || 'Participante'}: ${timeInfo.formatted}`
              : `Apartado: ${timeInfo.formatted}`
          }
        >
          {timeInfo.isExpired ? (
            <AlertTriangle className="w-2.5 h-2.5" />
          ) : (
            <Clock className="w-2.5 h-2.5" />
          )}
          <span>{timeInfo.isExpired ? 'Vencido' : `${timeInfo.hoursLeft}h`}</span>
        </div>
      )}

      {/* Main Number Text with High Contrast */}
      <span
        className={`font-mono text-xs sm:text-sm font-black transition-colors ${
          isPaid
            ? 'text-gray-400'
            : isReserved
            ? 'text-amber-900 font-bold'
            : isSelected
            ? 'text-purple-900 font-black'
            : 'text-purple-950 group-hover:text-purple-900'
        }`}
      >
        {ticket.number}
      </span>

      {/* Red 'X' Marker overlay (Exact replica of the flyer marker for paid tickets) */}
      {isPaid && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          title={`Boleta #${ticket.number}: ${isAdmin && ticket.buyerName ? ticket.buyerName : 'Marcada con X'}`}
        >
          {/* Stylized Red Brush Cross / X */}
          <svg
            viewBox="0 0 40 40"
            className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 drop-shadow-xs animate-mark-x"
            style={{
              transform: `rotate(${((ticket.number * 17) % 20) - 10}deg)`,
            }}
          >
            {/* Hand-drawn look dual strokes */}
            <path
              d="M 8,8 L 32,32 M 10,8 L 32,30 M 7,9 L 31,33"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 32,8 L 8,32 M 30,8 L 8,30 M 33,9 L 9,33"
              stroke="currentColor"
              strokeWidth="4.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      )}

      {/* Sub-label info: In participant mode (!isAdmin), hide participant names! */}
      {isPaid ? (
        <span className="text-[9px] font-bold text-red-700/80 truncate max-w-full px-0.5 leading-none mt-0.5 z-20">
          {isAdmin && ticket.buyerName ? ticket.buyerName.split(' ')[0] : 'Marcada'}
        </span>
      ) : isReserved ? (
        <span className="text-[9px] font-bold text-amber-800 truncate max-w-full px-0.5 leading-none mt-0.5 z-20">
          {isAdmin && ticket.buyerName ? ticket.buyerName.split(' ')[0] : 'Apartada'}
        </span>
      ) : (
        <span className="text-[8px] font-bold uppercase text-purple-400 group-hover:text-purple-700 leading-none mt-0.5">
          {isSelected ? 'Elegido' : 'Libre'}
        </span>
      )}

      {/* Admin Quick Action Button on Hover */}
      {isAdmin && isReserved && onQuickConfirmPayment && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onQuickConfirmPayment(ticket, e);
          }}
          className="absolute -bottom-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-1 shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Confirmar Pago y Marcar con X"
        >
          <ShieldCheck className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};

