import { formatLongDate } from '#lib/calendar-date.js';
import { formatPounds } from '#lib/mass.js';
import { loadKindOf, measureOf, type Exercise } from './exercise.js';
import {
	describeLoad,
	describeVolume,
	loadPounds,
	type Count,
	type SetGroup
} from './set-group.js';
import type { Session } from './session.js';

export type ProgressPoint = {
	readonly session: Session;
	readonly value: number;
	readonly top: SetGroup;
	readonly groups: readonly SetGroup[];
};

export type ProgressSeries = {
	readonly count: Count;
	readonly label: string;
	readonly points: readonly ProgressPoint[];
};

function progressValue(group: SetGroup): number {
	return loadPounds(group.load) ?? group.effort.count;
}

export function progressAxisLabel(exercise: Exercise): string {
	switch (loadKindOf(exercise)) {
		case 'weight':
			return 'Weight (lb)';
		case 'added-to-bodyweight':
			return 'Added weight (lb)';
		default:
			return measureOf(exercise) === 'seconds' ? 'Hold (sec)' : 'Reps';
	}
}

const heaviest = (groups: readonly SetGroup[]) =>
	groups.reduce((best, group) => (progressValue(group) > progressValue(best) ? group : best));

function workingSets(session: Session): readonly SetGroup[] {
	return session.setGroups.filter((group) => !group.warmup);
}

export function progressSeries(exercise: Exercise, sessions: readonly Session[]): ProgressSeries[] {
	const byCount = new Map<Count, ProgressPoint[]>();
	const chronological = sessions.toSorted((a, b) => a.date.localeCompare(b.date));
	for (const session of chronological) {
		const groupsByCount = Map.groupBy(workingSets(session), (group) => group.effort.count);
		for (const [count, groups] of groupsByCount) {
			const top = heaviest(groups);
			const points = byCount.get(count) ?? [];
			points.push({ session, value: progressValue(top), top, groups });
			byCount.set(count, points);
		}
	}
	const unit = measureOf(exercise) === 'seconds' ? 'sec' : 'reps';
	return [...byCount]
		.sort(([a], [b]) => a - b)
		.map(([count, points]) => ({ count, label: `${count} ${unit}`, points }));
}

export function headlineSet(session: Session): SetGroup {
	const working = workingSets(session);
	return working.length > 0 ? heaviest(working) : session.setGroups[0];
}

export type PointSummary = {
	readonly title: string;
	readonly lines: readonly string[];
	readonly details: readonly string[];
};

const unique = <T>(values: readonly T[]) => [...new Set(values)];

export function summarizePoint(point: ProgressPoint): PointSummary {
	const { top, groups, session } = point;
	const topPounds = loadPounds(top.load);
	const atTopLoad = groups.filter((group) => loadPounds(group.load) === topPounds);
	const lighter =
		topPounds === undefined
			? []
			: groups.filter((group) => (loadPounds(group.load) ?? 0) < topPounds);
	const lighterSets = [...Map.groupBy(lighter, (group) => loadPounds(group.load) ?? 0)]
		.sort(([a], [b]) => b - a)
		.map(([pounds, same]) => {
			const sets = same.reduce((total, group) => total + group.sets, 0);
			return `${sets} set${sets === 1 ? '' : 's'} at ${formatPounds(pounds)} lb`;
		});
	const rpes = unique(atTopLoad.flatMap((group) => (group.rpe === undefined ? [] : [group.rpe])));
	const variations = unique(
		groups.flatMap((group) => (group.variation ? [group.variation.label] : []))
	);
	return {
		title: formatLongDate(session.date),
		lines: [
			describeLoad(top.load, session.exercise),
			unique(atTopLoad.map(describeVolume)).join(' · ')
		],
		details: [
			...(rpes.length > 0 ? [`RPE ${rpes.join(', ')}`] : []),
			...(lighterSets.length > 0 ? [`+ ${lighterSets.join(', ')}`] : []),
			...(variations.length > 0 ? [variations.join(', ')] : [])
		]
	};
}
