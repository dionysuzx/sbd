import { describe, expect, it } from 'vitest';
import committedWeeks from '../../../data/program-weeks.json';
import { ProgramWeeks } from './program-weeks.js';

const week = (overrides: Record<string, unknown> = {}) => ({
	start: '2026-11-16',
	phase: 'build',
	days: [
		{
			date: '2026-11-16',
			title: 'Squat',
			work: [{ exercise: 'squat', sets: 1, reps: 5, rpe: 7 }]
		}
	],
	...overrides
});

const issuesFor = (weeks: unknown) => {
	const result = ProgramWeeks.safeParse(weeks);
	return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('ProgramWeeks', () => {
	it('accepts the committed plan from Nov 9 through the return week', () => {
		const weeks = ProgramWeeks.parse(committedWeeks);
		expect(weeks.map((planned) => planned.start)).toEqual([
			'2026-11-09',
			'2026-11-16',
			'2026-11-23',
			'2026-11-30',
			'2026-12-07',
			'2026-12-14'
		]);
	});

	it('plans RPE and volume, never loads', () => {
		expect(
			issuesFor([
				week({
					days: [{ ...week().days[0], work: [{ exercise: 'squat', sets: 1, reps: 5, load: 245 }] }]
				})
			])
		).not.toEqual([]);
	});

	it('rejects a week that does not start on Monday', () => {
		expect(issuesFor([week({ start: '2026-11-17', days: [] })])).toEqual([
			'a week starts on a Monday'
		]);
	});

	it('rejects a day outside its week or out of order', () => {
		const day = (date: string) => ({ date, title: 'Rest', work: [] });
		expect(issuesFor([week({ days: [day('2026-11-23')] })])).toEqual([
			'2026-11-23 is outside the week of 2026-11-16'
		]);
		expect(issuesFor([week({ days: [day('2026-11-18'), day('2026-11-17')] })])).toEqual([
			'2026-11-17 must come after 2026-11-18'
		]);
	});

	it('rejects a gap between weeks', () => {
		expect(issuesFor([week(), week({ start: '2026-11-30', days: [] })])).toEqual([
			'the week of 2026-11-30 must directly follow the week of 2026-11-16'
		]);
	});

	it('rejects reps for an exercise measured in seconds', () => {
		const copenhagen = { exercise: 'copenhagen', sets: 3, reps: 30 };
		expect(issuesFor([week({ days: [{ ...week().days[0], work: [copenhagen] }] })])).toEqual([
			'Copenhagen is prescribed in seconds'
		]);
	});

	it('rejects malformed RPE targets and backwards ranges', () => {
		const withRpe = (rpe: unknown) =>
			week({ days: [{ ...week().days[0], work: [{ exercise: 'squat', sets: 1, reps: 5, rpe }] }] });
		expect(issuesFor([withRpe('8-7')])).not.toEqual([]);
		expect(issuesFor([withRpe('hard')])).not.toEqual([]);
		expect(issuesFor([withRpe('<=8')])).toEqual([]);
	});
});
