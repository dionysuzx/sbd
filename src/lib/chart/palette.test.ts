import { describe, expect, it } from 'vitest';
import { markerShapes, platePaintAt, platePaints, platePaintsForCounts } from './palette.js';

const relativeLuminance = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((start) => {
		const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastOnWhite = (hex: string) => 1.05 / (relativeLuminance(hex) + 0.05);

const cyclePaints = [...platePaints, platePaintAt(5), platePaintAt(6), platePaintAt(7)];

describe('palette', () => {
	it.each(cyclePaints)(
		'$stroke meets the WCAG 3:1 contrast minimum for graphics on white',
		(paint) => {
			expect(contrastOnWhite(paint.stroke)).toBeGreaterThanOrEqual(3);
		}
	);

	it('never repeats a color or a shape within one cycle', () => {
		expect(new Set(cyclePaints.map((paint) => paint.fill)).size).toBe(cyclePaints.length);
		expect(new Set(markerShapes).size).toBe(markerShapes.length);
	});

	it('maps lower rep counts to heavier plate colors, independent of input order', () => {
		const paints = platePaintsForCounts([12, 5, 8]);
		expect(paints.get(5)).toEqual(platePaints[0]);
		expect(paints.get(8)).toEqual(platePaints[1]);
		expect(paints.get(12)).toEqual(platePaints[2]);
	});

	it('falls back to gray after the five plate colors', () => {
		const paints = platePaintsForCounts([1, 3, 5, 8, 10, 12]);
		expect(paints.get(12)).toEqual(platePaintAt(5));
		expect(platePaintAt(5).fill).toBe('#4B5563');
	});
});
