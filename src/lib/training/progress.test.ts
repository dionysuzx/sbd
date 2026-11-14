import { describe, expect, it } from 'vitest';
import { TrainingLog } from '#lib/data-files/training-log.js';
import { exercises } from './exercise.js';
import { headlineSet, progressSeries, summarizePoint } from './progress.js';

const bench = TrainingLog.parse([
	{
		date: '2026-11-06',
		exercise: 'bench',
		source: 'trainer-log',
		setGroups: [
			{ sets: 1, reps: 5, load: 205, rpe: 5.5, variation: 'paused' },
			{ sets: 1, reps: 5, load: 215, rpe: 7, variation: 'paused' },
			{ sets: 3, reps: 8, load: 190, variation: 'paused' }
		]
	},
	{
		date: '2026-11-10',
		exercise: 'bench',
		source: 'trainer-log',
		setGroups: [{ sets: 1, reps: 5, load: 221, rpe: 7, variation: 'paused' }]
	}
]);

const hamstringWarmup = TrainingLog.parse([
	{
		date: '2026-11-07',
		exercise: 'hamstring-curl',
		source: 'trainer-log',
		setGroups: [{ sets: 1, reps: 10, load: 50, variation: 'seated', warmup: true }]
	}
]);

const hamstringCurls = TrainingLog.parse([
	{
		date: '2026-11-04',
		exercise: 'hamstring-curl',
		source: 'trainer-log',
		setGroups: [{ sets: 2, reps: 12, load: 90, rpe: 6, variation: 'seated' }]
	},
	{
		date: '2026-11-14',
		exercise: 'hamstring-curl',
		source: 'trainer-log',
		setGroups: [
			{ sets: 2, reps: 12, load: 35, rpe: 6, variation: 'lying' },
			{ sets: 2, reps: 12, load: 45, rpe: 8, variation: 'lying' }
		]
	}
]);

describe('progressSeries', () => {
	it('plots the heaviest working set per day, one series per rep count', () => {
		const series = progressSeries(exercises.bench, bench);
		expect(series.map(({ label, points }) => [label, points.map((point) => point.value)])).toEqual([
			['5 reps', [215, 221]],
			['8 reps', [190]]
		]);
	});

	it('leaves warm-ups off the chart', () => {
		expect(progressSeries(exercises['hamstring-curl'], hamstringWarmup)).toEqual([]);
	});

	it('plots seated and lying hamstring curls on the same series', () => {
		const series = progressSeries(exercises['hamstring-curl'], hamstringCurls);
		expect(series.map(({ label, points }) => [label, points.map((point) => point.value)])).toEqual([
			['12 reps', [90, 45]]
		]);
		expect(series[0].points.map((point) => point.top.variation?.id)).toEqual(['seated', 'lying']);
	});
});

describe('headlineSet', () => {
	it('picks the heaviest working set', () => {
		expect(headlineSet(bench[0])).toMatchObject({ load: { pounds: 215 } });
	});

	it('falls back to the first set when the day was only a warm-up', () => {
		expect(headlineSet(hamstringWarmup[0])).toBe(hamstringWarmup[0].setGroups[0]);
	});
});

describe('summarizePoint', () => {
	it('describes the top set and the lighter sets at the same rep count', () => {
		const [fiveReps] = progressSeries(exercises.bench, bench);
		expect(summarizePoint(fiveReps.points[0])).toEqual({
			title: 'Fri, Nov 6, 2026',
			lines: ['215 lb', '1 × 5'],
			details: ['RPE 7', '+ 1 set at 205 lb', 'Comp standard']
		});
	});
});
