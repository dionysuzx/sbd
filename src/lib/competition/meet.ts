import { daysBetween, type CalendarDate } from '#lib/calendar-date.js';

export type Meet = {
	readonly name: string;
	readonly date: CalendarDate;
	readonly url?: string;
};

export type Countdown =
	| { readonly kind: 'upcoming'; readonly days: number; readonly weeks: number }
	| { readonly kind: 'meet-day' }
	| { readonly kind: 'over' };

export type CountdownLabel =
	{ readonly kind: 'upcoming'; readonly weeks: string } | { readonly kind: 'meet-day' };

export function countdownTo(meet: Meet, today: CalendarDate): Countdown {
	const days = daysBetween(today, meet.date);
	if (days > 0) return { kind: 'upcoming', days, weeks: days / 7 };
	return days === 0 ? { kind: 'meet-day' } : { kind: 'over' };
}

export function describeCountdown(meet: Meet, today: CalendarDate): CountdownLabel | undefined {
	const countdown = countdownTo(meet, today);
	switch (countdown.kind) {
		case 'upcoming':
			return { kind: 'upcoming', weeks: `${countdown.weeks.toFixed(1)} weeks out to` };
		case 'meet-day':
			return { kind: 'meet-day' };
		case 'over':
			return undefined;
	}
}
