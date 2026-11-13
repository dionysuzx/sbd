import { describe, expect, it } from 'vitest';
import committedProgram from '../../../data/program.json';
import { ProgramFile } from './program.js';

describe('ProgramFile', () => {
	it('accepts the committed program and derives class limits in pounds', () => {
		const program = ProgramFile.parse(committedProgram);
		expect(program.weightClasses.target).toEqual({ kilograms: 93, limitPounds: 205 });
		expect(program.weightClasses.next).toEqual({ kilograms: 105, limitPounds: 231.5 });
	});

	it('rejects a main lift listed as an accessory', () => {
		const result = ProgramFile.safeParse({
			...committedProgram,
			currentAccessories: ['squat']
		});
		expect(result.success).toBe(false);
	});
});
