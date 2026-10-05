export type TicketStatus = 'disponible' | 'reservado' | 'pagado';

export interface Ticket {
  number: number;
  status: TicketStatus;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  reservedAt?: string; // ISO string
  expiresAt?: string; // ISO string (24 hours after reservation)
  paidAt?: string; // ISO string
  paymentMethod?: string;
  pricePaid?: number;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  ticketNumber: number;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  paymentMethod: string;
  date: string; // ISO string
  notes?: string;
  referenceNumber?: string;
}

export interface RaffleConfig {
  title: string;
  prize: string;
  description: string;
  ticketPrice: number;
  currency: string;
  currencySymbol: string;
  drawDate: string;
  rules: string;
  bankInfo: string;
  contactPhone: string;
  totalNumbers: number;
  organizerName: string;
  adminPin: string; // PIN for admin access
  authorizedUsers?: string[]; // List of authorized user emails or names
  reservationDurationHours: number; // Default 24 hours (1 day)
}

export type ViewTab = 'cuadricula' | 'tabla' | 'historial' | 'sorteo';

