import React from 'react';
import { Ticket as TicketIcon, CheckCircle2, Clock, TrendingUp, X } from 'lucide-react';
import { Ticket, RaffleConfig } from '../types';
import { formatCurrency } from '../utils/formatters';

interface StatsBarProps {
  tickets: Ticket[];
  config: RaffleConfig;
}

export const StatsBar: React.FC<StatsBarProps> = ({ tickets, config }) => {
  const total = tickets.length;
  const availableCount = tickets.filter((t) => t.status === 'disponible').length;
  const reservedCount = tickets.filter((t) => t.status === 'reservado').length;
  const paidCount = tickets.filter((t) => t.status === 'pagado').length;
  const markedCount = reservedCount + paidCount;

  const totalCollected = tickets
    .filter((t) => t.status === 'pagado')
    .reduce((acc, t) => acc + (t.pricePaid || config.ticketPrice), 0);

  const potentialTotal = total * config.ticketPrice;
  const paidPercent = total > 0 ? Math.round((paidCount / total) * 100) : 0;
  const markedPercent = total > 0 ? Math.round((markedCount / total) * 100) : 0;

  return (
    <div className="mb-6 space-y-3">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Boletas */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Total Boletas</span>
            <TicketIcon className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-soft text-purple-950">{total}</span>
            <span className="text-xs text-purple-600 font-medium">001 al 200</span>
          </div>
          <div className="text-[11px] text-purple-700 mt-1 font-medium">
            Meta: <span className="font-bold">{formatCurrency(potentialTotal, config.currency, config.currencySymbol)}</span>
          </div>
        </div>

        {/* Disponibles */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Disponibles</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-soft text-purple-950">{availableCount}</span>
            <span className="text-xs text-purple-600 font-medium">
              ({total > 0 ? Math.round((availableCount / total) * 100) : 0}%)
            </span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Listas para elegir
          </div>
        </div>

        {/* Marcadas (X Roja) */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-pink-600 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Marcadas (Con X)</span>
            <div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-black text-xs">
              <X className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-soft text-red-600">{markedCount}</span>
            <span className="text-xs text-purple-600 font-medium">
              ({markedPercent}%)
            </span>
          </div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">
            {paidCount} pagadas • {reservedCount} apartadas
          </div>
        </div>

        {/* Total Recaudado */}
        <div className="bg-white/90 backdrop-blur-xs p-4 rounded-2xl border border-purple-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-purple-900">Recaudado</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-950">
              {formatCurrency(totalCollected, config.currency, config.currencySymbol)}
            </span>
          </div>
          <div className="text-[11px] text-purple-600 font-medium mt-1">
            {paidPercent}% de la meta
          </div>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="bg-white/90 backdrop-blur-xs p-3 sm:p-4 rounded-2xl border border-purple-200 shadow-xs">
        <div className="flex items-center justify-between text-xs text-purple-700 mb-2 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-purple-900">
            <TrendingUp className="w-4 h-4 text-pink-600" />
            <span>Progreso de Boletas</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-red-600 font-bold">
              {markedCount} marcadas ({markedPercent}%)
            </span>
            <span className="text-purple-600">
              {availableCount} disponibles
            </span>
          </div>
        </div>

        <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden flex border border-purple-200">
          <div
            className="bg-gradient-to-r from-purple-600 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${(paidCount / total) * 100}%` }}
            title={`Pagadas: ${paidCount}`}
          />
          <div
            className="bg-amber-400 h-full transition-all duration-500"
            style={{ width: `${(reservedCount / total) * 100}%` }}
            title={`Apartadas: ${reservedCount}`}
          />
          <div
            className="bg-purple-100 h-full transition-all duration-500"
            style={{ width: `${(availableCount / total) * 100}%` }}
            title={`Disponibles: ${availableCount}`}
          />
        </div>
      </div>
    </div>
  );
};
