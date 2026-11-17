import { CurrencyCode } from '../types/rental';

export function formatCurrency(amount: number, currency: CurrencyCode = 'NAD'): string {
  const rounded = Math.round(amount).toLocaleString('en-US');
  switch (currency) {
    case 'ZAR':
      return `R${rounded}`;
    case 'BWP':
      return `P${rounded}`;
    case 'USD':
      return `US$${rounded}`;
    case 'NAD':
    default:
      return `N$${rounded}`;
  }
}

export function formatNad(amount: number): string {
  return formatCurrency(amount, 'NAD');
}

export function formatCompactSalary(amount: number, currency: CurrencyCode = 'NAD'): string {
  const prefix =
    currency === 'ZAR'
      ? 'R'
      : currency === 'BWP'
        ? 'P'
        : currency === 'USD'
          ? 'US$'
          : 'N$';
  if (amount >= 1000) {
    const k = amount / 1000;
    return `${prefix}${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return `${prefix}${amount}`;
}

export function diffNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

export function datesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  return startA < endB && endA > startB;
}

export function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatReadableDate(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
