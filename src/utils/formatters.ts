export function formatCurrency(amount: number, currency: string = 'COP', symbol: string = '$'): string {
  return `${symbol} ${amount.toLocaleString('es-CO')}`;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatTicketNumber(num: number): string {
  return num.toString().padStart(3, '0');
}

export function maskName(name?: string): string {
  if (!name || name.trim() === '') return 'Participante';
  const parts = name.trim().split(' ');
  return parts
    .map((part) => {
      if (part.length <= 2) return part[0] + '•';
      return part[0] + '•'.repeat(Math.min(part.length - 1, 5));
    })
    .join(' ');
}

export function maskPhone(phone?: string): string {
  if (!phone || phone.trim() === '') return '••• ••• ••••';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 4) return '••• ••• ••••';
  const start = clean.slice(0, 3);
  const end = clean.slice(-2);
  return `${start} ••• ••${end}`;
}

export interface TimeRemainingResult {
  formatted: string;
  isExpired: boolean;
  hoursLeft: number;
  minutesLeft: number;
  percentRemaining: number;
}

export function getTimeRemaining(
  expiresAt?: string,
  reservedAt?: string,
  hoursLimit: number = 24
): TimeRemainingResult {
  if (!expiresAt && !reservedAt) {
    return {
      formatted: '24h 00m',
      isExpired: false,
      hoursLeft: 24,
      minutesLeft: 0,
      percentRemaining: 100,
    };
  }

  const now = Date.now();
  let targetTime: number;

  if (expiresAt) {
    targetTime = new Date(expiresAt).getTime();
  } else if (reservedAt) {
    targetTime = new Date(reservedAt).getTime() + hoursLimit * 3600 * 1000;
  } else {
    targetTime = now + hoursLimit * 3600 * 1000;
  }

  const totalDurationMs = hoursLimit * 3600 * 1000;
  const diff = targetTime - now;

  if (diff <= 0) {
    return {
      formatted: 'Expirado (plazo vencido)',
      isExpired: true,
      hoursLeft: 0,
      minutesLeft: 0,
      percentRemaining: 0,
    };
  }

  const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
  const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const percentRemaining = Math.max(0, Math.min(100, Math.round((diff / totalDurationMs) * 100)));

  const formatted = `${hoursLeft}h ${minutesLeft.toString().padStart(2, '0')}m restantes`;

  return {
    formatted,
    isExpired: false,
    hoursLeft,
    minutesLeft,
    percentRemaining,
  };
}

export function generateWhatsAppMessage(
  tickets: number[],
  name: string,
  totalPrice: number,
  bankInfo: string,
  raffleTitle: string
): string {
  const numsStr = tickets.map(formatTicketNumber).join(', ');
  const message = `👋 ¡Hola! He apartado el/los número(s) *${numsStr}* para la *${raffleTitle}*.\n\n👤 *Nombre:* ${name}\n💰 *Valor total:* $${totalPrice.toLocaleString('es-CO')}\n⏰ *Plazo de pago:* 24 horas (1 día)\n\nAdjunto aquí el comprobante de pago según los datos de transferencia:\n${bankInfo}\n\n¡Muchas gracias por tu apoyo!`;
  return encodeURIComponent(message);
}

export function exportTicketsToCSV(tickets: any[], raffleTitle: string) {
  const headers = ['Número', 'Estado', 'Comprador', 'Teléfono', 'Fecha Reserva', 'Fecha Pago', 'Método Pago', 'Valor Pagado', 'Notas'];
  const rows = tickets.map((t) => [
    formatTicketNumber(t.number),
    t.status.toUpperCase(),
    t.buyerName ? `"${t.buyerName.replace(/"/g, '""')}"` : '""',
    t.buyerPhone ? `"${t.buyerPhone}"` : '""',
    t.reservedAt ? `"${formatDate(t.reservedAt)}"` : '""',
    t.paidAt ? `"${formatDate(t.paidAt)}"` : '""',
    t.paymentMethod ? `"${t.paymentMethod}"` : '""',
    t.pricePaid ? t.pricePaid : 0,
    t.notes ? `"${t.notes.replace(/"/g, '""')}"` : '""',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rifa_${raffleTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
