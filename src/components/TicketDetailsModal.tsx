import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ShieldCheck,
  Printer,
  MessageCircle,
  AlertTriangle,
  FileCheck,
  Heart,
  Shield,
} from 'lucide-react';
import { Ticket, RaffleConfig } from '../types';
import {
  formatCurrency,
  formatDate,
  formatTicketNumber,
  getTimeRemaining,
  maskName,
  maskPhone,
} from '../utils/formatters';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  isAdmin: boolean;
  config: RaffleConfig;
  onOpenPaymentModal: (ticket: Ticket) => void;
  onReleaseTicket: (ticketNumber: number) => void;
  onUpdateTicketInfo: (ticketNumber: number, data: { buyerName: string; buyerPhone: string; notes?: string }) => void;
  onOpenReceiptModal: (ticket: Ticket) => void;
  onReserveSingleTicket: (ticketNumber: number) => void;
}

export const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket,
  isAdmin,
  config,
  onOpenPaymentModal,
  onReleaseTicket,
  onUpdateTicketInfo,
  onOpenReceiptModal,
  onReserveSingleTicket,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [showConfirmRelease, setShowConfirmRelease] = useState(false);

  if (!isOpen || !ticket) return null;

  const startEdit = () => {
    setEditName(ticket.buyerName || '');
    setEditPhone(ticket.buyerPhone || '');
    setEditNotes(ticket.notes || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTicketInfo(ticket.number, {
      buyerName: editName.trim(),
      buyerPhone: editPhone.trim(),
      notes: editNotes.trim(),
    });
    setIsEditing(false);
  };

  const isAvailable = ticket.status === 'disponible';
  const isReserved = ticket.status === 'reservado';
  const isPaid = ticket.status === 'pagado';

  // 24-hour expiration time calculation
  const timeInfo = isReserved
    ? getTimeRemaining(ticket.expiresAt, ticket.reservedAt, config.reservationDurationHours || 24)
    : null;

  const cleanPhone = ticket.buyerPhone?.replace(/[^0-9]/g, '') || '';
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(
        `¡Hola ${ticket.buyerName || ''}! Te escribo respecto a tu boleta #${ticket.number} de la ${config.title}.`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center font-mono font-black text-2xl shadow-sm">
              #{ticket.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight font-soft">Boleta #{ticket.number}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isPaid
                      ? 'bg-emerald-400 text-emerald-950'
                      : isReserved
                      ? 'bg-amber-300 text-amber-950'
                      : 'bg-white/30 text-white'
                  }`}
                >
                  {isPaid ? 'Marcada / Pagada' : isReserved ? 'Apartada (24h)' : 'Disponible'}
                </span>
              </div>
              <p className="text-xs text-purple-100">{config.title} • {config.prize}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-purple-100 hover:text-white rounded-full bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* 24-HOUR COUNTDOWN BANNER FOR RESERVATIONS */}
          {isReserved && timeInfo && (
            <div
              className={`p-3.5 rounded-2xl border ${
                timeInfo.isExpired
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {timeInfo.isExpired ? (
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                  )}
                  <div>
                    <h4 className="font-bold text-[11px] uppercase tracking-wider">
                      {timeInfo.isExpired ? 'Plazo de 24 Horas Vencido' : 'Plazo Límite de Pago (1 Día)'}
                    </h4>
                    <p className="text-[11px] font-medium">
                      {timeInfo.isExpired
                        ? 'El tiempo límite de 24 horas para enviar el comprobante ha expirado.'
                        : `Tiempo restante para pagar: ${timeInfo.formatted}`}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold shrink-0 ${
                    timeInfo.isExpired ? 'bg-red-200 text-red-950' : 'bg-amber-200 text-amber-950'
                  }`}
                >
                  {timeInfo.isExpired ? 'Vencido' : `${timeInfo.hoursLeft}h ${timeInfo.minutesLeft}m`}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-amber-200/70 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    timeInfo.isExpired
                      ? 'bg-red-600 w-full'
                      : timeInfo.percentRemaining < 25
                      ? 'bg-red-500'
                      : 'bg-amber-600'
                  }`}
                  style={{ width: `${timeInfo.isExpired ? 100 : timeInfo.percentRemaining}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Privacy Notice in Participant Mode */}
          {!isAdmin && !isAvailable && (
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 flex items-start gap-2.5 text-purple-900">
              <Shield className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-purple-950">
                  Privacidad del Participante
                </h4>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Por seguridad y privacidad, los datos personales del comprador están ocultos en la vista pública.
                </p>
              </div>
            </div>
          )}

          {/* AVAILABLE STATE */}
          {isAvailable && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-3xl flex items-center justify-center mx-auto">
                <FileCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-purple-950">¡El número {ticket.number} está libre!</h4>
                <p className="text-xs text-purple-600 mt-1 max-w-xs mx-auto font-medium">
                  Puedes apartarlo ahora por un valor de{' '}
                  <strong className="text-purple-900 font-bold">
                    {formatCurrency(config.ticketPrice, config.currency, config.currencySymbol)}
                  </strong>{' '}
                  y apoyar a Jimena en esta calamidad. Tendrás 24 horas para enviar el comprobante.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onReserveSingleTicket(ticket.number);
                }}
                className="w-full py-3 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Apartar Boleta #{ticket.number}</span>
              </button>
            </div>
          )}

          {/* RESERVED OR PAID DETAILS */}
          {!isAvailable && (
            <>
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3 bg-purple-50 p-4 rounded-2xl border border-purple-200">
                  <h4 className="text-[10px] uppercase tracking-wider font-bold text-purple-800 mb-2">Editar Datos del Participante</h4>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-purple-700 font-bold mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-purple-700 font-bold mb-1">Teléfono</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-purple-700 font-bold mb-1">Notas</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-purple-200 text-purple-950 rounded-xl focus:outline-none focus:border-purple-600"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs text-purple-700 hover:text-purple-950 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs bg-purple-700 text-white font-bold uppercase rounded-xl hover:bg-purple-800"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-purple-50/80 rounded-2xl p-4 border border-purple-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center font-bold">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-purple-600 font-bold">Titular de la Boleta</p>
                        <h4 className="text-sm font-bold text-purple-950 uppercase">
                          {isAdmin ? ticket.buyerName || 'Sin Nombre' : maskName(ticket.buyerName)}
                        </h4>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={startEdit}
                        className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-xl transition-colors"
                        title="Editar datos del comprador"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-purple-200 text-xs">
                    <div className="flex items-center gap-2 text-purple-900 font-medium">
                      <Phone className="w-3.5 h-3.5 text-purple-500" />
                      <span className="font-mono">
                        {isAdmin ? ticket.buyerPhone || 'No registrado' : maskPhone(ticket.buyerPhone)}
                      </span>
                      {isAdmin && cleanPhone && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:underline font-bold uppercase text-[10px] flex items-center gap-0.5 ml-auto"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-purple-600">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDate(ticket.reservedAt)}</span>
                    </div>
                  </div>

                  {ticket.notes && isAdmin && (
                    <div className="text-xs bg-white p-2.5 rounded-xl border border-purple-200 text-purple-800">
                      <span className="font-bold text-purple-950">Nota: </span>
                      {ticket.notes}
                    </div>
                  )}
                </div>
              )}

              {/* PAYMENT STATUS CARD */}
              <div
                className={`p-4 rounded-2xl border ${
                  isPaid ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isPaid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-600" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
                      {isPaid ? 'Marcado con X (Pago Confirmado)' : 'Apartado (Plazo de 24 Horas)'}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-black text-purple-950">
                    {formatCurrency(ticket.pricePaid || config.ticketPrice, config.currency, config.currencySymbol)}
                  </span>
                </div>

                {isPaid ? (
                  <div className="space-y-1 text-xs text-emerald-800 pt-2 border-t border-emerald-200">
                    <div className="flex justify-between">
                      <span>Medio de Pago:</span>
                      <span className="font-bold">{ticket.paymentMethod || 'Nequi'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fecha de Pago:</span>
                      <span className="font-mono">{formatDate(ticket.paidAt)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 pt-1">
                    Esta boleta está apartada con plazo de 1 día para reportar el pago a Jimena.
                  </p>
                )}
              </div>

              {/* Release confirmation box */}
              {showConfirmRelease && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>¿Liberar esta boleta?</span>
                  </div>
                  <p className="text-[11px] text-red-600">
                    El número #{ticket.number} quedará libre y se removerá la X del talonario.
                  </p>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowConfirmRelease(false)}
                      className="px-3 py-1 text-xs text-purple-700 hover:text-purple-950 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        onReleaseTicket(ticket.number);
                        setShowConfirmRelease(false);
                        onClose();
                      }}
                      className="px-3 py-1 text-xs bg-red-600 text-white font-bold uppercase rounded-xl hover:bg-red-700"
                    >
                      Sí, Liberar
                    </button>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-purple-100">
                {isAdmin && !showConfirmRelease && (
                  <button
                    onClick={() => setShowConfirmRelease(true)}
                    className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5"
                    title="Liberar número / anular reserva"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Liberar Número</span>
                  </button>
                )}

                {isPaid && isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReceiptModal(ticket);
                    }}
                    className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Ver Recibo</span>
                  </button>
                )}

                {isReserved && isAdmin && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenPaymentModal(ticket);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 ml-auto"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar Pago y Marcar X</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

