import {
	Chart,
	LinearScale,
	LineController,
	LineElement,
	PointElement,
	Tooltip,
	type ChartConfiguration
} from 'chart.js';
import type { Attachment } from 'svelte/attachments';

Chart.register(LineController, LineElement, PointElement, LinearScale, Tooltip);

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
