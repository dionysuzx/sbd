import type { ChartConfiguration } from 'chart.js';
import type { Attachment } from 'svelte/attachments';
import { Chart } from './line-element.js';

type ChartPoint = { x: number; y: number };

export type LineChartConfiguration = ChartConfiguration<'line', ChartPoint[]>;

export function lineChart(configure: () => LineChartConfiguration): Attachment<HTMLCanvasElement> {
	return (canvas) => {
		let chart: Chart<'line', ChartPoint[]> | undefined;
		$effect(() => {
			const configuration = configure();
			if (!chart) {
				chart = new Chart(canvas, configuration);
				return;
			}
			chart.data = configuration.data;
			chart.options = configuration.options ?? {};
			chart.update('none');
		});
		return () => chart?.destroy();
	};
}

export const canHover = () => window.matchMedia('(hover: hover)').matches;
