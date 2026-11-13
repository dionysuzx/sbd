import type { z } from 'zod';

export type CalendarDate = string & z.$brand<'CalendarDate'>;

const MS_PER_DAY = 86_400_000;

export function dayNumber(date: CalendarDate): number {
	return Date.parse(date) / MS_PER_DAY;
}

const FIRST_MONDAY_SINCE_EPOCH = 4;

export function isMonday(day: number): boolean {
	return (((day - FIRST_MONDAY_SINCE_EPOCH) % 7) + 7) % 7 === 0;
}

export function daysBetween(from: CalendarDate, to: CalendarDate): number {
	return dayNumber(to) - dayNumber(from);
}

export function localCalendarDate(instant: Date): CalendarDate {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}` as CalendarDate;
}

export function latest(dates: readonly CalendarDate[]): CalendarDate | undefined {
	return dates.reduce<CalendarDate | undefined>(
		(max, date) => (max === undefined || date > max ? date : max),
		undefined
	);
}

const dayFormatter = (options: Intl.DateTimeFormatOptions) => {
	const formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' });
	return (day: number) => formatter.format(day * MS_PER_DAY);
};

const formatLongDay = dayFormatter({
	weekday: 'short',
	month: 'short',
	day: 'numeric',
	year: 'numeric'
});
const formatWeekdayDay = dayFormatter({ weekday: 'short', month: 'short', day: 'numeric' });

export const formatShortDay = dayFormatter({ month: 'short', day: 'numeric' });
export const formatLongDate = (date: CalendarDate) => formatLongDay(dayNumber(date));
export const formatWeekdayDate = (date: CalendarDate) => formatWeekdayDay(dayNumber(date));
