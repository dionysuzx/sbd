import type { Exercise, ExerciseId } from '#lib/training/exercise.js';
import type { Rpe } from '#lib/training/set-group.js';
import { describeRpe, type RpeTarget, type WeekIntensity } from './training-week.js';

/** Sina's PT knee-rehab accessories on the meet program. Stay @7–8 every week. */
export const kneeRehabIds = [
	'rfe-lunge',
	'leg-press',
	'quad-extension'
] as const satisfies readonly ExerciseId[];

const kneeRehab = new Set<string>(kneeRehabIds);

const asRpe = (value: number) => value as Rpe;

const kneeRehabTarget: RpeTarget = { kind: 'range', from: asRpe(7), to: asRpe(8) };
const accessoryTarget: RpeTarget = { kind: 'exact', rpe: asRpe(9) };

/**
 * RPE for a planned set. An explicit target on the prescription wins.
 * Weeks with an intensity block apply Sina's weekly main-lift targets, keep
 * knee-rehab work at 7–8, and take other accessories to about 9.
 * Abs and weeks without intensity are left alone.
 */
export function plannedRpe(
	exercise: Exercise,
	intensity: WeekIntensity | undefined,
	explicit: RpeTarget | undefined
): RpeTarget | undefined {
	if (explicit) return explicit;
	if (!intensity) return undefined;
	if (exercise.category === 'main-lift') {
		return exercise.id === 'bench' && intensity.bench ? intensity.bench : intensity.mainLifts;
	}
	if (kneeRehab.has(exercise.id)) return kneeRehabTarget;
	if (exercise.id === 'half-kneeling-pallof-press') return undefined;
	return accessoryTarget;
}

export function describeIntensity(intensity: WeekIntensity): string {
	const parts: string[] = [];
	if (intensity.mainLifts) {
		parts.push(`Main lifts ${describeRpe(intensity.mainLifts)}`);
		if (intensity.bench) parts.push(`bench ${describeRpe(intensity.bench)}`);
	} else if (intensity.bench) {
		parts.push(`Bench ${describeRpe(intensity.bench)}`);
	}
	parts.push('knee rehab @7–8', 'other accessories @9');
	return parts.join('; ');
}
