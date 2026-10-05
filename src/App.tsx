import React, { useState, useEffect, useMemo } from 'react';
import {
  DEFAULT_RAFFLE_CONFIG,
  generateInitialTickets,
} from './data/initialData';
import { Ticket, PaymentRecord, RaffleConfig, TicketStatus, ViewTab } from './types';
import { Header } from './components/Header';
import { RaffleOverview } from './components/RaffleOverview';
import { StatsBar } from './components/StatsBar';
import { SearchAndFilter } from './components/SearchAndFilter';
import { NumbersGrid } from './components/NumbersGrid';
import { ParticipantsTable } from './components/ParticipantsTable';
import { PaymentHistory } from './components/PaymentHistory';
import { ReservationModal } from './components/ReservationModal';
import { PaymentModal } from './components/PaymentModal';
import { TicketDetailsModal } from './components/TicketDetailsModal';
import { DrawWinnerModal } from './components/DrawWinnerModal';
import { SettingsModal } from './components/SettingsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { exportTicketsToCSV, generateWhatsAppMessage, formatTicketNumber } from './utils/formatters';
import { CheckCircle2, AlertCircle, Info, Sparkles, Heart, Dices } from 'lucide-react';

const STORAGE_KEYS = {
  TICKETS: 'rifa_solidaria_tickets_v3',
  PAYMENTS: 'rifa_solidaria_payments_v3',
  CONFIG: 'rifa_solidaria_config_v3',
  IS_ADMIN: 'rifa_solidaria_is_admin_v3',
};

