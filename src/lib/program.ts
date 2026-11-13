import type { CalendarDate } from '#lib/calendar-date.js';
import type { Meet } from '#lib/competition/meet.js';
import type { WeightClass } from '#lib/competition/weight-class.js';
import type { Exercise } from '#lib/training/exercise.js';

export type Milestone = { readonly date: CalendarDate; readonly label: string };

export type Program = {
	readonly therapyStart: Milestone;
	readonly meet: Meet;
	readonly weightClasses: { readonly target: WeightClass; readonly next: WeightClass };
	readonly currentAccessories: readonly Exercise[];
};

export function isCharted(program: Program, exercise: Exercise): boolean {
	return (
		exercise.category === 'main-lift' ||
		program.currentAccessories.some((accessory) => accessory.id === exercise.id)
	);
}
