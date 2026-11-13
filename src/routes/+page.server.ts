import { z } from 'zod';
import { localCalendarDate } from '#lib/calendar-date.js';
import { ProgramFile } from '#lib/data-files/program.js';
import { TrainingLog } from '#lib/data-files/training-log.js';
import { WeighIns } from '#lib/data-files/weigh-ins.js';
import program from '../../data/program.json';
import trainingLog from '../../data/training-log.json';
import weighIns from '../../data/weigh-ins.json';
import type { PageServerLoad } from './$types';

function parseDataFile<T>(schema: z.ZodType<T>, contents: unknown, file: string): T {
	const result = schema.safeParse(contents);
	if (!result.success) throw new Error(`${file} is invalid:\n${z.prettifyError(result.error)}`);
	return result.data;
}

export const load: PageServerLoad = () => ({
	program: parseDataFile(ProgramFile, program, 'data/program.json'),
	sessions: parseDataFile(TrainingLog, trainingLog, 'data/training-log.json'),
	weighIns: parseDataFile(WeighIns, weighIns, 'data/weigh-ins.json'),
	builtOn: localCalendarDate(new Date())
});
