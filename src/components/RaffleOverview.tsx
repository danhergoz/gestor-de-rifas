import React, { useState } from 'react';
import {
  Heart,
  Sparkles,
  Ticket as TicketIcon,
  Smartphone,
  Dices,
  Calendar,
  Copy,
  Check,
  Phone,
  ShieldAlert,
  Coins,
  Gift,
} from 'lucide-react';
import { RaffleConfig } from '../types';

interface RaffleOverviewProps {
  config: RaffleConfig;
  isAdmin: boolean;
  onOpenReservationModal?: () => void;
}

export const RaffleOverview: React.FC<RaffleOverviewProps> = ({ config, isAdmin }) => {
  const [copiedBank, setCopiedBank] = useState(false);

  const handleCopyBank = () => {
    navigator.clipboard.writeText(
      `Nequi: 3188952423\nDaviplata: 3188952423\nLlave: @PLATA3188952423 / @hernadez48602 (Jimena Hernandez)`
    );
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2500);
  };

  return (
    <div className="space-y-5 mb-6">
      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-purple-900 text-purple-100 rounded-2xl p-3 px-5 flex items-center justify-between shadow-md border border-purple-800">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <ShieldAlert className="w-4 h-4 text-pink-400 shrink-0" />
            <span>
              Estás en <strong className="text-white">Modo Administrador</strong>: Puedes marcar boletas con la X roja, registrar pagos y gestionar números.
            </span>
          </div>
          <span className="text-[10px] px-2.5 py-1 bg-pink-500 text-white rounded-full font-bold uppercase tracking-wider shrink-0 shadow-xs">
            Admin Activo
          </span>
        </div>
      )}

      {/* Main Flyer Showcase Banner */}
      <div className="relative bg-gradient-to-br from-white via-purple-50/70 to-pink-50/50 rounded-3xl p-5 sm:p-7 border-2 border-purple-200 shadow-xl overflow-hidden">
        {/* Decorative background sparkles and shapes */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-pink-200/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left / Center Section: Flyer Header & Story */}
          <div className="lg:col-span-7 space-y-4">
            {/* Title with Calligraphy and cute hearts */}
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Heart className="w-6 h-6 text-purple-600 fill-purple-500 animate-pulse" />
                <h1 className="font-script text-4xl sm:text-5xl lg:text-6xl text-purple-900 leading-tight drop-shadow-xs">
                  Rifa <span className="text-pink-600 font-script">solidaria</span>
                </h1>
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>

              {/* Subtitle pill */}
              <div className="inline-block">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-purple-700/20 tracking-wide">
                  Tu apoyo hace la diferencia <Heart className="w-3.5 h-3.5 fill-pink-300 text-pink-300 inline" />
                </span>
              </div>
            </div>

            {/* Story Message Card */}
            <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 sm:p-5 border border-purple-200 shadow-xs flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0 mt-0.5">
                <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              </div>
              <p className="text-xs sm:text-sm text-purple-950 font-medium leading-relaxed">
                Estoy realizando esta rifa debido a una <strong className="text-purple-900 font-bold">calamidad</strong> que tuve recientemente y que me ha generado algunos gastos inesperados. ¡Muchas gracias por tu valiosa colaboración!
              </p>
            </div>

            {/* 4 Feature Highlights (Matching the flyer pills) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {/* Feature 1: Ticket range */}
              <div className="bg-white/80 rounded-2xl p-3 border border-purple-100 text-center flex flex-col items-center justify-between shadow-xs hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-1">
                  <TicketIcon className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-purple-600 font-medium">Elige tu número</span>
                <span className="text-[11px] font-black uppercase text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md mt-1">
                  DEL 1 AL 200
                </span>
              </div>

              {/* Feature 2: Payment apps */}
              <div className="bg-white/80 rounded-2xl p-3 border border-purple-100 text-center flex flex-col items-center justify-between shadow-xs hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-1">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[10px] text-purple-600 font-medium">Paga por</span>
                <span className="text-[10px] font-bold text-pink-700 leading-tight mt-0.5">
                  Nequi, Daviplata o Llave
                </span>
              </div>

              {/* Feature 3: Virtual Roulette */}
              <div className="bg-white/80 rounded-2xl p-3 border border-purple-100 text-center flex flex-col items-center justify-between shadow-xs hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
                  <Dices className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-purple-600 font-medium leading-tight">Ganador con</span>
                <span className="text-[10px] font-black uppercase text-white bg-pink-600 px-2 py-0.5 rounded-md mt-0.5 tracking-tight shadow-xs">
                  RULETA VIRTUAL
                </span>
              </div>

              {/* Feature 4: Date */}
              <div className="bg-white/80 rounded-2xl p-3 border border-purple-100 text-center flex flex-col items-center justify-between shadow-xs hover:border-purple-300 transition-all">
                <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[9px] text-purple-600 font-bold uppercase">FECHA DEL SORTEO</span>
                <span className="text-[10px] font-black uppercase text-white bg-purple-700 px-1.5 py-0.5 rounded-md mt-0.5">
                  10 DE OCTUBRE
                </span>
              </div>
            </div>
          </div>

          {/* Right Section: Prize Box with ribbon bow & Money Bag */}
          <div className="lg:col-span-5">
            <div className="relative bg-gradient-to-b from-white to-purple-50 rounded-3xl p-6 border-2 border-purple-300 shadow-lg text-center space-y-3">
              {/* Cute top ribbon bow icon */}
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-purple-700 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-pink-300" />
                <span>GRAN PREMIO</span>
              </div>

              {/* Pink Pill: PREMIO */}
              <div className="pt-2">
                <span className="inline-block px-5 py-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-full shadow-sm">
                  PREMIO
                </span>
              </div>

              {/* Big Prize Amount: $500.000 COP */}
              <div>
                <div className="text-4xl sm:text-5xl font-black text-purple-950 tracking-tight font-soft">
                  $500.000
                </div>
                <span className="inline-block px-3.5 py-0.5 bg-pink-100 text-pink-700 font-black text-xs rounded-full mt-1">
                  COP EN EFECTIVO
                </span>
              </div>

              {/* Ticket Value badge */}
              <div className="bg-purple-100/80 rounded-2xl p-3 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-900 text-xs font-bold">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>Valor de la Boleta:</span>
                </div>
                <span className="text-base font-black text-purple-900 font-mono">
                  $10.000 COP
                </span>
              </div>

              {/* Quick WhatsApp contact */}
              <a
                href="https://wa.me/573188952423?text=Hola%20Jimena!%20Deseo%20apoyarte%20y%20comprar%20una%20boleta%20de%20la%20Rifa%20Solidaria."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Phone className="w-4 h-4" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Medios de Pago & ¡Mucha Suerte! banner */}
        <div className="mt-6 pt-5 border-t border-purple-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Medios de Pago container */}
          <div className="md:col-span-8 bg-white/90 rounded-2xl p-4 border border-purple-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-white bg-purple-700 px-3 py-1 rounded-full shadow-xs">
                MEDIOS DE PAGO
              </span>
              <button
                onClick={handleCopyBank}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-purple-100 hover:bg-purple-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                title="Copiar datos de pago"
              >
                {copiedBank ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar cuentas</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Nequi */}
              <div className="bg-purple-50/80 p-2.5 rounded-xl border border-purple-100 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">NEQUI</span>
                <span className="text-sm font-black font-mono text-pink-700 mt-1">3188952423</span>
                <span className="text-[10px] text-purple-600 mt-0.5">Jimena Hernandez</span>
              </div>

              {/* Daviplata */}
              <div className="bg-pink-50/80 p-2.5 rounded-xl border border-pink-100 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-pink-800 tracking-wider">DAVIPLATA</span>
                <span className="text-sm font-black font-mono text-purple-800 mt-1">3188952423</span>
                <span className="text-[10px] text-pink-600 mt-0.5">Jimena Hernandez</span>
              </div>

              {/* Llave */}
              <div className="bg-violet-50/80 p-2.5 rounded-xl border border-violet-100 flex flex-col justify-between">
                <span className="text-[10px] font-black uppercase text-purple-900 tracking-wider">LLAVE</span>
                <span className="text-[11px] font-bold font-mono text-purple-950 mt-1 truncate">
                  @PLATA3188952423
                </span>
                <span className="text-[10px] text-purple-600 truncate">@hernadez48602</span>
              </div>
            </div>
          </div>

          {/* ¡Mucha Suerte! callout */}
          <div className="md:col-span-4 bg-gradient-to-r from-purple-700 to-pink-600 rounded-2xl p-4 text-white text-center flex flex-col items-center justify-center shadow-md relative overflow-hidden">
            <Sparkles className="w-5 h-5 text-amber-300 absolute top-2 right-2 animate-bounce" />
            <h3 className="font-script text-3xl sm:text-4xl drop-shadow-sm">
              ¡Mucha suerte!
            </h3>
            <p className="text-xs text-purple-100 font-medium mt-1">
              💜 Gracias por tu apoyo, significa muchísimo 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
