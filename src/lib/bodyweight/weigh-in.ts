import { dayNumber, type CalendarDate } from '#lib/calendar-date.js';
import type { WeightClass } from '#lib/competition/weight-class.js';
import type { Pounds } from '#lib/mass.js';

export type WeighIn = { readonly date: CalendarDate; readonly pounds: Pounds };

export type BodyweightSummary = {
	readonly latest: WeighIn;
	readonly weeklyChange?: number;
	readonly marginBelowClass: number;
};

export function summarizeBodyweight(
	weighIns: readonly WeighIn[],
	weightClass: WeightClass
): BodyweightSummary | undefined {
	const chronological = weighIns.toSorted((a, b) => a.date.localeCompare(b.date));
	const latest = chronological.at(-1);
	if (!latest) return undefined;
	const baseline = chronological.findLast(
		(weighIn) => dayNumber(weighIn.date) <= dayNumber(latest.date) - 7
	);
	return {
		latest,
		weeklyChange: baseline && latest.pounds - baseline.pounds,
		marginBelowClass: weightClass.limitPounds - latest.pounds
	};
}
