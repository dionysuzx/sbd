import { dayNumber, formatLongDate } from '#lib/calendar-date.js';
import type { WeighIn } from '#lib/bodyweight/weigh-in.js';
import { formatKilograms, formatPounds } from '#lib/mass.js';
import type { LineChartConfiguration } from './line-chart.svelte.js';
import { referenceLines, type ReferenceLine } from './plugins.js';
import type { StrokeScale } from './stroke-scale.js';
import { timelineAxis, valueAxis, type Timeline } from './timeline.js';
import { fontFamily } from './typography.js';

export type BodyweightChartInput = {
	readonly weighIns: readonly WeighIn[];
	readonly color: string;
	readonly classLines: readonly ReferenceLine[];
	readonly timeline: Timeline;
	readonly scale: StrokeScale;
};

export function bodyweightChartConfiguration(input: BodyweightChartInput): LineChartConfiguration {
	const { weighIns, color, scale } = input;
	const pounds = weighIns.map((weighIn) => weighIn.pounds);
	const limits = input.classLines.map((line) => line.y);
	return {
		type: 'line',
		data: {
			datasets: [
				{
					label: 'Bodyweight',
					data: weighIns.map((weighIn) => ({ x: dayNumber(weighIn.date), y: weighIn.pounds })),
					borderColor: color,
					backgroundColor: color,
					borderWidth: scale.line,
					tension: 0,
					showLine: weighIns.length > 1,
					pointBackgroundColor: color,
					pointBorderColor: color,
					pointBorderWidth: Math.max(1, scale.line * 0.45),
					pointRadius: 6 * scale.point,
					pointHoverRadius: 8 * scale.point,
					pointHitRadius: 12
				}
			]
		},
		plugins: [referenceLines],
		options: {
			maintainAspectRatio: false,
			animation: false,
			interaction: { mode: 'nearest', intersect: true },
			plugins: {
				tooltip: {
					callbacks: {
						title: ([item]) => formatLongDate(weighIns[item.dataIndex].date),
						label: (item) => {
							const { pounds } = weighIns[item.dataIndex];
							return `${formatPounds(pounds)} lb (${formatKilograms(pounds)} kg)`;
						}
					}
				},
				referenceLines: { lines: input.classLines, scale, font: fontFamily }
			},
			scales: {
				x: timelineAxis(input.timeline, scale),
				y: valueAxis('Weight (lb)', scale, {
					suggestedMin: Math.min(...pounds, ...limits) - 5,
					suggestedMax: Math.max(...pounds, ...limits) + 5
				})
			}
		}
	};
}
