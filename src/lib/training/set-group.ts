import type { z } from 'zod';
import { formatPounds, type Pounds } from '#lib/mass.js';
import { BAR_POUNDS, type Exercise, type Measure, type Variation } from './exercise.js';

export type Rpe = number & z.$brand<'Rpe'>;

export type Count = number & z.$brand<'Count'>;

export type Load =
	| { readonly kind: 'weight'; readonly pounds: Pounds }
	| { readonly kind: 'added-to-bodyweight'; readonly pounds: Pounds }
	| { readonly kind: 'bodyweight' }
	| { readonly kind: 'band' };

export type Effort = {
	readonly measure: Measure;
	readonly count: Count;
	readonly perSide: boolean;
};

export type SetGroup = {
	readonly sets: Count;
	readonly effort: Effort;
	readonly load: Load;
	readonly rpe?: Rpe;
	readonly variation?: Variation;
	readonly warmup: boolean;
	readonly note?: string;
};

export function loadPounds(load: Load): number | undefined {
	return load.kind === 'weight' || load.kind === 'added-to-bodyweight' ? load.pounds : undefined;
}

function describeEffort({ measure, count, perSide }: Effort): string {
	return `${count}${measure === 'seconds' ? 's' : ''}${perSide ? '/side' : ''}`;
}

export function describeVolume(group: SetGroup): string {
	return `${group.sets} × ${describeEffort(group.effort)}`;
}

export function describeLoad(load: Load, exercise: Exercise): string {
	switch (load.kind) {
		case 'weight':
			return exercise.category === 'main-lift' && exercise.loadShown === 'plates-per-side'
				? `${formatPounds(load.pounds)} lb (${formatPounds((load.pounds - BAR_POUNDS) / 2)}/side + ${BAR_POUNDS} bar)`
				: `${formatPounds(load.pounds)} lb`;
		case 'added-to-bodyweight':
			return `Bodyweight + ${formatPounds(load.pounds)} lb`;
		case 'bodyweight':
			return 'Bodyweight';
		case 'band':
			return 'Band';
	}
}

export function abbreviateLoad(load: Load): string {
	switch (load.kind) {
		case 'weight':
			return formatPounds(load.pounds);
		case 'added-to-bodyweight':
			return `BW + ${formatPounds(load.pounds)}`;
		case 'bodyweight':
			return 'BW';
		case 'band':
			return 'Band';
	}
}
