import { z } from 'zod';
import type { WeighIn } from '#lib/bodyweight/weigh-in.js';
import { CalendarDate, Pounds, uniqueBy } from './primitives.js';

export const WeighIns = z
	.array(z.strictObject({ date: CalendarDate, pounds: Pounds }))
	.superRefine(
		uniqueBy(
			({ date }) => date,
			(date) => `${date} has more than one weigh-in`
		)
	)
	.transform((weighIns): WeighIn[] => weighIns.toSorted((a, b) => a.date.localeCompare(b.date)));
