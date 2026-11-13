import { describe, expect, it } from 'vitest';
import { TrainingLog } from '#lib/data-files/training-log.js';
import { exercises } from './exercise.js';
import { abbreviateLoad, describeLoad, describeVolume } from './set-group.js';

const log = TrainingLog.parse([
	{
		date: '2026-11-12',
		exercise: 'dip',
		source: 'trainer-log',
		setGroups: [{ sets: 1, reps: 10, load: 45 }]
	},
	{
		date: '2026-11-12',
		exercise: 'bird-dog-row',
		source: 'trainer-log',
		setGroups: [{ sets: 3, reps: 8, load: 20 }]
	},
	{
		date: '2026-11-12',
		exercise: 'squat',
		source: 'trainer-log',
		setGroups: [{ sets: 1, reps: 5, load: 245, variation: 'low-bar-belted' }]
	}
]);

const firstSetOf = (id: string) => {
	const session = log.find((logged) => logged.exercise.id === id);
	if (!session) throw new Error(`no ${id} session`);
	return session.setGroups[0];
};

const dip = firstSetOf('dip');
const birdDog = firstSetOf('bird-dog-row');
const squat = firstSetOf('squat');

describe('set group descriptions', () => {
	it('shows squat loads as plates per side on a 45 lb bar', () => {
		expect(describeLoad(squat.load, exercises.squat)).toBe('245 lb (100/side + 45 bar)');
	});

	it('shows weight added to bodyweight', () => {
		expect(describeLoad(dip.load, exercises.dip)).toBe('Bodyweight + 45 lb');
		expect(abbreviateLoad(dip.load)).toBe('BW + 45');
	});

	it('marks per-side reps on unilateral exercises', () => {
		expect(describeVolume(birdDog)).toBe('3 × 8/side');
	});
});
