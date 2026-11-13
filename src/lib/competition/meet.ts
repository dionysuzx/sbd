import { daysBetween, type CalendarDate } from '#lib/calendar-date.js';

export type Meet = { readonly name: string; readonly date: CalendarDate };

export type Countdown =
	| { readonly kind: 'upcoming'; readonly days: number; readonly weeks: number }
	| { readonly kind: 'meet-day' }
	| { readonly kind: 'over' };

export function countdownTo(meet: Meet, today: CalendarDate): Countdown {
	const days = daysBetween(today, meet.date);
	if (days > 0) return { kind: 'upcoming', days, weeks: days / 7 };
	return days === 0 ? { kind: 'meet-day' } : { kind: 'over' };
}
