import { describe, expect, it } from 'vitest';
import { weightClass } from '#lib/competition/weight-class.js';
import { WeighIns } from '#lib/data-files/weigh-ins.js';
import { summarizeBodyweight } from './weigh-in.js';

const ninetyThree = weightClass(93);

describe('summarizeBodyweight', () => {
	it('compares the latest weigh-in with the last one at least a week earlier', () => {
		const weighIns = WeighIns.parse([
			{ date: '2026-11-01', pounds: 201 },
			{ date: '2026-11-05', pounds: 200 },
			{ date: '2026-11-13', pounds: 199.1 }
		]);
		const summary = summarizeBodyweight(weighIns, ninetyThree);
		expect(summary?.latest.pounds).toBe(199.1);
		expect(summary?.weeklyChange).toBeCloseTo(-0.9);
		expect(summary?.marginBelowClass).toBeCloseTo(5.9);
	});

	it('omits the weekly change until a week of history exists', () => {
		const weighIns = WeighIns.parse([
			{ date: '2026-11-11', pounds: 199.1 },
			{ date: '2026-11-13', pounds: 199.1 }
		]);
		expect(summarizeBodyweight(weighIns, ninetyThree)?.weeklyChange).toBeUndefined();
	});

	it('has nothing to summarize without weigh-ins', () => {
		expect(summarizeBodyweight([], ninetyThree)).toBeUndefined();
	});
});
