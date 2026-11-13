import { describe, expect, it } from 'vitest';
import {
	dayNumber,
	formatLongDate,
	isMonday,
	localCalendarDate,
	type CalendarDate
} from './calendar-date.js';

describe('calendar dates', () => {
	it('reads the local calendar day of an instant', () => {
		expect(localCalendarDate(new Date(2026, 10, 13, 23, 59))).toBe('2026-11-13');
	});

	it('finds Mondays by day number', () => {
		const mondays = ['2026-11-09', '2026-11-16'].map((date) => dayNumber(date as CalendarDate));
		expect(mondays.every(isMonday)).toBe(true);
		expect(isMonday(dayNumber('2026-11-13' as CalendarDate))).toBe(false);
	});

	it('formats without shifting across time zones', () => {
		expect(formatLongDate('2026-11-09' as CalendarDate)).toBe('Mon, Nov 9, 2026');
	});
});
