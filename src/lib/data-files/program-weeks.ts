import { z } from 'zod';
import { daysBetween, dayNumber, isMonday } from '#lib/calendar-date.js';
import {
	containsDate,
	phases,
	type CountRange,
	type PlannedDay,
	type Prescription,
	type RpeTarget,
	type TrainingWeek
} from '#lib/plan/training-week.js';
import { exerciseIds, exercises, isUnilateral, measureOf } from '#lib/training/exercise.js';
import { CalendarDate, Count, Rpe } from './primitives.js';

const Note = z.string().trim().min(1);

const CountOrRange = z.union([
	Count.transform((count): CountRange => ({ min: count, max: count })),
	z
		.string()
		.regex(/^\d+-\d+$/, 'use a whole number or a range like "8-12"')
		.transform((text) => text.split('-').map(Number))
		.pipe(
			z
				.tuple([Count, Count])
				.refine(([min, max]) => min < max, 'a range must go from low to high')
				.transform(([min, max]): CountRange => ({ min, max }))
		)
]);

const RpeTargetFile = z.union([
	Rpe.transform((rpe): RpeTarget => ({ kind: 'exact', rpe })),
	z
		.string()
		.regex(/^<=\d+(\.5)?$/)
		.transform((text) => Number(text.slice(2)))
		.pipe(Rpe)
		.transform((rpe): RpeTarget => ({ kind: 'at-most', rpe })),
	z
		.string()
		.regex(/^\d+(\.5)?-\d+(\.5)?$/, 'use an RPE like 7, "5-6", or "<=8"')
		.transform((text) => text.split('-').map(Number))
		.pipe(
			z
				.tuple([Rpe, Rpe])
				.refine(([from, to]) => from < to, 'an RPE range must go from low to high')
				.transform(([from, to]): RpeTarget => ({ kind: 'range', from, to }))
		)
]);

const PrescriptionFile = z
	.strictObject({
		exercise: z.enum(exerciseIds),
		sets: Count,
		reps: CountOrRange.optional(),
		seconds: CountOrRange.optional(),
		rpe: RpeTargetFile.optional(),
		note: Note.optional()
	})
	.transform((raw, context): Prescription => {
		const exercise = exercises[raw.exercise];
		const measure = measureOf(exercise);
		const [expected, unexpected] =
			measure === 'reps' ? (['reps', 'seconds'] as const) : (['seconds', 'reps'] as const);
		const count = raw[expected];
		if (raw[unexpected] !== undefined || count === undefined) {
			context.issues.push({
				code: 'custom',
				message: `${exercise.name} is prescribed in ${measure}`,
				input: raw,
				path: [raw[unexpected] === undefined ? expected : unexpected]
			});
			return z.NEVER;
		}
		return {
			exercise,
			sets: raw.sets,
			effort: { measure, count, perSide: isUnilateral(exercise) },
			rpe: raw.rpe,
			note: raw.note
		};
	});

const PlannedDayFile = z.strictObject({
	date: CalendarDate,
	title: Note,
	note: Note.optional(),
	work: z.array(PrescriptionFile)
}) satisfies z.ZodType<PlannedDay, unknown>;

const TrainingWeekFile = z
	.strictObject({
		start: CalendarDate.refine((date) => isMonday(dayNumber(date)), 'a week starts on a Monday'),
		phase: z.enum(phases),
		note: Note.optional(),
		days: z.array(PlannedDayFile)
	})
	.superRefine((week, context) => {
		week.days.forEach((day, index) => {
			if (!containsDate(week, day.date)) {
				context.addIssue({
					code: 'custom',
					message: `${day.date} is outside the week of ${week.start}`,
					path: ['days', index, 'date']
				});
			}
			const previous = week.days[index - 1];
			if (previous !== undefined && previous.date >= day.date) {
				context.addIssue({
					code: 'custom',
					message: `${day.date} must come after ${previous.date}`,
					path: ['days', index, 'date']
				});
			}
		});
	}) satisfies z.ZodType<TrainingWeek, unknown>;

export const ProgramWeeks = z
	.array(TrainingWeekFile)
	.nonempty()
	.superRefine((weeks, context) => {
		weeks.forEach((week, index) => {
			const previous = weeks[index - 1];
			if (previous !== undefined && daysBetween(previous.start, week.start) !== 7) {
				context.addIssue({
					code: 'custom',
					message: `the week of ${week.start} must directly follow the week of ${previous.start}`,
					path: [index, 'start']
				});
			}
		});
	});
