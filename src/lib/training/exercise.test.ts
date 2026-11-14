import { describe, expect, it } from 'vitest';
import { markerShape } from '#lib/chart/palette.js';
import { exercises, findVariation, loadKindOf, variationIndex } from './exercise.js';

describe('hamstring curl', () => {
	const curl = exercises['hamstring-curl'];

	it('is one exercise with seated and lying variations', () => {
		expect(curl.name).toBe('Hamstring curl');
		expect(curl.variations.map((variation) => variation.id)).toEqual(['seated', 'lying']);
	});

	it('uses a circle for seated and a triangle for lying', () => {
		expect(markerShape(variationIndex(curl, findVariation(curl, 'seated')))).toBe('circle');
		expect(markerShape(variationIndex(curl, findVariation(curl, 'lying')))).toBe('triangle');
	});
});

describe('reverse Nordic', () => {
	it('is always band-assisted and takes no pound load', () => {
		const exercise = exercises['reverse-nordic'];
		expect(exercise.name).toBe('Banded reverse Nordic');
		expect(loadKindOf(exercise)).toBe('band');
		expect(exercise.variations).toEqual([]);
	});
});
