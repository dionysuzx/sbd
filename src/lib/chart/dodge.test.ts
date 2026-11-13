import { describe, expect, it } from 'vitest';
import { dodgeOffsets } from './dodge.js';

const wide = { left: 0, right: 1000 };

describe('dodgeOffsets', () => {
	it('spreads markers that sit on top of each other symmetrically', () => {
		const offsets = dodgeOffsets(
			[
				{ x: 500, y: 100, radius: 7 },
				{ x: 500, y: 100, radius: 7 }
			],
			wide
		);
		expect(offsets).toEqual([-8, 8]);
	});

	it('leaves markers that are already distinguishable in place', () => {
		const offsets = dodgeOffsets(
			[
				{ x: 500, y: 100, radius: 7 },
				{ x: 500, y: 120, radius: 7 },
				{ x: 520, y: 100, radius: 7 }
			],
			wide
		);
		expect(offsets).toEqual([0, 0, 0]);
	});

	it('keeps a dodged cluster inside the plot area', () => {
		const offsets = dodgeOffsets(
			[
				{ x: 995, y: 100, radius: 7 },
				{ x: 995, y: 100, radius: 7 }
			],
			wide
		);
		expect(Math.max(...offsets.map((offset) => 995 + offset + 7))).toBeLessThanOrEqual(1000);
		expect(offsets[1] - offsets[0]).toBe(16);
	});
});
