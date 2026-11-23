import { describe, expect, it } from 'vitest';
import committedWeeks from '../../../data/program-weeks.json';
import { describeRpe } from '#lib/plan/training-week.js';
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
	it('accepts the committed plan from Nov 9 through meet week', () => {
		const weeks = ProgramWeeks.parse(committedWeeks);
		expect(weeks.map((planned) => planned.start)).toEqual([
			'2026-11-09',
			'2026-11-16',
			'2026-11-23',
			'2026-11-30',
			'2026-12-07'
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
		expect(issuesFor([withRpe('close to failure')])).toEqual([]);
	});

	it("applies Sina's weekly RPE targets on the committed meet plan", () => {
		const planned = ProgramWeeks.parse(committedWeeks);
		const shown = (start: string) =>
			Object.fromEntries(
				planned
					.find((week) => week.start === start)!
					.days.flatMap((day) =>
						day.work.map((item) => [
							`${day.date} ${item.exercise.name} ${item.sets}×${item.effort.count.min}${item.effort.count.max === item.effort.count.min ? '' : `–${item.effort.count.max}`}`,
							item.rpe && describeRpe(item.rpe)
						])
					)
			);

		expect(shown('2026-11-16')).toMatchObject({
			'2026-11-16 Squat 1×2': '@7.5–8',
			'2026-11-16 Squat 3×5': '@7.5–8',
			'2026-11-16 RFE lunge 3×8': '@7–8',
			'2026-11-16 Leg press 3×8': '@7–8',
			'2026-11-16 Quad extension 2×15': '@7–8',
			'2026-11-16 Half-kneeling Pallof press with rotation 3×10': undefined,
			'2026-11-17 Bench 4×5': '@7.5–8',
			'2026-11-17 Incline dumbbell press 3×6': '@9',
			'2026-11-19 Deadlift 3×5': '@7.5–8',
			'2026-11-21 Squat 3×1': '@7.5–8',
			'2026-11-21 Bench 3×2': '@7.5–8',
			'2026-11-21 Deadlift 3×2': '@7.5–8'
		});
		expect(shown('2026-11-23')).toMatchObject({
			'2026-11-23 Squat 2×2': '@8.5',
			'2026-11-23 Squat 2×5': '@8.5',
			'2026-11-24 Bench 4×5': 'close to failure',
			'2026-11-26 Deadlift 3×5': '@8.5',
			'2026-11-28 Squat 3×1': '@8.5',
			'2026-11-28 Bench 3×2': 'close to failure',
			'2026-11-28 Deadlift 3×2': '@8.5',
			'2026-11-23 RFE lunge 3×8': '@7–8',
			'2026-11-24 Incline dumbbell press 3×6': '@9'
		});
		expect(shown('2026-11-30')).toMatchObject({
			'2026-11-30 Squat 3×2': '@7.5–8',
			'2026-11-30 Squat 1×5': '@7.5–8',
			'2026-12-01 Bench 4×5': '@7.5–8',
			'2026-12-03 Deadlift 3×5': '@7.5–8',
			'2026-12-05 Squat 3×1': '@7.5–8',
			'2026-12-05 Bench 3×2': '@7.5–8',
			'2026-12-05 Deadlift 1×1': '@7.5–8'
		});
	});
});
