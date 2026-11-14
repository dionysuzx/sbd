import { describe, expect, it } from 'vitest';
import { cellWidth, FRAME_MS, poseLine, poses } from './kaomoji-chase.js';

describe('kaomoji chase poses', () => {
	it('keeps every frame on the same monospace grid', () => {
		const widths = new Set(poses.map((pose) => cellWidth(poseLine(pose))));
		expect(widths).toEqual(new Set([25]));
	});

	it('keeps matching fields the same width so a frame swap does not shift', () => {
		for (const field of ['dust', 'boy', 'cat', 'accent'] as const) {
			const widths = new Set(poses.map((pose) => cellWidth(pose[field])));
			expect(widths.size, field).toBe(1);
		}
	});

	it('uses four frames at a steady cadence', () => {
		expect(poses).toHaveLength(4);
		expect(FRAME_MS).toBe(200);
	});
});
