import { describe, expect, it } from 'vitest';
import { markerShapes, type MarkerShape } from './palette.js';
import {
	chartRadiusFor,
	markerVertices,
	squareSide,
	triangleSide,
	type Point
} from './marker-geometry.js';

const shoelace = (vertices: readonly Point[]): number => {
	const signed = vertices.reduce((area, point, index) => {
		const next = vertices[(index + 1) % vertices.length];
		return area + point.x * next.y - next.x * point.y;
	}, 0);
	return Math.abs(signed) / 2;
};

const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

const filledShapes = markerShapes.filter((shape) => shape !== 'crossRot');

describe('marker geometry', () => {
	it.each(filledShapes)(
		'%s has the same area as a circle of the same base radius',
		(shape: MarkerShape) => {
			const radius = 5;
			const area =
				shape === 'circle' ? Math.PI * radius * radius : shoelace(markerVertices(shape, radius));
			expect(area).toBeCloseTo(Math.PI * radius * radius, 8);
		}
	);

	it('sizes an equilateral triangle and a square from the published formulas', () => {
		const radius = 5;
		const [top, right, left] = markerVertices('triangle', radius);
		expect(distance(top, right)).toBeCloseTo(triangleSide(radius), 10);
		expect(distance(right, left)).toBeCloseTo(triangleSide(radius), 10);
		expect(distance(left, top)).toBeCloseTo(triangleSide(radius), 10);
		expect(triangleSide(radius)).toBeCloseTo(radius * Math.sqrt((4 * Math.PI) / Math.sqrt(3)), 10);

		const [a, b] = markerVertices('rect', radius);
		expect(distance(a, b)).toBeCloseTo(squareSide(radius), 10);
		expect(squareSide(radius)).toBeCloseTo(radius * Math.sqrt(Math.PI), 10);
	});

	it('centers the triangle on its centroid so it sits on the data point', () => {
		const vertices = markerVertices('triangle', 5);
		const cx = vertices.reduce((sum, point) => sum + point.x, 0) / vertices.length;
		const cy = vertices.reduce((sum, point) => sum + point.y, 0) / vertices.length;
		expect(cx).toBeCloseTo(0, 10);
		expect(cy).toBeCloseTo(0, 10);
	});

	it('gives Chart.js the circumradius that produces those equal-area polygons', () => {
		expect(chartRadiusFor('circle', 5)).toBe(5);
		expect(chartRadiusFor('triangle', 5)).toBeCloseTo(triangleSide(5) / Math.sqrt(3), 10);
		expect(chartRadiusFor('rect', 5)).toBeCloseTo(squareSide(5) / Math.SQRT2, 10);
		expect(chartRadiusFor('rectRot', 5)).toBe(chartRadiusFor('rect', 5));
	});
});
