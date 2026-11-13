import type { ChartOptions } from 'chart.js';
import {
	dayNumber,
	formatShortDay,
	isMonday,
	latest,
	type CalendarDate
} from '#lib/calendar-date.js';
import type { StrokeScale } from './stroke-scale.js';
import { fontFamily } from './typography.js';

export type Timeline = { readonly firstDay: number; readonly lastDay: number };

export function timelineFrom(start: CalendarDate, loggedDates: readonly CalendarDate[]): Timeline {
	return {
		firstDay: dayNumber(start) - 1,
		lastDay: dayNumber(latest([start, ...loggedDates]) ?? start) + 2
	};
}

function weekStarts({ firstDay, lastDay }: Timeline): number[] {
	return Array.from({ length: lastDay - firstDay + 1 }, (_, offset) => firstDay + offset).filter(
		isMonday
	);
}

type AxisOptions = NonNullable<NonNullable<ChartOptions<'line'>['scales']>['x']>;

function axisTitle(text: string, scale: StrokeScale): AxisOptions['title'] {
	return { display: true, text, font: { family: fontFamily, size: scale.tickFont, weight: 500 } };
}

export function timelineAxis(timeline: Timeline, scale: StrokeScale): AxisOptions {
	return {
		type: 'linear',
		min: timeline.firstDay,
		max: timeline.lastDay,
		afterBuildTicks: (axis) => {
			axis.ticks = weekStarts(timeline).map((value) => ({ value }));
		},
		ticks: {
			font: { family: fontFamily, size: scale.tickFont },
			callback: (day) => formatShortDay(Number(day))
		},
		title: axisTitle('Date', scale)
	};
}

export function valueAxis(
	text: string,
	scale: StrokeScale,
	range: { readonly suggestedMin: number; readonly suggestedMax: number }
): AxisOptions {
	return {
		...range,
		ticks: { font: { family: fontFamily, size: scale.tickFont } },
		title: axisTitle(text, scale)
	};
}
