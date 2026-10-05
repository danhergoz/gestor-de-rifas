import { RaffleConfig, Ticket, PaymentRecord } from '../types';

export const DEFAULT_RAFFLE_CONFIG: RaffleConfig = {
  title: 'Rifa Solidaria',
  prize: '$500.000 COP en Efectivo',
  description: 'Estoy realizando esta rifa debido a una calamidad que tuve recientemente y que me ha generado algunos gastos inesperados. Tu apoyo hace la diferencia 💜',
  ticketPrice: 10000,
  currency: 'COP',
  currencySymbol: '$',
  drawDate: '2026-10-10T20:00:00',
  rules: 'El ganador será elegido mediante una RULETA VIRTUAL para un sorteo transparente. Fecha programada: 10 de Octubre (se movería la fecha dependiendo de la venta de boletas). Cada boleta comprada participa en el sorteo en vivo.',
  bankInfo: 'NEQUI: 3188952423\nDAVIPLATA: 3188952423\nLLAVE: @PLATA3188952423  /  @hernadez48602\n(A nombre de Jimena Hernandez)',
  contactPhone: '3188952423',
  totalNumbers: 200,
  organizerName: 'Jimena Hernandez',
  adminPin: '1010',
  authorizedUsers: ['Jimena Hernandez (Organizadora)', 'daniel_hernandez@cun.edu.co'],
  reservationDurationHours: 24, // 1 day limit
};

// The exact 31 marked numbers from the flyer
export const MARKED_FLYER_NUMBERS = [
  7, 8, 11, 12, 13, 14, 16, 17, 18, 19, 20,
  25, 29,
  44, 55,
  67, 71, 74,
  81, 85, 88, 95, 96,
  119,
  127, 128,
  142, 159,
  169, 174, 175
];

const sampleBuyersPool = [
  { name: 'Carolina Gómez', phone: '3188952423', method: 'Nequi' },
  { name: 'Andrés Felipe Ruiz', phone: '3124567890', method: 'Daviplata' },
  { name: 'María Paula Castro', phone: '3157891234', method: 'Llave' },
  { name: 'Juan David Morales', phone: '3009876543', method: 'Nequi' },
  { name: 'Valentina Restrepo', phone: '3182345678', method: 'Nequi' },
  { name: 'Santiago Ramírez', phone: '3113456789', method: 'Daviplata' },
  { name: 'Luisa Fernanda Ortiz', phone: '3145678901', method: 'Llave' },
  { name: 'Daniela Salazar', phone: '3176543210', method: 'Nequi' },
  { name: 'Mateo Álvarez', phone: '3201234567', method: 'Daviplata' },
  { name: 'Camila Torres', phone: '3168765432', method: 'Nequi' },
  { name: 'Felipe Herrera', phone: '3012345678', method: 'Llave' },
  { name: 'Andrea Ríos', phone: '3198765432', method: 'Nequi' },
  { name: 'Sebastián Vargas', phone: '3134567890', method: 'Daviplata' },
  { name: 'Natalia Vega', phone: '3104561234', method: 'Nequi' },
  { name: 'Diego Alejandro Silva', phone: '3127894561', method: 'Llave' },
];

export function generateInitialTickets(): { tickets: Ticket[]; payments: PaymentRecord[] } {
  const tickets: Ticket[] = [];
  const payments: PaymentRecord[] = [];
  const now = new Date();

  for (let i = 1; i <= 200; i++) {
    const isMarked = MARKED_FLYER_NUMBERS.includes(i);

    if (isMarked) {
      const buyerIndex = (i * 7) % sampleBuyersPool.length;
      const buyer = sampleBuyersPool[buyerIndex];
      // Most marked numbers are pagado (paid), some reserved
      const isPaid = i % 5 !== 0; // ~80% paid, 20% reserved
      const hoursAgo = (i % 24) + 1;
      const dateStr = new Date(now.getTime() - hoursAgo * 3600 * 1000).toISOString();

      if (isPaid) {
        tickets.push({
          number: i,
          status: 'pagado',
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          reservedAt: new Date(now.getTime() - (hoursAgo + 2) * 3600 * 1000).toISOString(),
          paidAt: dateStr,
          paymentMethod: buyer.method,
          pricePaid: DEFAULT_RAFFLE_CONFIG.ticketPrice,
          notes: 'Comprobante verificado - Marcado con X en el talonario',
        });

        payments.push({
          id: `pay-${i}-${Date.now()}`,
          ticketNumber: i,
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          amount: DEFAULT_RAFFLE_CONFIG.ticketPrice,
          paymentMethod: buyer.method,
          date: dateStr,
          notes: 'Pago recibido y confirmado',
          referenceNumber: `REF-${10000 + i}`,
        });
      } else {
        const reservedDate = new Date(now.getTime() - hoursAgo * 3600 * 1000);
        const expiresDate = new Date(reservedDate.getTime() + 24 * 3600 * 1000);
        tickets.push({
          number: i,
          status: 'reservado',
          buyerName: buyer.name,
          buyerPhone: buyer.phone,
          reservedAt: reservedDate.toISOString(),
          expiresAt: expiresDate.toISOString(),
          notes: 'Apartado - Plazo de 24 horas para enviar comprobante',
        });
      }
    } else {
      tickets.push({
        number: i,
        status: 'disponible',
      });
    }
  }

  return { tickets, payments };
}
