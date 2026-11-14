import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '#lib/calendar-date.js';
import { countdownTo, describeCountdown, type Meet } from './meet.js';

const meet: Meet = { name: 'King Prime Classic', date: '2026-12-12' as CalendarDate };
const on = (date: string) => countdownTo(meet, date as CalendarDate);

describe('countdownTo', () => {
	it('counts whole days and fractional weeks until the meet', () => {
		expect(on('2026-11-13')).toEqual({ kind: 'upcoming', days: 29, weeks: 29 / 7 });
	});

	it('recognizes meet day and the days after it', () => {
		expect(on('2026-12-12')).toEqual({ kind: 'meet-day' });
		expect(on('2026-12-13')).toEqual({ kind: 'over' });
	});
});

describe('describeCountdown', () => {
	it('names only the fractional weeks remaining and the dotted meet date', () => {
		expect(describeCountdown(meet, '2026-11-13' as CalendarDate)).toEqual({
			kind: 'upcoming',
			weeks: '4.1 weeks out',
			date: '(26.12.12)'
		});
		expect(describeCountdown(meet, '2026-11-14' as CalendarDate)).toEqual({
			kind: 'upcoming',
			weeks: '4.0 weeks out',
			date: '(26.12.12)'
		});
	});

	it('derives the dotted date from the meet date', () => {
		const later: Meet = { name: 'Other', date: '2027-01-03' as CalendarDate };
		expect(describeCountdown(later, '2026-12-20' as CalendarDate)).toEqual({
			kind: 'upcoming',
			weeks: '2.0 weeks out',
			date: '(27.01.03)'
		});
	});

	it('names meet day and stays silent afterward', () => {
		expect(describeCountdown(meet, '2026-12-12' as CalendarDate)).toEqual({ kind: 'meet-day' });
		expect(describeCountdown(meet, '2026-12-13' as CalendarDate)).toBeUndefined();
	});
});
