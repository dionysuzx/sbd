import { markerShapes, type MarkerShape } from './palette.js';

export type Point = { readonly x: number; readonly y: number };

const TRIANGLE_SIDE_FACTOR = Math.sqrt((4 * Math.PI) / Math.sqrt(3));
const SQUARE_SIDE_FACTOR = Math.sqrt(Math.PI);
const STAR_INNER_RATIO = (3 - Math.sqrt(5)) / 2;

export const triangleSide = (circleRadius: number): number => circleRadius * TRIANGLE_SIDE_FACTOR;

export const squareSide = (circleRadius: number): number => circleRadius * SQUARE_SIDE_FACTOR;

export const triangleChartRadius = (circleRadius: number): number =>
	triangleSide(circleRadius) / Math.sqrt(3);

export const squareChartRadius = (circleRadius: number): number =>
	squareSide(circleRadius) / Math.SQRT2;

const starAreaCoefficient = (): number => {
	const inner = STAR_INNER_RATIO;
	let area = 0;
	for (let vertex = 0; vertex < 10; vertex++) {
		const angle = -Math.PI / 2 + (vertex * Math.PI) / 5;
		const next = -Math.PI / 2 + ((vertex + 1) * Math.PI) / 5;
		const radius = vertex % 2 === 0 ? 1 : inner;
		const nextRadius = (vertex + 1) % 2 === 0 ? 1 : inner;
		area +=
			radius * Math.cos(angle) * (nextRadius * Math.sin(next)) -
			nextRadius * Math.cos(next) * (radius * Math.sin(angle));
	}
	return Math.abs(area) / 2;
};

const STAR_CHART_RADIUS_FACTOR = Math.sqrt(Math.PI / starAreaCoefficient());

export const starChartRadius = (circleRadius: number): number =>
	circleRadius * STAR_CHART_RADIUS_FACTOR;

export function chartRadiusFor(shape: MarkerShape, circleRadius: number): number {
	switch (shape) {
		case 'circle':
			return circleRadius;
		case 'triangle':
			return triangleChartRadius(circleRadius);
		case 'rect':
		case 'rectRot':
			return squareChartRadius(circleRadius);
		case 'star':
			return starChartRadius(circleRadius);
		case 'crossRot':
			return squareChartRadius(circleRadius);
	}
}

export const maxChartRadiusFactor = Math.max(
	...markerShapes.map((shape) => chartRadiusFor(shape, 1))
);

export function markerVertices(shape: MarkerShape, circleRadius: number): readonly Point[] {
	switch (shape) {
		case 'circle':
			return [];
		case 'triangle': {
			const radius = triangleChartRadius(circleRadius);
			return [
				{ x: 0, y: -radius },
				{ x: (Math.sqrt(3) / 2) * radius, y: radius / 2 },
				{ x: -(Math.sqrt(3) / 2) * radius, y: radius / 2 }
			];
		}
		case 'rect': {
			const half = squareSide(circleRadius) / 2;
			return [
				{ x: -half, y: -half },
				{ x: half, y: -half },
				{ x: half, y: half },
				{ x: -half, y: half }
			];
		}
		case 'rectRot': {
			const diagonal = squareChartRadius(circleRadius);
			return [
				{ x: 0, y: -diagonal },
				{ x: diagonal, y: 0 },
				{ x: 0, y: diagonal },
				{ x: -diagonal, y: 0 }
			];
		}
		case 'star': {
			const outer = starChartRadius(circleRadius);
			const inner = outer * STAR_INNER_RATIO;
			return Array.from({ length: 10 }, (_, vertex) => {
				const angle = -Math.PI / 2 + (vertex * Math.PI) / 5;
				const radius = vertex % 2 === 0 ? outer : inner;
				return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
			});
		}
		case 'crossRot': {
			const arm = squareChartRadius(circleRadius);
			return [
				{ x: -arm, y: -arm },
				{ x: arm, y: arm },
				{ x: arm, y: -arm },
				{ x: -arm, y: arm }
			];
		}
	}
}

export const glyphCircleRadius = 5;
export const glyphViewBoxSize = 20;
export const glyphCenter = glyphViewBoxSize / 2;
export const glyphViewBox = `0 0 ${glyphViewBoxSize} ${glyphViewBoxSize}`;
export const glyphCrossStrokeWidth = 3;

export function glyphPoints(shape: MarkerShape): string {
	return markerVertices(shape, glyphCircleRadius)
		.map((point) => `${point.x + glyphCenter},${point.y + glyphCenter}`)
		.join(' ');
}

export function glyphCrossPath(): string {
	const [start, end, startB, endB] = markerVertices('crossRot', glyphCircleRadius);
	const to = (point: Point) => `${point.x + glyphCenter},${point.y + glyphCenter}`;
	return `M${to(start)} L${to(end)} M${to(startB)} L${to(endB)}`;
}
