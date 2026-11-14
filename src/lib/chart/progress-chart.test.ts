import { describe, expect, it } from 'vitest';
import type { CalendarDate } from '#lib/calendar-date.js';
import { TrainingLog } from '#lib/data-files/training-log.js';
import { progressSeries } from '#lib/training/progress.js';
import type { Session } from '#lib/training/session.js';
import type { SetGroup } from '#lib/training/set-group.js';
import type { LineChartConfiguration } from './line-chart.svelte.js';
import { progressChartConfiguration } from './progress-chart.js';
import type { StrokeScale } from './stroke-scale.js';
import { timelineFrom } from './timeline.js';

const scale: StrokeScale = {
	line: 2,
	point: 1,
	tickFont: 12,
	labelFont: 10,
	markerLine: 1.5,
	starOuter: 8,
	starInner: 3.6
};

const rows = TrainingLog.parse([
	{
		date: '2026-11-04',
		exercise: 'chest-supported-row',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 10, load: 50, variation: 'dumbbells' }]
	},
	{
		date: '2026-11-07',
		exercise: 'chest-supported-row',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 8, load: 50, variation: 'dumbbells' }]
	},
	{
		date: '2026-11-09',
		exercise: 'chest-supported-row',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 10, load: 55, variation: 'dumbbells' }]
	}
]);

const curls = TrainingLog.parse([
	{
		date: '2026-11-04',
		exercise: 'hamstring-curl',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 12, load: 90, variation: 'seated' }]
	},
	{
		date: '2026-11-14',
		exercise: 'hamstring-curl',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 12, load: 45, variation: 'lying' }]
	}
]);

const chartOf = (sessions: readonly Session[], highlighted: SetGroup | undefined = undefined) => {
	const exercise = sessions[0].exercise;
	return progressChartConfiguration({
		exercise,
		series: progressSeries(exercise, sessions),
		axisLabel: 'Weight (lb)',
		timeline: timelineFrom(
			sessions[0].date,
			sessions.map((session) => session.date)
		),
		milestone: { date: '2026-12-12' as CalendarDate, label: 'Meet' },
		highlighted,
		scale,
		hoverTooltips: false,
		onSelect: () => {}
	});
};

const numbers = (value: unknown, label: string): number[] => {
	if (!Array.isArray(value) || value.some((item) => typeof item !== 'number')) {
		throw new Error(`expected ${label} to be a number array`);
	}
	return value;
};

const datasetRadii = (chart: LineChartConfiguration) =>
	chart.data.datasets.map((dataset) => ({
		label: dataset.label,
		radii: numbers(dataset.pointRadius, 'pointRadius'),
		hoverRadii: numbers(dataset.pointHoverRadius, 'pointHoverRadius'),
		styles: dataset.pointStyle
	}));

describe('progress chart markers', () => {
	it('keeps unselected markers the same size in one-point and multi-point series', () => {
		const datasets = datasetRadii(chartOf(rows));
		expect(datasets.map(({ label, radii }) => [label, radii])).toEqual([
			['8 reps', [5]],
			['10 reps', [5, 5]]
		]);
	});

	it('uses the same unselected size for circle and triangle markers', () => {
		const datasets = datasetRadii(chartOf(curls));
		expect(datasets).toHaveLength(1);
		expect(datasets[0].styles).toEqual(['circle', 'triangle']);
		expect(datasets[0].radii).toEqual([5, 5]);
	});

	it('enlarges only the selected marker and grows further on hover', () => {
		const highlighted = rows[0].setGroups[0];
		const datasets = datasetRadii(chartOf(rows, highlighted));
		const selected = datasets.find((dataset) => dataset.label === '10 reps');
		const lone = datasets.find((dataset) => dataset.label === '8 reps');
		if (!selected || !lone) throw new Error('missing series');
		expect(selected.radii).toEqual([7, 5]);
		expect(lone.radii).toEqual([5]);
		expect(selected.hoverRadii).toEqual([9, 7]);
		expect(lone.hoverRadii).toEqual([7]);
	});
});
