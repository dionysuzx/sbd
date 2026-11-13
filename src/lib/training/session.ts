import type { CalendarDate } from '#lib/calendar-date.js';
import type { Exercise } from './exercise.js';
import type { SetGroup } from './set-group.js';

export const sources = ['pre-trainer-csv', 'pre-trainer-log-pdf', 'trainer-log'] as const;
export type Source = (typeof sources)[number];

export type Session = {
	readonly date: CalendarDate;
	readonly exercise: Exercise;
	readonly source: Source;
	readonly setGroups: readonly [SetGroup, ...SetGroup[]];
};

export const sessionKey = (session: Session): string => `${session.date} ${session.exercise.id}`;
