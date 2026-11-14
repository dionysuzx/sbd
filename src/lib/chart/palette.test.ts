import { describe, expect, it } from 'vitest';
import { markerShapes, plateColorAt, plateColors, plateColorsForCounts } from './palette.js';

const relativeLuminance = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((start) => {
		const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastOnWhite = (hex: string) => 1.05 / (relativeLuminance(hex) + 0.05);

const cycleColors = [...plateColors, plateColorAt(5), plateColorAt(6), plateColorAt(7)];
const plateYellow = plateColors[2];

describe('palette', () => {
	it.each(cycleColors.filter((color) => color !== plateYellow))(
		'%s meets the WCAG 3:1 contrast minimum for graphics on white',
		(color) => {
			expect(contrastOnWhite(color)).toBeGreaterThanOrEqual(3);
		}
	);

	it('never repeats a color or a shape within one cycle', () => {
		expect(new Set(cycleColors).size).toBe(cycleColors.length);
		expect(new Set(markerShapes).size).toBe(markerShapes.length);
	});

	it('maps lower rep counts to heavier plate colors, independent of input order', () => {
		const colors = plateColorsForCounts([12, 5, 8]);
		expect(colors.get(5)).toBe(plateColors[0]);
		expect(colors.get(8)).toBe(plateColors[1]);
		expect(colors.get(12)).toBe(plateColors[2]);
	});

	it('falls back to gray after the five plate colors', () => {
		const colors = plateColorsForCounts([1, 3, 5, 8, 10, 12]);
		expect(colors.get(12)).toBe(plateColorAt(5));
		expect(plateColorAt(5)).toBe('#4B5563');
	});
});
