import { z } from 'zod';

export const CalendarDate = z.iso.date().brand<'CalendarDate'>();
export const Pounds = z.number().positive().brand<'Pounds'>();
export const Rpe = z.number().min(1).max(10).multipleOf(0.5).brand<'Rpe'>();
export const Count = z.int().positive().brand<'Count'>();

export function uniqueBy<T>(key: (item: T) => string, describe: (key: string) => string) {
	return (items: readonly T[], context: z.RefinementCtx) => {
		const seen = new Set<string>();
		items.forEach((item, index) => {
			const itemKey = key(item);
			if (seen.has(itemKey)) {
				context.addIssue({ code: 'custom', message: describe(itemKey), path: [index] });
			}
			seen.add(itemKey);
		});
	};
}