export default function App() {
  // Initialize state with persistence
  const [config, setConfig] = useState<RaffleConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_RAFFLE_CONFIG;
    } catch {
      return DEFAULT_RAFFLE_CONFIG;
    }
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TICKETS);
      if (saved) return JSON.parse(saved);
      const initial = generateInitialTickets();
      return initial.tickets;
    } catch {
      return generateInitialTickets().tickets;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (saved) return JSON.parse(saved);
      const initial = generateInitialTickets();
      return initial.payments;
    } catch {
      return generateInitialTickets().payments;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.IS_ADMIN);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Save to local storage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.IS_ADMIN, JSON.stringify(isAdmin));
  }, [isAdmin]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'todos'>('todos');
  const [rangeFilter, setRangeFilter] = useState('todos');
  const [hidePaidTickets, setHidePaidTickets] = useState(false);
  const [activeTab, setActiveTab] = useState<ViewTab>('cuadricula');
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  // Modals state
  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [paymentModalTicket, setPaymentModalTicket] = useState<Ticket | null>(null);
  const [detailsModalTicket, setDetailsModalTicket] = useState<Ticket | null>(null);
  const [receiptModalTicket, setReceiptModalTicket] = useState<Ticket | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [googleDriveModalOpen, setGoogleDriveModalOpen] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Auto-expire reservations after 24 hours (1 day) limit
  useEffect(() => {
    const checkExpirations = () => {
      const now = new Date().getTime();
      let expiredCount = 0;

      setTickets((prev) => {
        let changed = false;
        const updated = prev.map((t) => {
          if (t.status === 'reservado') {
            const expTime = t.expiresAt
              ? new Date(t.expiresAt).getTime()
              : t.reservedAt
              ? new Date(t.reservedAt).getTime() + 24 * 60 * 60 * 1000
              : 0;

            if (expTime > 0 && now >= expTime) {
              changed = true;
              expiredCount++;
              return {
                number: t.number,
                status: 'disponible' as const,
              };
            }
          }
          return t;
        });

        if (changed && expiredCount > 0) {
          showToast(`Se liberaron ${expiredCount} boleta(s) por vencimiento del plazo de 24 horas.`, 'info');
          return updated;
        }
        return prev;
      });
    };

    checkExpirations();
    const interval = setInterval(checkExpirations, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Counts for filters
  const paidCount = useMemo(() => tickets.filter((t) => t.status === 'pagado').length, [tickets]);
  const availableCount = useMemo(() => tickets.filter((t) => t.status === 'disponible').length, [tickets]);
  const reservedCount = useMemo(() => tickets.filter((t) => t.status === 'reservado').length, [tickets]);

  // Filtered tickets calculation
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Hide paid tickets toggle
      if (hidePaidTickets && ticket.status === 'pagado') {
        return false;
      }

      // Range filter
      if (rangeFilter === '1-50' && (ticket.number < 1 || ticket.number > 50)) return false;
      if (rangeFilter === '51-100' && (ticket.number < 51 || ticket.number > 100)) return false;
      if (rangeFilter === '101-150' && (ticket.number < 101 || ticket.number > 150)) return false;
      if (rangeFilter === '151-200' && (ticket.number < 151 || ticket.number > 200)) return false;

      // Status filter
      if (statusFilter !== 'todos' && ticket.status !== statusFilter) return false;

      // Search term filter (by buyerName, buyerPhone, or ticketNumber)
      if (searchTerm.trim() !== '') {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = ticket.buyerName?.toLowerCase().includes(query);
        const matchesPhone = ticket.buyerPhone?.includes(query);
        const matchesNumber = ticket.number.toString() === query || formatTicketNumber(ticket.number).includes(query);
        const matchesNotes = ticket.notes?.toLowerCase().includes(query);

        if (!matchesName && !matchesPhone && !matchesNumber && !matchesNotes) {
          return false;
        }
      }

      return true;
    });
  }, [tickets, hidePaidTickets, rangeFilter, statusFilter, searchTerm]);

  // Handle number tile selection for multi-reserve
  const handleToggleSelect = (num: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetTicket = tickets.find((t) => t.number === num);
    if (targetTicket && targetTicket.status !== 'disponible') {
      // If already reserved or paid, open details
      setDetailsModalTicket(targetTicket);
      return;
    }

    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Handle tile click
  const handleTicketClick = (ticket: Ticket) => {
    if (ticket.status === 'disponible') {
      setSelectedNumbers([ticket.number]);
      setReservationModalOpen(true);
    } else {
      setDetailsModalTicket(ticket);
    }
  };

  // Handle single ticket reservation directly
  const handleReserveSingleTicket = (ticketNumber: number) => {
    setSelectedNumbers([ticketNumber]);
    setReservationModalOpen(true);
  };

  // Confirm Reservation logic (1-day expiration duration)
  const handleConfirmReservation = (data: {
    numbers: number[];
    buyerName: string;
    buyerPhone: string;
    buyerEmail?: string;
    notes?: string;
    sendWhatsApp: boolean;
  }) => {
    const nowDate = new Date();
    const now = nowDate.toISOString();
    const expiresAt = new Date(nowDate.getTime() + 24 * 60 * 60 * 1000).toISOString();

    setTickets((prev) =>
      prev.map((t) => {
        if (data.numbers.includes(t.number)) {
          return {
            ...t,
            status: 'reservado',
            buyerName: data.buyerName,
            buyerPhone: data.buyerPhone,
            buyerEmail: data.buyerEmail,
            notes: data.notes,
            reservedAt: now,
            expiresAt: expiresAt,
          };
        }
        return t;
      })
    );

    const numsStr = data.numbers.map((n) => `#${n}`).join(', ');
    showToast(
      `¡Boleta(s) ${numsStr} apartada(s) con éxito a nombre de ${data.buyerName}! Plazo de pago: 24 horas.`,
      'success'
    );

    // Open WhatsApp if opted
    if (data.sendWhatsApp && config.contactPhone) {
      const cleanPhone = config.contactPhone.replace(/[^0-9]/g, '');
      const totalPrice = data.numbers.length * config.ticketPrice;
      const message = generateWhatsAppMessage(
        data.numbers,
        data.buyerName,
        totalPrice,
        config.bankInfo,
        config.title
      );
      const url = `https://wa.me/${cleanPhone}?text=${message}`;
      window.open(url, '_blank');
    }

    setSelectedNumbers([]);
    setReservationModalOpen(false);
  };

  // Quick or Modal Payment Confirmation logic
  const handleConfirmPayment = (paymentData: {
    ticketNumber: number;
    amount: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    const now = new Date().toISOString();
    const targetTicket = tickets.find((t) => t.number === paymentData.ticketNumber);

    if (!targetTicket) return;

    // 1. Update ticket in tickets array
    setTickets((prev) =>
      prev.map((t) => {
        if (t.number === paymentData.ticketNumber) {
          return {
            ...t,
            status: 'pagado',
            paidAt: now,
            pricePaid: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            notes: paymentData.notes || t.notes,
          };
        }
        return t;
      })
    );

    // 2. Add payment record to history ledger
    const newPaymentRecord: PaymentRecord = {
      id: `pay-${paymentData.ticketNumber}-${Date.now()}`,
      ticketNumber: paymentData.ticketNumber,
      buyerName: targetTicket.buyerName || 'Participante',
      buyerPhone: targetTicket.buyerPhone || '',
      amount: paymentData.amount,
      paymentMethod: paymentData.paymentMethod,
      date: now,
      referenceNumber: paymentData.referenceNumber,
      notes: paymentData.notes,
    };

    setPayments((prev) => [newPaymentRecord, ...prev]);

    showToast(
      `¡Boleta #${paymentData.ticketNumber} marcada con X y pago confirmado!`,
      'success'
    );
    setPaymentModalTicket(null);
  };

  // Quick confirm payment handler directly from card
  const handleQuickConfirmPayment = (ticket: Ticket, e: React.MouseEvent) => {
    e.stopPropagation();
    setPaymentModalTicket(ticket);
  };

  // Release / Cancel reservation
  const handleReleaseTicket = (ticketNumber: number) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.number === ticketNumber) {
          return {
            number: t.number,
            status: 'disponible',
          };
        }
        return t;
      })
    );
    showToast(`Boleta #${ticketNumber} liberada correctamente.`, 'info');
  };

  // Update participant info
  const handleUpdateTicketInfo = (
    ticketNumber: number,
    data: { buyerName: string; buyerPhone: string; notes?: string }
  ) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.number === ticketNumber) {
          return {
            ...t,
            buyerName: data.buyerName,
            buyerPhone: data.buyerPhone,
            notes: data.notes,
          };
        }
        return t;
      })
    );
    showToast(`Datos de la boleta #${ticketNumber} actualizados.`, 'success');
  };

  // Export full tickets list to CSV
  const handleExportCSV = () => {
    exportTicketsToCSV(tickets, config.title);
    showToast('Archivo CSV generado y descargado con éxito.', 'success');
  };

  // Reset to initial flyer defaults
  const handleResetAllData = () => {
    const initial = generateInitialTickets();
    setTickets(initial.tickets);
    setPayments(initial.payments);
    setConfig(DEFAULT_RAFFLE_CONFIG);
    setSelectedNumbers([]);
    showToast('Se han restaurado los números marcados y configuración original del flyer.', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50/70 via-purple-50/50 to-pink-50/60 text-purple-950 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-purple-900 text-white border-purple-700 shadow-purple-950/20'
                : toast.type === 'info'
                ? 'bg-indigo-900 text-white border-indigo-700'
                : 'bg-red-900 text-white border-red-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-pink-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Header */}
      <Header
        config={config}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setAdminLoginModalOpen(true)}
        onLogoutAdmin={() => {
          setIsAdmin(false);
          if (activeTab === 'historial' || activeTab === 'sorteo') {
            setActiveTab('cuadricula');
          }
          setHidePaidTickets(false);
          setStatusFilter('todos');
          setRangeFilter('todos');
          showToast('Has cambiado al Modo Participante.', 'info');
        }}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenDraw={() => setDrawModalOpen(true)}
        onExport={handleExportCSV}
        onOpenGoogleDrive={() => setGoogleDriveModalOpen(true)}
        isDriveConnected={Boolean(googleToken)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Raffle Prize & Transfer Overview (Matches flyer poster) */}
        <RaffleOverview config={config} isAdmin={isAdmin} />

        {/* Real-time Stats & Progress - Visible only for Admin */}
        {isAdmin && <StatsBar tickets={tickets} config={config} />}

        {/* Live Search, Status Filters & Tabs */}
        <SearchAndFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          rangeFilter={rangeFilter}
          setRangeFilter={setRangeFilter}
          hidePaidTickets={hidePaidTickets}
          setHidePaidTickets={setHidePaidTickets}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedNumbers={selectedNumbers}
          onOpenMultiReserve={() => setReservationModalOpen(true)}
          onClearSelection={() => setSelectedNumbers([])}
          paymentCount={payments.length}
          paidCount={paidCount}
          availableCount={availableCount}
          reservedCount={reservedCount}
          isAdmin={isAdmin}
        />

        {/* Tab 1: Interactive Number Grid (1 to 200 with Red X marks) */}
        {activeTab === 'cuadricula' && (
          <NumbersGrid
            tickets={tickets}
            filteredTickets={filteredTickets}
            selectedNumbers={selectedNumbers}
            isAdmin={isAdmin}
            onToggleSelect={handleToggleSelect}
            onTicketClick={handleTicketClick}
            onQuickConfirmPayment={handleQuickConfirmPayment}
            onSelectAllAvailableInRange={() => {}}
          />
        )}

        {/* Tab 2: Participants List / Tabular View */}
        {activeTab === 'tabla' && (
          <ParticipantsTable
            tickets={filteredTickets}
            config={config}
            isAdmin={isAdmin}
            onTicketClick={handleTicketClick}
            onOpenPaymentModal={(t) => setPaymentModalTicket(t)}
            onOpenReceiptModal={(t) => setReceiptModalTicket(t)}
          />
        )}

        {/* Tab 3: Official Payment History Ledger */}
        {activeTab === 'historial' && (
          <PaymentHistory
            payments={payments}
            config={config}
            isAdmin={isAdmin}
          />
        )}

        {/* Tab 4: Live Draw Winner Simulation Tab (Ruleta Virtual) */}
        {activeTab === 'sorteo' && (
          <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-purple-200 p-8 text-center shadow-xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-700 to-pink-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-600/20">
              <Dices className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-black text-purple-950 font-soft">Ruleta Virtual de la Rifa Solidaria</h3>
              <p className="text-xs text-purple-600 mt-1">
                Realiza el sorteo transparente con todos los números (1 al {config.totalNumbers || 200}, incluso los no jugados) o activando la opción de marcar únicamente los números jugados con animación de ruleta y confeti festivo.
              </p>
            </div>
            <button
              onClick={() => setDrawModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mx-auto"
            >
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span>Abrir Ruleta de Sorteo</span>
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <ReservationModal
        isOpen={reservationModalOpen}
        onClose={() => setReservationModalOpen(false)}
        selectedNumbers={selectedNumbers}
        onConfirmReservation={handleConfirmReservation}
        config={config}
      />

      <PaymentModal
        isOpen={paymentModalTicket !== null}
        onClose={() => setPaymentModalTicket(null)}
        ticket={paymentModalTicket}
        onConfirmPayment={handleConfirmPayment}
        config={config}
      />

      <TicketDetailsModal
        isOpen={detailsModalTicket !== null}
        onClose={() => setDetailsModalTicket(null)}
        ticket={detailsModalTicket}
        isAdmin={isAdmin}
        config={config}
        onOpenPaymentModal={(ticket) => setPaymentModalTicket(ticket)}
        onReleaseTicket={handleReleaseTicket}
        onUpdateTicketInfo={handleUpdateTicketInfo}
        onOpenReceiptModal={(ticket) => setReceiptModalTicket(ticket)}
        onReserveSingleTicket={handleReserveSingleTicket}
      />

      <DrawWinnerModal
        isOpen={drawModalOpen}
        onClose={() => setDrawModalOpen(false)}
        tickets={tickets}
        config={config}
        isAdmin={isAdmin}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        config={config}
        onSaveConfig={(newConfig) => {
          setConfig(newConfig);
          showToast('Configuración de la rifa guardada.', 'success');
        }}
        onResetAllData={handleResetAllData}
        onOpenGoogleDrive={() => setGoogleDriveModalOpen(true)}
      />

      <ReceiptModal
        isOpen={receiptModalTicket !== null}
        onClose={() => setReceiptModalTicket(null)}
        ticket={receiptModalTicket}
        config={config}
        googleToken={googleToken}
        setGoogleToken={setGoogleToken}
        onShowToast={showToast}
      />

      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={() => setAdminLoginModalOpen(false)}
        onSuccess={() => {
          setIsAdmin(true);
          showToast('¡Autenticado con éxito! Modo Administrador activado.', 'success');
        }}
        config={config}
      />

      <GoogleDriveModal
        isOpen={googleDriveModalOpen}
        onClose={() => setGoogleDriveModalOpen(false)}
        tickets={tickets}
        config={config}
        payments={payments}
        onRestoreBackup={({ tickets: restoredTickets, config: restoredConfig, payments: restoredPayments }) => {
          if (restoredTickets) setTickets(restoredTickets);
          if (restoredConfig) setConfig(restoredConfig);
          if (restoredPayments) setPayments(restoredPayments);
          showToast('¡Respaldo de Google Drive restaurado exitosamente!', 'success');
        }}
        onShowToast={showToast}
        googleToken={googleToken}
        setGoogleToken={setGoogleToken}
      />

      {/* Footer */}
      <footer className="bg-white/80 border-t border-purple-200 py-6 mt-12 text-center text-xs text-purple-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 justify-center font-medium">
            <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
            <span>Rifa Solidaria • Organizada por {config.organizerName || 'Jimena Hernandez'} (Boletas 1 al 200)</span>
          </p>
          <p className="text-purple-500 font-bold">
            💜 Gracias por tu apoyo, significa muchísimo 💜
          </p>
        </div>
      </footer>
    </div>
  );
}
