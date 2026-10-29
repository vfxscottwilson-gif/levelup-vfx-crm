import { format, parse, isValid, isAfter } from 'date-fns';

/**
 * Formats a Date object or ISO string to 12-hour format: "hh:mm a" (e.g., "09:30 AM")
 */
export function formatTime12Hour(date: Date | string | number | null | undefined): string {
  if (!date) return '--:-- --';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(d)) return '--:-- --';
  return format(d, 'hh:mm a');
}

/**
 * Formats a Date object or ISO string to full date + 12-hour time: "MMM dd, yyyy - hh:mm a"
 */
export function formatDateTime12Hour(date: Date | string | number | null | undefined): string {
  if (!date) return '--';
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!isValid(d)) return '--';
  return format(d, 'MMM dd, yyyy - hh:mm a');
}

/**
 * Formats a Date to date only: "MMM dd, yyyy"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '--';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!isValid(d)) return '--';
  return format(d, 'MMM dd, yyyy');
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Converts "hh:mm a" (e.g. "09:30 AM" or "02:15 PM") to minutes from midnight
 */
export function parse12HourToMinutes(timeStr: string): number {
  try {
    const parsed = parse(timeStr.trim().toUpperCase(), 'hh:mm a', new Date());
    if (!isValid(parsed)) return 0;
    return parsed.getHours() * 60 + parsed.getMinutes();
  } catch {
    return 0;
  }
}

/**
 * Converts minutes from midnight into 12-hour format "hh:mm a"
 */
export function minutesTo12Hour(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normalized / 60);
  const mins = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const strHours = String(hours12).padStart(2, '0');
  const strMins = String(mins).padStart(2, '0');
  return `${strHours}:${strMins} ${period}`;
}

/**
 * Formats elapsed seconds to HH:MM:SS
 */
export function formatElapsedSeconds(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

/**
 * Formats minutes to readable "Xh Ym" or "Ym"
 */
export function formatMinutesHuman(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**
 * Validates From/To time range
 */
export function validateTimeRange(fromStr: string, toStr: string): { isValid: boolean; error?: string; minutes: number } {
  const fromMins = parse12HourToMinutes(fromStr);
  const toMins = parse12HourToMinutes(toStr);

  if (toMins <= fromMins) {
    return {
      isValid: false,
      error: 'End time must be after Start time.',
      minutes: 0,
    };
  }

  const duration = toMins - fromMins;
  return {
    isValid: true,
    minutes: duration,
  };
}

/**
 * Checks if a proposed from/to range overlaps with existing reports of the day
 */
export function hasOverlappingReport(
  fromStr: string,
  toStr: string,
  existingReports: { fromTime: string; toTime: string; id: string }[],
  ignoreReportId?: string
): boolean {
  const newStart = parse12HourToMinutes(fromStr);
  const newEnd = parse12HourToMinutes(toStr);

  for (const report of existingReports) {
    if (ignoreReportId && report.id === ignoreReportId) continue;
    const existingStart = parse12HourToMinutes(report.fromTime);
    const existingEnd = parse12HourToMinutes(report.toTime);

    // Overlap occurs if newStart < existingEnd AND newEnd > existingStart
    if (newStart < existingEnd && newEnd > existingStart) {
      return true;
    }
  }

  return false;
}
