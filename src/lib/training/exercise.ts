export const exerciseIds = [
	'squat',
	'bench',
	'deadlift',
	'rfe-lunge',
	'lat-pullover',
	'chest-supported-row',
	'bird-dog-row',
	'hamstring-curl',
	'seated-cable-row',
	'triceps-pressdown',
	'straight-arm-pulldown',
	'lat-pulldown',
	'reverse-nordic',
	'copenhagen',
	'ir-pull-apart',
	'dip',
	'pull-up',
	'back-extension',
	'curl'
] as const;

export type ExerciseId = (typeof exerciseIds)[number];

export type Variation = { readonly id: string; readonly label: string };

export type LoadKind = 'weight' | 'bodyweight' | 'added-to-bodyweight' | 'band';
export type Measure = 'reps' | 'seconds';

type ExerciseShape = {
	readonly id: ExerciseId;
	readonly name: string;
	readonly variations: readonly Variation[];
};

export type MainLift = ExerciseShape & {
	readonly category: 'main-lift';
	readonly loadShown: 'total' | 'plates-per-side';
};

export type Accessory = ExerciseShape & {
	readonly category: 'accessory';
	readonly load: LoadKind;
	readonly measure: Measure;
	readonly unilateral: boolean;
};

export type Exercise = MainLift | Accessory;

export const BAR_POUNDS = 45;

export function loadKindOf(exercise: Exercise): LoadKind {
	return exercise.category === 'main-lift' ? 'weight' : exercise.load;
}

export function measureOf(exercise: Exercise): Measure {
	return exercise.category === 'main-lift' ? 'reps' : exercise.measure;
}

export function isUnilateral(exercise: Exercise): boolean {
	return exercise.category === 'accessory' && exercise.unilateral;
}

export function findVariation(exercise: Exercise, id: string): Variation | undefined {
	return exercise.variations.find((variation) => variation.id === id);
}

export function variationIndex(exercise: Exercise, variation: Variation | undefined): number {
	return Math.max(
		0,
		exercise.variations.findIndex((known) => known.id === variation?.id)
	);
}

const mainLift = <Id extends ExerciseId>(
	id: Id,
	name: string,
	variations: Variation[],
	loadShown: MainLift['loadShown'] = 'total'
): MainLift & { readonly id: Id } => ({ id, name, category: 'main-lift', variations, loadShown });

const accessory = <Id extends ExerciseId>(
	id: Id,
	name: string,
	options: Partial<Pick<Accessory, 'load' | 'measure' | 'unilateral' | 'variations'>> = {}
): Accessory & { readonly id: Id } => ({
	id,
	name,
	category: 'accessory',
	load: options.load ?? 'weight',
	measure: options.measure ?? 'reps',
	unilateral: options.unilateral ?? false,
	variations: options.variations ?? []
});

export const exercises: { readonly [Id in ExerciseId]: Exercise & { readonly id: Id } } = {
	squat: mainLift(
		'squat',
		'Squat',
		[
			{ id: 'high-bar', label: 'High-bar' },
			{ id: 'low-bar-belted', label: 'Low-bar (belted)' }
		],
		'plates-per-side'
	),
	bench: mainLift('bench', 'Bench', [
		{ id: 'paused', label: 'Comp standard' },
		{ id: 'touch-and-go', label: 'Touch-and-go' }
	]),
	deadlift: mainLift('deadlift', 'Deadlift', [{ id: 'conventional', label: 'Conventional' }]),
	'rfe-lunge': accessory('rfe-lunge', 'RFE lunge', {
		variations: [
			{ id: 'hand-support', label: 'With hand support' },
			{ id: 'no-hand-support', label: 'No hand support' }
		]
	}),
	'lat-pullover': accessory('lat-pullover', 'DB lat pullover (glute bridge)', {
		variations: [{ id: 'glute-bridge', label: 'In glute bridge' }]
	}),
	'chest-supported-row': accessory('chest-supported-row', 'Chest-supported row', {
		variations: [{ id: 'dumbbells', label: 'With dumbbells' }]
	}),
	'bird-dog-row': accessory('bird-dog-row', 'Bird dog row', {
		unilateral: true
	}),
	'hamstring-curl': accessory('hamstring-curl', 'Seated hamstring curl', {
		variations: [{ id: 'seated', label: 'Seated' }]
	}),
	'seated-cable-row': accessory('seated-cable-row', 'Seated cable row', {
		variations: [
			{ id: 'narrow-v-handle', label: 'Narrow V-handle' },
			{ id: 'wide-grip', label: 'Wide grip' }
		]
	}),
	'triceps-pressdown': accessory('triceps-pressdown', 'Cable triceps pressdown', {
		variations: [{ id: 'straight-bar', label: 'Straight bar' }]
	}),
	'straight-arm-pulldown': accessory('straight-arm-pulldown', 'Straight-arm pulldown', {
		variations: [{ id: 'straight-bar', label: 'Straight bar' }]
	}),
	'lat-pulldown': accessory('lat-pulldown', 'Lat pulldown'),
	'reverse-nordic': accessory('reverse-nordic', 'Reverse Nordic', {
		load: 'bodyweight',
		variations: [
			{ id: 'unassisted', label: 'Bodyweight' },
			{ id: 'band-assisted', label: 'Banded' }
		]
	}),
	copenhagen: accessory('copenhagen', 'Copenhagen', {
		load: 'bodyweight',
		measure: 'seconds',
		unilateral: true
	}),
	'ir-pull-apart': accessory('ir-pull-apart', 'Banded IR pull-apart', {
		load: 'band'
	}),
	dip: accessory('dip', 'Weighted dip', { load: 'added-to-bodyweight' }),
	'pull-up': accessory('pull-up', 'Pull-up', { load: 'bodyweight' }),
	'back-extension': accessory('back-extension', 'Back extension'),
	curl: accessory('curl', 'Curl')
};
