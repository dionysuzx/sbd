import { describe, expect, it } from 'vitest';
import committedLog from '../../../data/training-log.json';
import { TrainingLog } from './training-log.js';

const squat = (overrides: Record<string, unknown> = {}) => ({
	date: '2026-11-09',
	exercise: 'squat',
	source: 'trainer-log',
	setGroups: [{ sets: 1, reps: 5, load: 235, variation: 'low-bar-belted', ...overrides }]
});

const issuesFor = (log: unknown) => {
	const result = TrainingLog.safeParse(log);
	return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe('TrainingLog', () => {
	it('accepts the committed training log', () => {
		expect(TrainingLog.safeParse(committedLog).success).toBe(true);
	});

	it('orders sessions by date, then exercise', () => {
		const log = TrainingLog.parse([
			{ ...squat(), date: '2026-11-10' },
			{
				...squat(),
				exercise: 'deadlift',
				setGroups: [{ sets: 1, reps: 5, load: 285, variation: 'conventional' }]
			},
			squat()
		]);
		expect(log.map((session) => `${session.date} ${session.exercise.id}`)).toEqual([
			'2026-11-09 deadlift',
			'2026-11-09 squat',
			'2026-11-10 squat'
		]);
	});

	it('turns the stored shape into explicit load and effort', () => {
		const [session] = TrainingLog.parse([
			{
				date: '2026-11-05',
				exercise: 'copenhagen',
				source: 'trainer-log',
				setGroups: [{ sets: 3, seconds: 30 }]
			}
		]);
		expect(session.setGroups[0]).toMatchObject({
			load: { kind: 'bodyweight' },
			effort: { measure: 'seconds', count: 30, perSide: true },
			warmup: false
		});
	});

	it('rejects a variation the exercise does not have', () => {
		expect(issuesFor([squat({ variation: 'front' })])).toEqual([
			'Squat has no variation "front" (allowed: high-bar, low-bar-belted)'
		]);
	});

	it('requires main lifts to record their variation', () => {
		expect(issuesFor([squat({ variation: undefined })])).toEqual(['Squat needs a variation']);
	});

	it('rejects a load on a bodyweight exercise and a missing load on a weighted one', () => {
		const pullUp = {
			date: '2026-11-12',
			exercise: 'pull-up',
			source: 'trainer-log',
			setGroups: [{ sets: 4, reps: 8, load: 25 }]
		};
		expect(issuesFor([pullUp, squat({ load: undefined })])).toEqual([
			'Pull-up uses bodyweight only and takes no load',
			'Squat needs a load in pounds'
		]);
	});

	it('keeps reps and seconds apart', () => {
		const copenhagen = {
			date: '2026-11-05',
			exercise: 'copenhagen',
			source: 'trainer-log',
			setGroups: [{ sets: 3, reps: 30 }]
		};
		expect(issuesFor([copenhagen])).toEqual(['Copenhagen is measured in seconds, not reps']);
	});

	it('accepts RPE only on the half-point scale from 1 to 10', () => {
		expect(TrainingLog.safeParse([squat({ rpe: 7.5 })]).success).toBe(true);
		expect(TrainingLog.safeParse([squat({ rpe: 7.3 })]).success).toBe(false);
		expect(TrainingLog.safeParse([squat({ rpe: 11 })]).success).toBe(false);
	});

	it('rejects the same exercise logged twice on one day', () => {
		expect(issuesFor([squat(), squat()])).toEqual([
			'2026-11-09 squat is logged twice; merge its set groups into one session'
		]);
	});

	it('rejects impossible dates and unknown fields', () => {
		expect(TrainingLog.safeParse([{ ...squat(), date: '2026-02-30' }]).success).toBe(false);
		expect(TrainingLog.safeParse([squat({ weight_lb: 235 })]).success).toBe(false);
	});
});
