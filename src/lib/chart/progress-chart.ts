import { dayNumber } from '#lib/calendar-date.js';
import type { Milestone } from '#lib/program.js';
import { loadKindOf, variationIndex, type Exercise } from '#lib/training/exercise.js';
import { summarizePoint, type ProgressPoint, type ProgressSeries } from '#lib/training/progress.js';
import type { SetGroup } from '#lib/training/set-group.js';
import type { LineChartConfiguration } from './line-chart.svelte.js';
import { markerShape, selectionOutline, seriesColor, type MarkerShape } from './palette.js';
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

const MARKER_RADIUS = { circle: 5, standout: 7 } as const;
const SELECTED_GROWTH = 2;
const HOVER_GROWTH = 2;

function markerRadius(shape: MarkerShape, onlyPoint: boolean, scale: StrokeScale): number {
	const radius = onlyPoint || shape !== 'circle' ? MARKER_RADIUS.standout : MARKER_RADIUS.circle;
	return radius * scale.point;
}

function markerBorder(selected: boolean, scale: StrokeScale): number {
	return selected ? Math.max(3, scale.line + 0.4) : Math.max(1, scale.line * 0.45);
}

function largestMarkerExtent(scale: StrokeScale): number {
	const radius = (MARKER_RADIUS.standout + SELECTED_GROWTH + HOVER_GROWTH) * scale.point;
	return radius + markerBorder(true, scale);
}

function valueRange(exercise: Exercise, values: readonly number[]) {
	const [lowest, highest] = [Math.min(...values), Math.max(...values)];
	if (exercise.category === 'main-lift') {
		return { suggestedMin: lowest - 20, suggestedMax: highest + 20 };
	}
	const kind = loadKindOf(exercise);
	return kind === 'weight' || kind === 'added-to-bodyweight'
		? { suggestedMin: lowest - 10, suggestedMax: highest + 10 }
		: { suggestedMin: 0, suggestedMax: highest + 2 };
}

export function progressChartConfiguration(input: ProgressChartInput): LineChartConfiguration {
	const { exercise, series, scale, highlighted } = input;
	const values = series.flatMap(({ points }) => points.map((point) => point.value));
	const pointAt = (datasetIndex: number, index: number) => series[datasetIndex].points[index];
	const summaryAt = (item: { datasetIndex: number; dataIndex: number }) =>
		summarizePoint(pointAt(item.datasetIndex, item.dataIndex));
	const markerExtent = largestMarkerExtent(scale);

	const datasets = series.map(({ label, points }, seriesIndex) => {
		const color = seriesColor(seriesIndex);
		const selected = points.map((point) => point.top === highlighted);
		const shapes = points.map((point) =>
			markerShape(variationIndex(exercise, point.top.variation))
		);
		const radii = shapes.map((shape, index) => {
			const radius = markerRadius(shape, points.length === 1, scale);
			return selected[index] ? radius + SELECTED_GROWTH * scale.point : radius;
		});
		const borderColors = selected.map((isSelected) => (isSelected ? selectionOutline : color));
		const borderWidths = selected.map((isSelected) => markerBorder(isSelected, scale));
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
			pointHoverRadius: radii.map((radius) => radius + HOVER_GROWTH * scale.point),
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
			layout: { autoPadding: false, padding: { top: markerExtent, right: markerExtent } },
			interaction: { mode: 'nearest', intersect: true },
			plugins: {
				tooltip: {
					enabled: input.hoverTooltips,
					filter: (_, index) => index === 0,
					callbacks: {
						title: ([item]) => summaryAt(item).title,
						label: (item) => [...summaryAt(item).lines],
						afterBody: ([item]) => [...summaryAt(item).details]
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
				y: valueAxis(input.axisLabel, scale, valueRange(exercise, values))
			}
		}
	};
}
