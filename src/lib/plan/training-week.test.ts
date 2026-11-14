import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '#lib/calendar-date.js';
import type { Meet } from '#lib/competition/meet.js';
import { ProgramWeeks } from '#lib/data-files/program-weeks.js';
import { describeDose, describeRpe, describeWeek, weekIndexFor } from './training-week.js';

const meet: Meet = { name: 'King Prime Classic', date: '2026-12-12' as CalendarDate };

const weeks = ProgramWeeks.parse([
	{ start: '2026-11-23', phase: 'build', days: [] },
	{ start: '2026-11-30', phase: 'taper', days: [] },
	{ start: '2026-12-07', phase: 'meet-week', days: [] }
]);

const indexOn = (date: string) => weekIndexFor(weeks, date as CalendarDate);

describe('weekIndexFor', () => {
	it('picks the week containing today, Monday through Sunday', () => {
		expect(indexOn('2026-11-30')).toBe(1);
		expect(indexOn('2026-12-06')).toBe(1);
		expect(indexOn('2026-12-07')).toBe(2);
	});

	it('clamps to the first or last week outside the plan', () => {
		expect(indexOn('2026-11-01')).toBe(0);
		expect(indexOn('2027-01-04')).toBe(2);
	});
});

describe('describeWeek', () => {
	it('labels the date range, phase, and whole weeks until the meet', () => {
		expect(weeks.map((week) => describeWeek(week, meet))).toEqual([
			'Nov 23 – 29 · Build · 2 weeks out',
			'Nov 30 – Dec 6 · Taper · 1 week out',
			'Dec 7 – 13 · Meet week'
		]);
	});
});

describe('prescriptions', () => {
	const [week] = ProgramWeeks.parse([
		{
			start: '2026-11-16',
			phase: 'build',
			days: [
				{
					date: '2026-11-16',
					title: 'Squat',
					work: [
						{ exercise: 'squat', sets: 2, reps: 8, rpe: '<=8' },
						{ exercise: 'copenhagen', sets: 3, seconds: 30 },
						{ exercise: 'bird-dog-row', sets: 3, reps: 8, rpe: '7-8' },
						{ exercise: 'pull-up', sets: 4, reps: '8-10', rpe: 8.5 }
					]
				}
			]
		}
	]);
	const work = week.days[0]!.work;

	it('describes sets and reps, per side and in seconds where the exercise needs it', () => {
		expect(work.map(describeDose)).toEqual(['2 × 8', '3 × 30s/side', '3 × 8/side', '4 × 8–10']);
	});

	it('describes RPE targets as exact, ranges, or caps', () => {
		expect(work.map((item) => item.rpe && describeRpe(item.rpe))).toEqual([
			'@≤8',
			undefined,
			'@7–8',
			'@8.5'
		]);
	});
});
