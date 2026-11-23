import { describe, expect, it } from 'vitest';
import { exercises, type ExerciseId } from '#lib/training/exercise.js';
import { describeIntensity, plannedRpe } from './intensity.js';
import { describeRpe, type RpeTarget, type WeekIntensity } from './training-week.js';
import type { Rpe } from '#lib/training/set-group.js';

const rpe = (value: number) => value as Rpe;
const range = (from: number, to: number): RpeTarget => ({
	kind: 'range',
	from: rpe(from),
	to: rpe(to)
});
const exact = (value: number): RpeTarget => ({ kind: 'exact', rpe: rpe(value) });
const closeToFailure: RpeTarget = { kind: 'cue', label: 'close to failure' };

const week1: WeekIntensity = { mainLifts: range(7.5, 8) };
const week2: WeekIntensity = { mainLifts: exact(8.5), bench: closeToFailure };

const targetOf = (id: ExerciseId, intensity: WeekIntensity | undefined, explicit?: RpeTarget) =>
	plannedRpe(exercises[id], intensity, explicit);

const shown = (id: ExerciseId, intensity: WeekIntensity | undefined, explicit?: RpeTarget) => {
	const target = targetOf(id, intensity, explicit);
	return target && describeRpe(target);
};

describe('plannedRpe', () => {
	it('applies the weekly main-lift target to squat, bench, and deadlift', () => {
		expect(shown('squat', week1)).toBe('@7.5–8');
		expect(shown('bench', week1)).toBe('@7.5–8');
		expect(shown('deadlift', week1)).toBe('@7.5–8');
	});

	it('takes only bench close to failure in week 2', () => {
		expect(shown('squat', week2)).toBe('@8.5');
		expect(shown('deadlift', week2)).toBe('@8.5');
		expect(shown('bench', week2)).toBe('close to failure');
	});

	it('keeps knee-rehab accessories at 7–8 and other accessories at about 9', () => {
		expect(shown('rfe-lunge', week1)).toBe('@7–8');
		expect(shown('leg-press', week2)).toBe('@7–8');
		expect(shown('quad-extension', week2)).toBe('@7–8');
		expect(shown('incline-dumbbell-press', week1)).toBe('@9');
		expect(shown('hammer-strength-prone-row', week2)).toBe('@9');
		expect(shown('curl', week1)).toBe('@9');
	});

	it('leaves abs alone and does not invent targets on weeks without intensity', () => {
		expect(shown('half-kneeling-pallof-press', week1)).toBeUndefined();
		expect(shown('squat', undefined)).toBeUndefined();
		expect(shown('curl', undefined)).toBeUndefined();
	});

	it('lets an explicit prescription target win', () => {
		expect(shown('squat', week2, exact(7))).toBe('@7');
	});
});

describe('describeIntensity', () => {
	it('summarizes the weekly main-lift target plus the standing accessory rules', () => {
		expect(describeIntensity(week1)).toBe(
			'Main lifts @7.5–8; knee rehab @7–8; other accessories @9'
		);
		expect(describeIntensity(week2)).toBe(
			'Main lifts @8.5; bench close to failure; knee rehab @7–8; other accessories @9'
		);
	});
});
