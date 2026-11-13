import { describe, expect, it } from 'vitest';
import { markerShapes, seriesColors } from './palette.js';

const relativeLuminance = (hex: string) => {
	const [r, g, b] = [1, 3, 5].map((start) => {
		const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
		return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastOnWhite = (hex: string) => 1.05 / (relativeLuminance(hex) + 0.05);

describe('palette', () => {
	it.each(seriesColors)('%s meets the WCAG 3:1 contrast minimum for graphics on white', (color) => {
		expect(contrastOnWhite(color)).toBeGreaterThanOrEqual(3);
	});

	it('never repeats a color or a shape within one cycle', () => {
		expect(new Set(seriesColors).size).toBe(seriesColors.length);
		expect(new Set(markerShapes).size).toBe(markerShapes.length);
	});
});
