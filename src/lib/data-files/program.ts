import { z } from 'zod';
import { weightClass } from '#lib/competition/weight-class.js';
import type { Program } from '#lib/program.js';
import { exerciseIds, exercises } from '#lib/training/exercise.js';
import { CalendarDate } from './primitives.js';

const Kilograms = z.number().positive();

export const ProgramFile = z
	.strictObject({
		therapyStart: z.strictObject({ date: CalendarDate, label: z.string().min(1) }),
		meet: z.strictObject({ name: z.string().min(1), date: CalendarDate }),
		weightClasses: z.strictObject({ target: Kilograms, next: Kilograms }),
		currentAccessories: z
			.array(z.enum(exerciseIds))
			.refine((ids) => new Set(ids).size === ids.length, 'lists an accessory twice')
			.refine(
				(ids) => ids.every((id) => exercises[id].category === 'accessory'),
				'lists a main lift as an accessory'
			)
	})
	.transform((raw): Program => ({
		therapyStart: raw.therapyStart,
		meet: raw.meet,
		weightClasses: {
			target: weightClass(raw.weightClasses.target),
			next: weightClass(raw.weightClasses.next)
		},
		currentAccessories: raw.currentAccessories.map((id) => exercises[id])
	}));
