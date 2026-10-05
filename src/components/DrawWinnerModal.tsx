import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trophy,
  Sparkles,
  Dices,
  RefreshCw,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Filter,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  History,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Ticket, RaffleConfig } from '../types';
import { formatTicketNumber, maskName, maskPhone } from '../utils/formatters';

interface DrawWinnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: Ticket[];
  config: RaffleConfig;
  isAdmin: boolean;
}

interface SpinRecord {
  ticket: Ticket;
  timestamp: Date;
  roundNumber: number;
}

export const DrawWinnerModal: React.FC<DrawWinnerModalProps> = ({
  isOpen,
  onClose,
  tickets,
  config,
  isAdmin,
}) => {
  // Option: False = all numbers (1-200, including unplayed), True = only played numbers
  const [onlyPlayed, setOnlyPlayed] = useState<boolean>(false);
  const [includeReserved, setIncludeReserved] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [winnerTicket, setWinnerTicket] = useState<Ticket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showNumbersList, setShowNumbersList] = useState<boolean>(false);
  const [spinHistory, setSpinHistory] = useState<SpinRecord[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Categorize tickets
  const paidTickets = tickets.filter((t) => t.status === 'pagado');
  const reservedTickets = tickets.filter((t) => t.status === 'reservado');
  const availableTickets = tickets.filter((t) => t.status === 'disponible');

  // Eligible pool depending on whether "Marcar solo los números jugados" is active
  const eligibleTickets = onlyPlayed
    ? includeReserved
      ? [...paidTickets, ...reservedTickets]
      : paidTickets
    : tickets;

  // Sound synthesis via Web Audio API
  const playTickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio might fail if user hasn't interacted
    }
  };

  const playFanfareSound = (isWinner: boolean) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (isWinner) {
        // Joyful chord notes: C5, E5, G5, C6
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
        });
      } else {
        // Neutral lower tone for unplayed/desert
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(330, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      setWinnerTicket(null);
      setDisplayNumber(null);
      setIsDrawing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Realistic decelerating roulette spin
  const handleStartDraw = () => {
    if (eligibleTickets.length === 0) return;

    setIsDrawing(true);
    setWinnerTicket(null);

    // Pick final target upfront to ensure fairness
    const finalWinnerIdx = Math.floor(Math.random() * eligibleTickets.length);
    const finalWinner = eligibleTickets[finalWinnerIdx];

    let currentDelay = 35; // start fast
    const maxSpins = 42; // total flashes
    let currentSpin = 0;

    const spinStep = () => {
      currentSpin++;
      // Pick random number from pool during spin
      const randomIdx = Math.floor(Math.random() * eligibleTickets.length);
      setDisplayNumber(eligibleTickets[randomIdx].number);
      playTickSound();

      if (currentSpin >= maxSpins) {
        // Stop on the final winner
        setDisplayNumber(finalWinner.number);
        setWinnerTicket(finalWinner);
        setIsDrawing(false);

        // Record in session spin history
        setSpinHistory((prev) => [
          {
            ticket: finalWinner,
            timestamp: new Date(),
            roundNumber: prev.length + 1,
          },
          ...prev,
        ]);

        // Trigger fanfare & confetti if it was a paid winner
        if (finalWinner.status === 'pagado') {
          playFanfareSound(true);
          try {
            confetti({
              particleCount: 170,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#7c3aed', '#ec4899', '#f43f5e', '#a855f7', '#ffd700', '#10b981'],
            });
          } catch {
            // ignore
          }
        } else {
          playFanfareSound(false);
        }
      } else {
        // Deceleration physics: speed slows down as we approach the end
        if (currentSpin > 28) {
          currentDelay += 28;
        } else if (currentSpin > 18) {
          currentDelay += 12;
        } else if (currentSpin > 8) {
          currentDelay += 4;
        }
        setTimeout(spinStep, currentDelay);
      }
    };

    setTimeout(spinStep, currentDelay);
  };

  const cleanPhone = winnerTicket?.buyerPhone?.replace(/[^0-9]/g, '') || '';
  const winnerWhatsApp = cleanPhone
    ? `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : '57' + cleanPhone}?text=${encodeURIComponent(
        `🎉 ¡FELICITACIONES ${winnerTicket?.buyerName || ''}! Tu número #${winnerTicket ? formatTicketNumber(winnerTicket.number) : ''} ha resultado GANADOR del premio de "${config.prize}" en la ${config.title}. ¡Muchas gracias por tu apoyo!`
      )}`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/70 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-2 border-purple-200 overflow-hidden flex flex-col my-6 max-h-[92vh]">
        {/* Top Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-900 via-purple-700 to-pink-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight font-soft">Ruleta Virtual del Sorteo</h3>
              <p className="text-[11px] text-purple-100">Sorteo transparente en vivo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-purple-100 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title={soundEnabled ? 'Silenciar ruleta' : 'Activar sonido de ruleta'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-purple-300" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-purple-100 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto text-center">
          {/* Prize Header */}
          <div className="p-3.5 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200 rounded-2xl">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-600 block mb-0.5">
              Premio en Juego
            </span>
            <p className="text-xl sm:text-2xl font-black text-purple-950 font-soft">
              {config.prize}
            </p>
          </div>

          {/* Quick Mode Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={isDrawing}
              onClick={() => {
                setOnlyPlayed(false);
                setWinnerTicket(null);
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                !onlyPlayed
                  ? 'bg-purple-900 text-white border-purple-950 shadow-md ring-2 ring-purple-300'
                  : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5" />
                <span>Todos los números</span>
              </span>
              <span className={`text-[10px] font-normal ${!onlyPlayed ? 'text-purple-200' : 'text-purple-600'}`}>
                1 al {tickets.length} (incluye no jugados)
              </span>
            </button>

            <button
              type="button"
              disabled={isDrawing}
              onClick={() => {
                setOnlyPlayed(true);
                setWinnerTicket(null);
              }}
              className={`p-2.5 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                onlyPlayed
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-md ring-2 ring-emerald-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Solo números jugados</span>
              </span>
              <span className={`text-[10px] font-normal ${onlyPlayed ? 'text-emerald-200' : 'text-emerald-700'}`}>
                {paidTickets.length} boletas marcadas con X
              </span>
            </button>
          </div>

          {/* Option: Checkbox to mark only played numbers */}
          <div className="p-3.5 bg-purple-50/80 rounded-2xl border border-purple-200 text-left space-y-2.5">
            <label
              htmlFor="onlyPlayedCheckbox"
              className="flex items-start gap-3 p-2.5 bg-white rounded-xl border border-purple-200 hover:border-purple-300 cursor-pointer transition-all shadow-2xs"
            >
              <input
                type="checkbox"
                id="onlyPlayedCheckbox"
                checked={onlyPlayed}
                disabled={isDrawing}
                onChange={(e) => {
                  setOnlyPlayed(e.target.checked);
                  setWinnerTicket(null);
                }}
                className="w-4 h-4 mt-0.5 accent-purple-700 rounded cursor-pointer shrink-0"
              />
              <div className="flex-1">
                <span className="font-bold text-purple-950 text-xs block">
                  Marcar solo los números jugados
                </span>
                <p className="text-[11px] text-purple-600 leading-snug mt-0.5">
                  {onlyPlayed
                    ? `Activado: La ruleta sortea únicamente entre las ${paidTickets.length} boletas con pago confirmado.`
                    : `Desactivado: La ruleta funciona con todos los ${tickets.length} números (incluso los no jugados).`}
                </p>
              </div>
            </label>

            {/* Sub-option: include reserved */}
            {onlyPlayed && (
              <div className="pl-7 flex items-center justify-between text-xs text-purple-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeReserved}
                    disabled={isDrawing}
                    onChange={(e) => setIncludeReserved(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-600 rounded"
                  />
                  <span className="text-[11px] font-medium text-purple-900">
                    Incluir también números apartados ({reservedTickets.length})
                  </span>
                </label>
              </div>
            )}

            {/* Status Breakdown & Count Bar */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[11px] text-purple-700 border-t border-purple-100">
              <div className="flex items-center gap-2.5">
                <span className="flex items-center gap-1 font-semibold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  {paidTickets.length} jugados
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-800">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  {reservedTickets.length} apartados
                </span>
                <span className="flex items-center gap-1 font-semibold text-purple-600">
                  <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
                  {availableTickets.length} no jugados
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowNumbersList(!showNumbersList)}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-950 flex items-center gap-1"
              >
                {showNumbersList ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showNumbersList ? 'Ocultar' : 'Ver números'}</span>
              </button>
            </div>

            {/* Expandable pool preview */}
            {showNumbersList && (
              <div className="pt-2">
                <div className="p-2.5 bg-white rounded-xl border border-purple-200 max-h-32 overflow-y-auto flex flex-wrap gap-1">
                  {eligibleTickets.map((t) => (
                    <span
                      key={t.number}
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border ${
                        t.status === 'pagado'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : t.status === 'reservado'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                      title={`#${formatTicketNumber(t.number)} - ${t.status}`}
                    >
                      #{formatTicketNumber(t.number)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Big Number Animation Wheel */}
          <div className="py-2 flex flex-col items-center justify-center">
            <div
              className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center font-mono font-black text-5xl sm:text-6xl shadow-2xl transition-all duration-300 border-4 ${
                winnerTicket
                  ? winnerTicket.status === 'pagado'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-300 scale-105 ring-8 ring-emerald-200'
                    : winnerTicket.status === 'reservado'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-300 scale-105 ring-8 ring-blue-200'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-300 scale-105 ring-8 ring-amber-200'
                  : isDrawing
                  ? 'bg-gradient-to-br from-purple-700 to-pink-600 text-white border-pink-400 animate-pulse scale-102'
                  : 'bg-purple-100 text-purple-900 border-purple-300'
              }`}
            >
              {displayNumber !== null ? formatTicketNumber(displayNumber) : '???'}
            </div>

            {isDrawing && (
              <p className="text-xs font-bold uppercase tracking-wider text-pink-600 animate-bounce mt-3 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Girando ruleta ({eligibleTickets.length} números en juego)...</span>
              </p>
            )}
          </div>

          {/* WINNER RESULT: CASE 1 - PAID (CONFIRMED WINNER) */}
          {winnerTicket && winnerTicket.status === 'pagado' && (
            <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-3xl text-left space-y-3 shadow-md animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" /> ¡NÚMERO GANADOR CONFIRMADO!
                </span>
                <span className="text-lg font-mono font-black text-emerald-800">
                  Boleta #{formatTicketNumber(winnerTicket.number)}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Ganador(a):</p>
                <h4 className="text-xl font-black text-purple-950 uppercase">
                  {isAdmin ? winnerTicket.buyerName : maskName(winnerTicket.buyerName)}
                </h4>
                <p className="text-xs text-purple-700 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />{' '}
                  {isAdmin ? winnerTicket.buyerPhone : maskPhone(winnerTicket.buyerPhone)}
                </p>
                {winnerTicket.paymentMethod && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
                    Pago confirmado por: {winnerTicket.paymentMethod}
                  </span>
                )}
              </div>

              {isAdmin && cleanPhone && (
                <a
                  href={winnerWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Notificar al Ganador por WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {/* WINNER RESULT: CASE 2 - UNPLAYED / AVAILABLE (DESIERTO) */}
          {winnerTicket && winnerTicket.status === 'disponible' && (
            <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl text-left space-y-3 shadow-md animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <AlertCircle className="w-3.5 h-3.5" /> NÚMERO NO JUGADO (DESIERTO)
                </span>
                <span className="text-lg font-mono font-black text-amber-900">
                  Boleta #{formatTicketNumber(winnerTicket.number)}
                </span>
              </div>

              <div className="bg-white/90 border border-amber-200 rounded-2xl p-3 space-y-1">
                <h4 className="text-sm font-bold text-amber-950">
                  El número #{formatTicketNumber(winnerTicket.number)} no fue comprado ni jugado
                </h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Esta boleta no tiene comprador asignado. En los sorteos tradicionales, si cae un número no jugado se declara el tiro desierto y se vuelve a girar la ruleta hasta que salga un número jugado, o puedes activar la opción <strong>"Marcar solo los números jugados"</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartDraw}
                  disabled={isDrawing}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Volver a Girar Ruleta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOnlyPlayed(true);
                    setWinnerTicket(null);
                  }}
                  className="px-3.5 py-2.5 bg-purple-100 hover:bg-purple-200 text-purple-900 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Marcar solo jugados
                </button>
              </div>
            </div>
          )}

          {/* WINNER RESULT: CASE 3 - RESERVED (APARTADO) */}
          {winnerTicket && winnerTicket.status === 'reservado' && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-3xl text-left space-y-3 shadow-md animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" /> NÚMERO APARTADO (EN RESERVA)
                </span>
                <span className="text-lg font-mono font-black text-blue-900">
                  Boleta #{formatTicketNumber(winnerTicket.number)}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-blue-800 font-bold">Apartado por:</p>
                <h4 className="text-xl font-bold text-purple-950 uppercase">
                  {isAdmin ? winnerTicket.buyerName : maskName(winnerTicket.buyerName)}
                </h4>
                <p className="text-xs text-purple-700 font-mono mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-600" />{' '}
                  {isAdmin ? winnerTicket.buyerPhone : maskPhone(winnerTicket.buyerPhone)}
                </p>
                <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2 mt-2 leading-tight">
                  ⚠️ Esta boleta está apartada pero no tiene pago confirmado con X. La validez del premio queda sujeta a la confirmación de pago por parte del organizador.
                </p>
              </div>

              {isAdmin && cleanPhone && (
                <a
                  href={winnerWhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar al participante por WhatsApp</span>
                </a>
              )}
            </div>
          )}

          {/* Spin Trigger Button */}
          <div>
            {eligibleTickets.length === 0 ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2">
                <p className="text-xs text-purple-700 font-semibold">
                  No hay boletas disponibles para sortear con el filtro seleccionado.
                </p>
                <button
                  type="button"
                  onClick={() => setOnlyPlayed(false)}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold rounded-xl"
                >
                  Cambiar a todos los números (1 al {tickets.length})
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStartDraw}
                disabled={isDrawing}
                className="w-full py-3.5 bg-gradient-to-r from-purple-700 via-purple-800 to-pink-600 hover:from-purple-800 hover:to-pink-700 disabled:opacity-50 text-white text-sm sm:text-base font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2"
              >
                <Dices className="w-5 h-5" />
                <span>
                  {winnerTicket
                    ? 'Sortear de Nuevo'
                    : `¡GIRAR RULETA (${onlyPlayed ? 'SOLO JUGADOS' : 'TODOS LOS NÚMEROS'})!`}
                </span>
              </button>
            )}
          </div>

          {/* Session Spin History */}
          {spinHistory.length > 0 && (
            <div className="pt-2 text-left space-y-1.5 border-t border-purple-100">
              <span className="text-[10px] uppercase tracking-wider font-bold text-purple-900 flex items-center gap-1">
                <History className="w-3 h-3 text-purple-600" />
                <span>Historial de tiros en esta sesión ({spinHistory.length}):</span>
              </span>
              <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                {spinHistory.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1.5 px-2.5 rounded-lg text-[11px] bg-purple-50/70 border border-purple-100"
                  >
                    <span className="font-mono font-bold text-purple-950">
                      Tiro #{rec.roundNumber}: Boleta #{formatTicketNumber(rec.ticket.number)}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.2 rounded-full text-[10px] ${
                        rec.ticket.status === 'pagado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.ticket.status === 'reservado'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.ticket.status === 'pagado'
                        ? '¡Ganador!'
                        : rec.ticket.status === 'reservado'
                        ? 'Apartado'
                        : 'No jugado'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


