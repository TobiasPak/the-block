import rawData from '../../data/vehicles.json';

const timestamps = (rawData as Array<{ auction_start: string }>).map(
  (v) => new Date(v.auction_start).getTime(),
);
const MIN_TS = Math.min(...timestamps);
const MAX_TS = Math.max(...timestamps);
const TS_RANGE = MAX_TS - MIN_TS || 1;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatOdometer(km: number): string {
  return `${km.toLocaleString('en-US')} km`;
}

export function formatConditionGrade(grade: number): string {
  return `${grade.toFixed(1)} / 5.0`;
}

export function getConditionLabel(grade: number): string {
  if (grade >= 4.5) return 'Excellent';
  if (grade >= 3.5) return 'Good';
  if (grade >= 2.5) return 'Fair';
  return 'Poor';
}

export function normalizeAuctionStart(isoString: string): Date {
  const ts = new Date(isoString).getTime();
  const position = (ts - MIN_TS) / TS_RANGE;
  return new Date(Date.now() + position * SEVEN_DAYS_MS);
}
