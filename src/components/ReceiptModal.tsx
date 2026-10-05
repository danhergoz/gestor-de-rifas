import React, { useRef, useState } from 'react';
import { X, Printer, CheckCircle2, Ticket as TicketIcon, Phone, Heart, HardDrive, RefreshCw } from 'lucide-react';
import { Ticket, RaffleConfig } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { uploadFileToDrive, requestGoogleAccessToken } from '../services/googleDriveService';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  config: RaffleConfig;
  googleToken?: string | null;
  setGoogleToken?: (token: string | null) => void;
  onShowToast?: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  ticket,
  config,
  googleToken,
  setGoogleToken,
  onShowToast,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSavingDrive, setIsSavingDrive] = useState(false);

  if (!isOpen || !ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    const saveContent = async (token: string) => {
      setIsSavingDrive(true);
      try {
        const fileName = `Comprobante_Boleta_${ticket.number}_${ticket.buyerName || 'Participante'}.txt`;
        const textContent = `
===================================================
      COMPROBANTE OFICIAL DE BOLETA - RIFA SOLIDARIA
===================================================
Evento: ${config.title}
Premio: ${config.prize}
Número de Boleta: #${ticket.number}
Estado: MARCADO CON X (PAGADO)
Participante: ${ticket.buyerName || 'Anónimo'}
Teléfono: ${ticket.buyerPhone || 'N/A'}
Valor Pagado: ${formatCurrency(ticket.pricePaid || config.ticketPrice, config.currency, config.currencySymbol)}
Medio de Pago: ${ticket.paymentMethod || 'Nequi'}
Fecha de Emisión: ${formatDate(ticket.paidAt || ticket.reservedAt)}
Organizador: ${config.organizerName || 'Comité Organizador'} (Tel: ${config.contactPhone || 'N/A'})

---------------------------------------------------
Este documento digital sirve como constancia oficial 
para reclamar el premio en la fecha del sorteo.
===================================================
`;

        const result = await uploadFileToDrive(token, fileName, 'text/plain', textContent.trim());
        if (onShowToast) {
          onShowToast(`¡Comprobante #${ticket.number} guardado en tu Google Drive!`, 'success');
        }
      } catch (err: any) {
        if (onShowToast) {
          onShowToast(`Error al guardar en Drive: ${err.message}`, 'error');
        }
      } finally {
        setIsSavingDrive(false);
      }
    };

    if (googleToken) {
      await saveContent(googleToken);
    } else {
      const effectiveClientId =
        localStorage.getItem('rifa_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      if (!effectiveClientId) {
        if (onShowToast) {
          onShowToast('Conecta Google Drive en la barra superior o ajustes para guardar comprobantes en la nube.', 'info');
        }
        return;
      }
      setIsSavingDrive(true);
      requestGoogleAccessToken(
        effectiveClientId,
        async (token) => {
          if (setGoogleToken) setGoogleToken(token);
          await saveContent(token);
        },
        (errMsg) => {
          setIsSavingDrive(false);
          if (onShowToast) onShowToast(errMsg, 'error');
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Actions */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-800 to-pink-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TicketIcon className="w-4 h-4 text-pink-300" />
            <h3 className="font-bold text-sm uppercase tracking-wider font-soft">Comprobante de Boleta</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDrive}
              disabled={isSavingDrive}
              className="px-3 py-1.5 bg-blue-500/80 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              title="Guardar comprobante en Google Drive"
            >
              {isSavingDrive ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <HardDrive className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Drive</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-purple-200 hover:text-white rounded-full bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt Card */}
        <div className="p-6 overflow-y-auto">
          <div
            ref={receiptRef}
            className="bg-purple-50/70 border-2 border-purple-200 rounded-2xl p-6 text-center space-y-4 shadow-sm"
          >
            {/* Header */}
            <div>
              <div className="flex items-center justify-center gap-1 text-purple-700 mb-1">
                <Heart className="w-4 h-4 fill-purple-600 text-purple-600" />
                <span className="font-script text-2xl font-bold text-purple-900">Rifa solidaria</span>
              </div>
              <p className="text-xs text-purple-700 font-bold uppercase tracking-wider">
                Premio: {config.prize}
              </p>
            </div>

            {/* Big Ticket Number Stamp */}
            <div className="py-4 border-y-2 border-dashed border-purple-200 bg-white rounded-2xl">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 block mb-1">
                NÚMERO DE BOLETA ASIGNADO
              </span>
              <div className="font-mono text-5xl font-black text-purple-950 tracking-wider">
                #{ticket.number}
              </div>
              <div className="inline-flex items-center gap-1 mt-2 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                MARCADO CON X • PAGADO
              </div>
            </div>

            {/* Buyer Details */}
            <div className="text-left space-y-2 text-xs bg-white p-4 rounded-2xl border border-purple-100">
              <div className="flex justify-between">
                <span className="text-purple-600">Participante:</span>
                <span className="font-bold text-purple-950 uppercase">{ticket.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Teléfono:</span>
                <span className="font-mono text-purple-950">{ticket.buyerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Valor Pagado:</span>
                <span className="font-mono font-bold text-purple-950">
                  {formatCurrency(ticket.pricePaid || config.ticketPrice, config.currency, config.currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Medio de Pago:</span>
                <span className="font-bold text-pink-700">{ticket.paymentMethod || 'Nequi'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-600">Fecha de Emisión:</span>
                <span className="font-mono text-purple-900">{formatDate(ticket.paidAt || ticket.reservedAt)}</span>
              </div>
            </div>

            {/* Terms reminder */}
            <div className="text-[10px] text-purple-700 leading-tight space-y-1">
              <p>Conserva este comprobante digital como constancia para la entrega del premio.</p>
              {config.contactPhone && (
                <p className="font-mono text-purple-900 flex items-center justify-center gap-1 pt-1 font-bold">
                  <Phone className="w-3 h-3 text-pink-600" /> Contacto: {config.contactPhone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
