import type { BirthInfo } from '@/lib/ziwei/types';
import { branchFromSolarMinutes, equationOfTimeMinutes, isValidGregorianDate, resolveZiweiDayOffset, shiftGregorianDate } from '@/lib/ziwei/true-solar-time';

export interface InternationalBirthForm {
  name: string; date: string; time: string; gender: 'male' | 'female';
  mode: 'clock' | 'branch'; branch: string; solar: boolean; offset: string; longitude: string;
  late: 'next-day' | 'current-day';
}
export const EMPTY_FORM: InternationalBirthForm = {
  name: '', date: '', time: '', gender: 'male', mode: 'clock', branch: '', solar: false, offset: '', longitude: '', late: 'next-day',
};
export type BirthError = 'invalidDate' | 'invalidTime' | 'invalidSolar';
export class BirthValidationError extends Error {
  constructor(public readonly code: BirthError) { super(code); }
}
export interface PreparedBirth {
  info: BirthInfo;
  clock: string | null;
  originalDate: string;
  correctionMinutes: number;
}
const pad = (n: number) => String(n).padStart(2, '0');
export const isoDate = (date: { year: number; month: number; day: number }) => `${date.year}-${pad(date.month)}-${pad(date.day)}`;

/** The upstream engine accepts an already-corrected Gregorian date + branch.
 * Normalize here once, never by changing the engine's language/global state.
 * UTC offset is explicit (including historical DST); no geographical inference.
 */
export function prepareBirth(form: InternationalBirthForm): PreparedBirth {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) throw new BirthValidationError('invalidDate');
  const [year, month, day] = form.date.split('-').map(Number);
  if (year < 1900 || year > 2050 || !isValidGregorianDate(year, month, day)) throw new BirthValidationError('invalidDate');
  let date = { year, month, day };
  let branch: number;
  let clock: string | null = null;
  let correctionMinutes = 0;
  if (form.mode === 'branch') {
    branch = Number(form.branch);
    if (form.branch === '' || !Number.isInteger(branch) || branch < 0 || branch > 11) throw new BirthValidationError('invalidTime');
  } else {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(form.time)) throw new BirthValidationError('invalidTime');
    const [hour, minute] = form.time.split(':').map(Number);
    if (form.solar) {
      const offset = Number(form.offset);
      const longitude = Number(form.longitude);
      if (!form.offset.trim() || !form.longitude.trim() || !Number.isFinite(offset) || !Number.isFinite(longitude) || offset < -12 || offset > 14 || longitude < -180 || longitude > 180) throw new BirthValidationError('invalidSolar');
      // Local mean solar time = local wall clock - UTC offset + longitude / 15.
      correctionMinutes = longitude * 4 - offset * 60 + equationOfTimeMinutes(year, month, day, hour, minute);
    }
    const seconds = Math.round((hour * 60 + minute + correctionMinutes) * 60);
    const dayOffset = Math.floor(seconds / 86400);
    const normalizedMinutes = ((seconds % 86400) + 86400) % 86400 / 60;
    branch = branchFromSolarMinutes(normalizedMinutes);
    date = shiftGregorianDate(date, resolveZiweiDayOffset({ dayOffset, normalizedMinutes, branch }, form.late));
    clock = `${pad(Math.floor(normalizedMinutes / 60))}:${pad(Math.floor(normalizedMinutes % 60))}:${pad(Math.round(normalizedMinutes * 60) % 60)}`;
  }
  // Corrections near the supported range must not silently escape that range.
  if (date.year < 1900 || date.year > 2050) throw new BirthValidationError('invalidDate');
  return { info: { ...date, hour: branch, gender: form.gender, ...(form.name.trim() ? { name: form.name.trim() } : {}) }, clock, originalDate: form.date, correctionMinutes };
}
