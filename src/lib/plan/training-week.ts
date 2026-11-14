import { dayNumber, daysBetween, formatShortDay, type CalendarDate } from '#lib/calendar-date.js';
import type { Meet } from '#lib/competition/meet.js';
import type { Exercise, Measure } from '#lib/training/exercise.js';
import type { Count, Rpe } from '#lib/training/set-group.js';

export type CountRange = { readonly min: Count; readonly max: Count };

export type RpeTarget =
	| { readonly kind: 'exact'; readonly rpe: Rpe }
	| { readonly kind: 'range'; readonly from: Rpe; readonly to: Rpe }
	| { readonly kind: 'at-most'; readonly rpe: Rpe };

export type Prescription = {
	readonly exercise: Exercise;
	readonly sets: Count;
	readonly effort: {
		readonly measure: Measure;
		readonly count: CountRange;
		readonly perSide: boolean;
	};
	readonly rpe?: RpeTarget;
	readonly note?: string;
};

export type PlannedDay = {
	readonly date: CalendarDate;
	readonly title: string;
	readonly note?: string;
	readonly work: readonly Prescription[];
};

export const phases = ['build', 'taper', 'meet-week', 'return'] as const;
export type Phase = (typeof phases)[number];

export type TrainingWeek = {
	readonly start: CalendarDate;
	readonly phase: Phase;
	readonly note?: string;
	readonly days: readonly PlannedDay[];
};

const phaseLabels: { readonly [P in Phase]: string } = {
	build: 'Build',
	taper: 'Taper',
	'meet-week': 'Meet week',
	return: 'Return'
};

const DAYS_PER_WEEK = 7;

function dayOfWeek(week: TrainingWeek, date: CalendarDate): number {
	return daysBetween(week.start, date);
}

export function containsDate(week: TrainingWeek, date: CalendarDate): boolean {
	const offset = dayOfWeek(week, date);
	return offset >= 0 && offset < DAYS_PER_WEEK;
}

export function weekIndexFor(weeks: readonly TrainingWeek[], today: CalendarDate): number {
	const containing = weeks.findIndex((week) => containsDate(week, today));
	if (containing !== -1) return containing;
	const first = weeks[0];
	return first !== undefined && today < first.start ? 0 : Math.max(0, weeks.length - 1);
}

function describeRange(start: CalendarDate): string {
	const first = dayNumber(start);
	const last = first + DAYS_PER_WEEK - 1;
	const [startMonth] = formatShortDay(first).split(' ');
	const [endMonth, endDay] = formatShortDay(last).split(' ');
	return `${formatShortDay(first)} – ${startMonth === endMonth ? endDay : `${endMonth} ${endDay}`}`;
}

export function describeWeek(week: TrainingWeek, meet: Meet): string {
	const parts = [describeRange(week.start), phaseLabels[week.phase]];
	const daysOut = daysBetween(week.start, meet.date);
	if (!containsDate(week, meet.date) && daysOut > 0) {
		const weeksOut = Math.floor(daysOut / DAYS_PER_WEEK);
		parts.push(`${weeksOut} ${weeksOut === 1 ? 'week' : 'weeks'} out`);
	}
	return parts.join(' · ');
}

const describeCount = ({ min, max }: CountRange) => (min === max ? `${min}` : `${min}–${max}`);

export function describeDose({ sets, effort }: Prescription): string {
	const unit = effort.measure === 'seconds' ? 's' : '';
	return `${sets} × ${describeCount(effort.count)}${unit}${effort.perSide ? '/side' : ''}`;
}

export function describeRpe(target: RpeTarget): string {
	switch (target.kind) {
		case 'exact':
			return `@${target.rpe}`;
		case 'range':
			return `@${target.from}–${target.to}`;
		case 'at-most':
			return `@≤${target.rpe}`;
	}
}
