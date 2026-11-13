export type StrokeScale = {
	readonly line: number;
	readonly point: number;
	readonly tickFont: number;
	readonly labelFont: number;
	readonly markerLine: number;
	readonly starOuter: number;
	readonly starInner: number;
};

const NARROW_WIDTH = 360;
const WIDE_WIDTH = 840;

export function strokeScaleFor(chartWidth: number): StrokeScale {
	const t = Math.min(1, Math.max(0, (chartWidth - NARROW_WIDTH) / (WIDE_WIDTH - NARROW_WIDTH)));
	const between = (narrow: number, wide: number) => narrow + (wide - narrow) * t;
	return {
		line: between(2, 2.8),
		point: between(1, 1.75),
		tickFont: between(12, 15),
		labelFont: between(10, 13),
		markerLine: between(1.5, 2.2),
		starOuter: between(8, 14),
		starInner: between(3.6, 6.3)
	};
}
