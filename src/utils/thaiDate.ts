export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export const LAB_NORMALS: Record<string, { min: number | null; max: number | null; unit: string }> = {
  FBS: { min: 70, max: 110, unit: 'mg/dL' },
  HBA1C: { min: 4.8, max: 6.0, unit: '%' },
  BUN: { min: 9, max: 19, unit: 'mg/dL' },
  CR: { min: 0.5, max: 1.5, unit: 'mg/dL' },
  TC: { min: 150, max: 200, unit: 'mg/dL' },
  TG: { min: 0, max: 170, unit: 'mg/dL' },
  HDL: { min: 35, max: 95, unit: 'mg/dL' },
  LDL: { min: 0, max: 130, unit: 'mg/dL' },
  EGFR: { min: 60, max: null, unit: 'mL/min/1.73m²' }
};

export function formatHN(hn: string | number | undefined | null): string {
  if (!hn) return '-';
  const clean = String(hn).replace(/\D/g, '');
  return clean || '-';
}

export function formatCID(cid: string | undefined | null): string {
  if (!cid) return '-';
  const clean = String(cid).replace(/\D/g, '');
  if (clean.length === 13) {
    return clean.replace(/^(\d)(\d{4})(\d{5})(\d{2})(\d)$/, '$1-$2-$3-$4-$5');
  }
  return clean;
}

export function formatPhone(phone: string | undefined | null): string {
  if (!phone) return '-';
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length === 10) {
    return clean.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
  }
  return clean || '-';
}

/**
 * Format any date string to Thai B.E. (พ.ศ.) display: dd/mm/yyyy
 */
export function formatThaiDateBE(rawVal: string | Date | undefined | null): string {
  if (!rawVal) return '-';
  const s = String(rawVal).trim();
  if (!s || s === '-' || s === 'null') return '-';

  // If already dd/mm/yyyy where year > 2400
  const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slashMatch) {
    const d = parseInt(slashMatch[1], 10);
    const m = parseInt(slashMatch[2], 10);
    let y = parseInt(slashMatch[3], 10);
    if (y < 100) y += 2500;
    if (y < 2400) y += 543;
    return `${d}/${m}/${y}`;
  }

  // If ISO YYYY-MM-DD
  const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    let y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    const d = parseInt(isoMatch[3], 10);
    if (y < 2400) y += 543;
    return `${d}/${m}/${y}`;
  }

  return s;
}

export function formatThaiDateLong(rawVal: string | Date | undefined | null): string {
  if (!rawVal) return '-';
  const s = String(rawVal).trim();
  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  const slashMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (slashMatch) {
    day = parseInt(slashMatch[1], 10);
    month = parseInt(slashMatch[2], 10);
    year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2500;
    if (year < 2400) year += 543;
  } else {
    const isoMatch = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      year = parseInt(isoMatch[1], 10);
      month = parseInt(isoMatch[2], 10);
      day = parseInt(isoMatch[3], 10);
      if (year < 2400) year += 543;
    }
  }

  if (day && month && year && month >= 1 && month <= 12) {
    return `${day} ${THAI_MONTHS_FULL[month - 1]} ${year}`;
  }
  return formatThaiDateBE(rawVal);
}

/**
 * Get Thai Fiscal Year (ปีงบประมาณ เริ่ม 1 ต.ค. - 30 ก.ย.)
 */
export function getFiscalYear(dateStr: string | undefined | null): string | null {
  if (!dateStr) return null;
  let month: number | null = null;
  let year: number | null = null;

  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length >= 3) {
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }
  } else if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
    }
  }

  if (!month || !year || isNaN(month) || isNaN(year)) return null;
  if (year < 2400) year += 543; // Ensure Thai BE year

  // If Oct-Dec, fiscal year is the next year
  const fiscalYear = month >= 10 ? year + 1 : year;
  return fiscalYear.toString();
}

/**
 * Evaluate lab test value against normal ranges
 */
export function checkLabStatus(value: string | number | undefined | null, testName: string): {
  status: 'normal' | 'high' | 'low' | 'unknown';
  badgeClass: string;
  label: string;
} {
  if (value === undefined || value === null || value === '' || value === '-') {
    return { status: 'unknown', badgeClass: 'bg-slate-100 text-slate-500', label: '-' };
  }

  const num = typeof value === 'number' ? value : parseFloat(String(value).trim());
  if (isNaN(num)) {
    return { status: 'unknown', badgeClass: 'bg-slate-100 text-slate-500', label: String(value) };
  }

  const normal = LAB_NORMALS[testName.toUpperCase()];
  if (!normal) {
    return { status: 'unknown', badgeClass: 'bg-slate-100 text-slate-600', label: 'ปกติ' };
  }

  if (normal.max !== null && num > normal.max) {
    return { status: 'high', badgeClass: 'bg-rose-100 text-rose-700 border border-rose-200 font-semibold', label: 'สูงกว่าปกติ' };
  }
  if (normal.min !== null && num < normal.min) {
    return { status: 'low', badgeClass: 'bg-amber-100 text-amber-800 border border-amber-200 font-semibold', label: 'ต่ำกว่าปกติ' };
  }

  return { status: 'normal', badgeClass: 'bg-emerald-50 text-emerald-700', label: 'ปกติ' };
}
