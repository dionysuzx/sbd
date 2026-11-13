import type { Chart, ChartType, Plugin, PointElement } from 'chart.js';
import { dodgeOffsets } from './dodge.js';
import { milestoneColors } from './palette.js';
import type { StrokeScale } from './stroke-scale.js';

export type MilestoneMarkerOptions = {
	readonly x: number;
	readonly label: string;
	readonly scale: StrokeScale;
	readonly font: string;
};

export type ReferenceLine = {
	readonly y: number;
	readonly label: string;
	readonly color: string;
	readonly dash: readonly number[];
};

export type ReferenceLinesOptions = {
	readonly lines: readonly ReferenceLine[];
	readonly scale: StrokeScale;
	readonly font: string;
};

declare module 'chart.js' {
	interface PluginOptionsByType<TType extends ChartType> {
		milestoneMarker?: MilestoneMarkerOptions | false;
		referenceLines?: ReferenceLinesOptions | false;
	}
}

export const dodgeOverlappingPoints: Plugin<'line'> = {
	id: 'dodgeOverlappingPoints',
	afterDatasetsUpdate(chart: Chart<'line'>) {
		const points = chart.data.datasets.flatMap((_, index) =>
			chart.isDatasetVisible(index) ? (chart.getDatasetMeta(index).data as PointElement[]) : []
		);
		const offsets = dodgeOffsets(
			points.map((point) => ({
				x: point.x,
				y: point.y,
				radius: point.options.radius + point.options.borderWidth
			})),
			chart.chartArea
		);
		points.forEach((point, index) => {
			point.x += offsets[index];
		});
	}
};

export const milestoneMarker: Plugin<'line'> = {
	id: 'milestoneMarker',
	afterDatasetsDraw(chart, _, options: MilestoneMarkerOptions) {
		const { chartArea: area, ctx } = chart;
		const x = chart.scales.x.getPixelForValue(options.x);
		if (x < area.left || x > area.right) return;
		const { scale } = options;
		ctx.save();
		ctx.strokeStyle = milestoneColors.line;
		ctx.lineWidth = scale.markerLine;
		ctx.setLineDash([4, 3]);
		ctx.beginPath();
		ctx.moveTo(x, area.top);
		ctx.lineTo(x, area.bottom);
		ctx.stroke();
		ctx.setLineDash([]);
		const centerY = area.bottom - scale.starOuter - 2;
		ctx.beginPath();
		for (let vertex = 0; vertex < 10; vertex++) {
			const angle = -Math.PI / 2 + (vertex * Math.PI) / 5;
			const radius = vertex % 2 ? scale.starInner : scale.starOuter;
			ctx.lineTo(x + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
		}
		ctx.closePath();
		ctx.fillStyle = milestoneColors.starFill;
		ctx.fill();
		ctx.strokeStyle = milestoneColors.starOutline;
		ctx.lineWidth = Math.max(1, scale.markerLine * 0.7);
		ctx.stroke();
		ctx.font = `600 ${scale.labelFont}px ${options.font}`;
		ctx.fillStyle = milestoneColors.label;
		ctx.textAlign = 'left';
		ctx.textBaseline = 'top';
		ctx.fillText(options.label, x + 4, area.top + 2);
		ctx.restore();
	}
};

export const referenceLines: Plugin<'line'> = {
	id: 'referenceLines',
	afterDatasetsDraw(chart, _, options: ReferenceLinesOptions) {
		const { chartArea: area, ctx } = chart;
		ctx.save();
		for (const line of options.lines) {
			const y = chart.scales.y.getPixelForValue(line.y);
			if (y < area.top || y > area.bottom) continue;
			ctx.strokeStyle = line.color;
			ctx.lineWidth = options.scale.markerLine;
			ctx.setLineDash([...line.dash]);
			ctx.beginPath();
			ctx.moveTo(area.left, y);
			ctx.lineTo(area.right, y);
			ctx.stroke();
			ctx.font = `600 ${options.scale.labelFont}px ${options.font}`;
			ctx.fillStyle = line.color;
			ctx.textAlign = 'right';
			ctx.textBaseline = 'bottom';
			ctx.fillText(line.label, area.right - 2, y - 2);
		}
		ctx.restore();
	}
};
