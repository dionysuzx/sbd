import { dayNumber } from '#lib/calendar-date.js';
import type { Milestone } from '#lib/program.js';
import { loadKindOf, variationIndex, type Exercise } from '#lib/training/exercise.js';
import { summarizePoint, type ProgressPoint, type ProgressSeries } from '#lib/training/progress.js';
import type { SetGroup } from '#lib/training/set-group.js';
import type { LineChartConfiguration } from './line-chart.svelte.js';
import { markerShape, selectionOutline, seriesColor } from './palette.js';
import { dodgeOverlappingPoints, milestoneMarker } from './plugins.js';
import type { StrokeScale } from './stroke-scale.js';
import { timelineAxis, valueAxis, type Timeline } from './timeline.js';
import { fontFamily } from './typography.js';

export type ProgressChartInput = {
	readonly exercise: Exercise;
	readonly series: readonly ProgressSeries[];
	readonly axisLabel: string;
	readonly timeline: Timeline;
	readonly milestone: Milestone;
	readonly highlighted: SetGroup | undefined;
	readonly scale: StrokeScale;
	readonly hoverTooltips: boolean;
	readonly onSelect: (point: ProgressPoint | undefined) => void;
};

function valuePadding(exercise: Exercise): number {
	if (exercise.category === 'main-lift') return 20;
	return loadKindOf(exercise) === 'weight' || loadKindOf(exercise) === 'added-to-bodyweight'
		? 10
		: 2;
}

export function progressChartConfiguration(input: ProgressChartInput): LineChartConfiguration {
	const { exercise, series, scale, highlighted } = input;
	const values = series.flatMap(({ points }) => points.map((point) => point.value));
	const padding = valuePadding(exercise);
	const countsUp = padding === 2;
	const pointAt = (datasetIndex: number, index: number) => series[datasetIndex].points[index];

	const datasets = series.map(({ label, points }, seriesIndex) => {
		const color = seriesColor(seriesIndex);
		const selected = points.map((point) => point.top === highlighted);
		const shapes = points.map((point) =>
			markerShape(variationIndex(exercise, point.top.variation))
		);
		const radii = shapes.map((shape, index) => {
			const base = (points.length === 1 || shape !== 'circle' ? 7 : 5) * scale.point;
			return selected[index] ? base + 2 * scale.point : base;
		});
		const borderColors = selected.map((isSelected) => (isSelected ? selectionOutline : color));
		const borderWidths = selected.map((isSelected) =>
			isSelected ? Math.max(3, scale.line + 0.4) : Math.max(1, scale.line * 0.45)
		);
		return {
			label,
			data: points.map((point) => ({ x: dayNumber(point.session.date), y: point.value })),
			borderColor: color,
			backgroundColor: color,
			borderWidth: scale.line,
			tension: 0,
			pointStyle: shapes,
			pointBackgroundColor: color,
			pointBorderColor: borderColors,
			pointBorderWidth: borderWidths,
			pointRadius: radii,
			pointHoverRadius: radii.map((radius) => radius + 2 * scale.point),
			pointHoverBorderColor: borderColors,
			pointHoverBorderWidth: borderWidths,
			pointHitRadius: 12
		};
	});

	return {
		type: 'line',
		data: { datasets },
		plugins: [dodgeOverlappingPoints, milestoneMarker],
		options: {
			maintainAspectRatio: false,
			animation: false,
			interaction: { mode: 'nearest', intersect: true },
			plugins: {
				tooltip: {
					enabled: input.hoverTooltips,
					filter: (_, index) => index === 0,
					callbacks: {
						title: ([item]) => summarizePoint(pointAt(item.datasetIndex, item.dataIndex)).title,
						label: (item) => [...summarizePoint(pointAt(item.datasetIndex, item.dataIndex)).lines],
						afterBody: ([item]) => [
							...summarizePoint(pointAt(item.datasetIndex, item.dataIndex)).details
						]
					}
				},
				milestoneMarker: {
					x: dayNumber(input.milestone.date),
					label: input.milestone.label,
					scale,
					font: fontFamily
				}
			},
			onHover: (_, elements, chart) => {
				chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
			},
			onClick: (_, [element]) => {
				input.onSelect(element ? pointAt(element.datasetIndex, element.index) : undefined);
			},
			scales: {
				x: timelineAxis(input.timeline, scale),
				y: valueAxis(input.axisLabel, scale, {
					suggestedMin: countsUp ? 0 : Math.min(...values) - padding,
					suggestedMax: Math.max(...values) + padding
				})
			}
		}
	};
}
