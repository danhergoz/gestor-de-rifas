import React from 'react';
import { Ticket } from '../types';
import { TicketCard } from './TicketCard';
import { SearchX, Heart, Sparkles, X } from 'lucide-react';

interface NumbersGridProps {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  selectedNumbers: number[];
  isAdmin: boolean;
  onToggleSelect: (num: number, e: React.MouseEvent) => void;
  onTicketClick: (ticket: Ticket) => void;
  onQuickConfirmPayment: (ticket: Ticket, e: React.MouseEvent) => void;
  onSelectAllAvailableInRange: () => void;
}

export const NumbersGrid: React.FC<NumbersGridProps> = ({
  filteredTickets,
  selectedNumbers,
  isAdmin,
  onToggleSelect,
  onTicketClick,
  onQuickConfirmPayment,
}) => {
  if (filteredTickets.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 p-12 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-purple-950 mb-1">
          No se encontraron números
        </h3>
        <p className="text-xs text-purple-600 max-w-sm mx-auto">
          No hay boletas que coincidan con la búsqueda o el filtro seleccionado.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-300 shadow-xl p-4 sm:p-6 space-y-4">
      {/* Top Banner Ribbon: 💜 ELIGE TU NÚMERO 💜 (Like in the flyer) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-2 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-purple-800 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-md shadow-purple-800/20">
            <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
            ELIGE TU NÚMERO
            <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
          </span>
          <span className="text-xs text-purple-600 font-bold hidden md:inline">
            Toca cualquier casilla para apartar tu número
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 text-purple-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500"></div>
            <span>Libre</span>
          </div>
          <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 text-red-700">
            <div className="w-3.5 h-3.5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-black">
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Marcado con X</span>
          </div>
        </div>
      </div>

      {/* Grid of Numbers: 20 columns on large desktop, 10 on medium, 5 on small, 4 on mobile */}
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-20 gap-1.5 sm:gap-2">
        {filteredTickets.map((ticket) => (
          <TicketCard
            key={ticket.number}
            ticket={ticket}
            isSelected={selectedNumbers.includes(ticket.number)}
            isAdmin={isAdmin}
            onSelect={onToggleSelect}
            onClick={onTicketClick}
            onQuickConfirmPayment={onQuickConfirmPayment}
          />
        ))}
      </div>

      {/* Footer notice */}
      <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-purple-600">
        <span className="font-medium">
          Mostrando {filteredTickets.length} de 200 casillas del talonario oficial
        </span>
        <span className="font-bold text-purple-900 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          Cada boleta tiene un valor de $10.000 COP
        </span>
      </div>
    </div>
  );
};
