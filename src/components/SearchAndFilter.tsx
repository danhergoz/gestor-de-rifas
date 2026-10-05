import React from 'react';
import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Receipt,
  Trophy,
  X,
  CheckSquare,
  PlusCircle,
  Eye,
  EyeOff,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { TicketStatus, ViewTab } from '../types';

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: TicketStatus | 'todos';
  setStatusFilter: (status: TicketStatus | 'todos') => void;
  rangeFilter: string;
  setRangeFilter: (range: string) => void;
  hidePaidTickets: boolean;
  setHidePaidTickets: (val: boolean) => void;
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedNumbers: number[];
  onOpenMultiReserve: () => void;
  onClearSelection: () => void;
  paymentCount: number;
  paidCount: number;
  availableCount: number;
  reservedCount: number;
  isAdmin: boolean;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  rangeFilter,
  setRangeFilter,
  hidePaidTickets,
  setHidePaidTickets,
  activeTab,
  setActiveTab,
  selectedNumbers,
  onOpenMultiReserve,
  onClearSelection,
  paymentCount,
  paidCount,
  availableCount,
  reservedCount,
  isAdmin,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border border-purple-200 shadow-md p-4 sm:p-5 mb-6 space-y-4">
      {/* Top row: Tab Switcher & Search input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center p-1 bg-purple-100/80 rounded-2xl overflow-x-auto shrink-0 border border-purple-200">
          <button
            id="tab-cuadricula-btn"
            onClick={() => setActiveTab('cuadricula')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              activeTab === 'cuadricula'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-purple-700 hover:text-purple-950 hover:bg-purple-200/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Talonario 1-200</span>
          </button>

          <button
            id="tab-tabla-btn"
            onClick={() => setActiveTab('tabla')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              activeTab === 'tabla'
                ? 'bg-purple-800 text-white shadow-sm'
                : 'text-purple-700 hover:text-purple-950 hover:bg-purple-200/60'
            }`}
          >
            <List className="w-4 h-4" />
            <span>Lista de Boletas</span>
          </button>

          {/* Admin-only Tabs: Historial de Pagos y Ruleta de Sorteo */}
          {isAdmin && (
            <>
              <button
                id="tab-historial-btn"
                onClick={() => setActiveTab('historial')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  activeTab === 'historial'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-purple-700 hover:text-purple-950 hover:bg-purple-200/60'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Historial Pagos</span>
                {paymentCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-pink-500 text-white rounded-full font-mono text-[10px] font-bold">
                    {paymentCount}
                  </span>
                )}
              </button>

              <button
                id="tab-sorteo-btn"
                onClick={() => setActiveTab('sorteo')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
                  activeTab === 'sorteo'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-purple-700 hover:text-purple-950 hover:bg-purple-200/60'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Ruleta Sorteo</span>
              </button>
            </>
          )}
        </div>

        {/* Live Search by Name, Phone, or Number */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isAdmin
                ? "Buscar por comprador, teléfono o # boleta..."
                : "Buscar boleta por número (#1 al #200)..."
            }
            className="w-full pl-9 pr-9 py-2.5 bg-purple-50/70 border border-purple-200 rounded-xl text-xs sm:text-sm text-purple-950 placeholder:text-purple-400 focus:outline-none focus:border-purple-600 focus:bg-white transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-700"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Filters, Ranges & Hide Paid Tickets Toggle - ONLY VISIBLE FOR ADMIN */}
      {isAdmin && (activeTab === 'cuadricula' || activeTab === 'tabla') && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-purple-100">
          {/* Status Filters & Hide Paid Switch */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtros Admin:
            </span>

            {/* Quick Toggle: Ocultar Boletas Pagadas */}
            <button
              id="toggle-hide-paid-btn"
              onClick={() => setHidePaidTickets(!hidePaidTickets)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs ${
                hidePaidTickets
                  ? 'bg-gradient-to-r from-purple-800 to-pink-600 text-white shadow-purple-800/20'
                  : 'bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200'
              }`}
              title="Ocultar las boletas que ya están pagadas para ver solo números disponibles y apartados"
            >
              {hidePaidTickets ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-pink-300" />
                  <span>Ocultando Pagadas ({paidCount})</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-purple-700" />
                  <span>Ocultar Boletas Pagadas</span>
                </>
              )}
            </button>

            {/* Status pills if not strictly hiding paid */}
            {!hidePaidTickets && (
              <>
                <button
                  onClick={() => setStatusFilter('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === 'todos'
                      ? 'bg-purple-800 text-white shadow-xs'
                      : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                  }`}
                >
                  Todos (200)
                </button>

                <button
                  onClick={() => setStatusFilter('disponible')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    statusFilter === 'disponible'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-purple-50 text-emerald-700 border border-purple-200 hover:bg-emerald-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  Libres ({availableCount})
                </button>

                <button
                  onClick={() => setStatusFilter('reservado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    statusFilter === 'reservado'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-purple-50 text-amber-800 border border-purple-200 hover:bg-amber-50'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-500" />
                  Apartadas ({reservedCount})
                </button>

                <button
                  onClick={() => setStatusFilter('pagado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    statusFilter === 'pagado'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-purple-50 text-red-700 border border-purple-200 hover:bg-red-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  Marcadas con X ({paidCount})
                </button>
              </>
            )}
          </div>

          {/* Range Quick Filters (1-50, 51-100, 101-150, 151-200) */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] uppercase tracking-wider text-purple-600 font-bold hidden sm:inline mr-1">Rango:</span>
            {['todos', '1-50', '51-100', '101-150', '151-200'].map((range) => (
              <button
                key={range}
                onClick={() => setRangeFilter(range)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                  rangeFilter === range
                    ? 'bg-purple-800 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                {range === 'todos' ? '1-200' : range}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Multi-selection sticky bar if user has selected numbers */}
      {selectedNumbers.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-purple-800 to-pink-700 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckSquare className="w-4 h-4 text-pink-300 shrink-0" />
            <span>
              Has seleccionado <strong className="text-white">{selectedNumbers.length}</strong> boleta(s):{' '}
              <span className="font-mono font-black text-pink-200">
                {selectedNumbers.map((n) => `#${n.toString().padStart(3, '0')}`).join(', ')}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClearSelection}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex-1 sm:flex-initial"
            >
              Cancelar
            </button>
            <button
              onClick={onOpenMultiReserve}
              className="px-4 py-1.5 bg-white text-purple-900 hover:bg-purple-50 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <PlusCircle className="w-4 h-4 text-pink-600" />
              <span>Apartar {selectedNumbers.length} Boleta(s)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

