import { z } from 'zod';
import {
	exerciseIds,
	exercises,
	findVariation,
	isUnilateral,
	loadKindOf,
	measureOf,
	type Exercise,
	type Variation
} from '#lib/training/exercise.js';
import { sessionKey, sources, type Session } from '#lib/training/session.js';
import type { Effort, Load, SetGroup } from '#lib/training/set-group.js';
import { CalendarDate, Count, Pounds, Rpe, uniqueBy } from './primitives.js';

const RawSetGroup = z.strictObject({
	sets: Count,
	reps: Count.optional(),
	seconds: Count.optional(),
	load: Pounds.optional(),
	rpe: Rpe.optional(),
	variation: z.string().optional(),
	warmup: z.literal(true).optional(),
	note: z.string().trim().min(1).optional()
});
type RawSetGroup = z.infer<typeof RawSetGroup>;

const RawSession = z.strictObject({
	date: CalendarDate,
	exercise: z.enum(exerciseIds),
	source: z.enum(sources),
	setGroups: z.array(RawSetGroup).nonempty()
});

type Problem = { readonly field: keyof RawSetGroup; readonly message: string };
type Checked<T> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly problems: readonly Problem[] };

const valid = <T>(value: T): Checked<T> => ({ ok: true, value });
const invalid = <T>(field: keyof RawSetGroup, message: string): Checked<T> => ({
	ok: false,
	problems: [{ field, message }]
});
const isValid = <T>(checked: Checked<T>): checked is Checked<T> & { ok: true } => checked.ok;
const problemsOf = (checked: Checked<unknown>) => (checked.ok ? [] : checked.problems);

function checkEffort(raw: RawSetGroup, exercise: Exercise): Checked<Effort> {
	const measure = measureOf(exercise);
	const [expected, unexpected] =
		measure === 'reps' ? (['reps', 'seconds'] as const) : (['seconds', 'reps'] as const);
	const count = raw[expected];
	if (raw[unexpected] !== undefined) {
		return invalid(unexpected, `${exercise.name} is measured in ${measure}, not ${unexpected}`);
	}
	if (count === undefined) return invalid(expected, `${exercise.name} needs ${expected}`);
	return valid({ measure, count, perSide: isUnilateral(exercise) });
}

function checkLoad(pounds: RawSetGroup['load'], exercise: Exercise): Checked<Load> {
	const kind = loadKindOf(exercise);
	if (kind === 'weight' || kind === 'added-to-bodyweight') {
		return pounds === undefined
			? invalid('load', `${exercise.name} needs a load in pounds`)
			: valid({ kind, pounds });
	}
	return pounds === undefined
		? valid({ kind })
		: invalid('load', `${exercise.name} uses ${kind} only and takes no load`);
}

function checkVariation(
	id: string | undefined,
	exercise: Exercise
): Checked<Variation | undefined> {
	if (id === undefined) {
		return exercise.category === 'main-lift'
			? invalid('variation', `${exercise.name} needs a variation`)
			: valid(undefined);
	}
	const variation = findVariation(exercise, id);
	if (variation) return valid(variation);
	const allowed = exercise.variations.map((known) => known.id).join(', ') || 'none';
	return invalid('variation', `${exercise.name} has no variation "${id}" (allowed: ${allowed})`);
}

function checkSetGroup(raw: RawSetGroup, exercise: Exercise): Checked<SetGroup> {
	const effort = checkEffort(raw, exercise);
	const load = checkLoad(raw.load, exercise);
	const variation = checkVariation(raw.variation, exercise);
	if (!effort.ok || !load.ok || !variation.ok) {
		return { ok: false, problems: [effort, load, variation].flatMap(problemsOf) };
	}
	return valid({
		sets: raw.sets,
		effort: effort.value,
		load: load.value,
		rpe: raw.rpe,
		variation: variation.value,
		warmup: raw.warmup ?? false,
		note: raw.note
	});
}

const SessionFromRaw = RawSession.transform((raw, context): Session => {
	const exercise = exercises[raw.exercise];
	const [first, ...rest] = raw.setGroups;
	const head = checkSetGroup(first, exercise);
	const tail = rest.map((group) => checkSetGroup(group, exercise));
	[head, ...tail].forEach((checked, index) => {
		for (const { field, message } of problemsOf(checked)) {
			context.issues.push({
				code: 'custom',
				message,
				input: raw.setGroups[index],
				path: ['setGroups', index, field]
			});
		}
	});
	if (!isValid(head) || !tail.every(isValid)) return z.NEVER;
	return {
		date: raw.date,
		exercise,
		source: raw.source,
		setGroups: [head.value, ...tail.map((checked) => checked.value)]
	};
});

export const TrainingLog = z
	.array(SessionFromRaw)
	.superRefine(
		uniqueBy(sessionKey, (key) => `${key} is logged twice; merge its set groups into one session`)
	)
	.transform((sessions) => sessions.toSorted((a, b) => sessionKey(a).localeCompare(sessionKey(b))));
