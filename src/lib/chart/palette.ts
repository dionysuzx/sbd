export type SeriesPaint = {
	readonly fill: string;
	readonly stroke: string;
};

// IPF calibrated plates, heaviest first: 25 kg red, 20 kg blue, 15 kg yellow,
// 10 kg green, 2.5 kg black. White 5 kg plates are skipped so series stay
// visible on the light background. Yellow keeps the bright plate fill and uses
// a darker stroke for contrast. After those five, further rep counts fall back
// to gray, then darker stone shades, then wrap.
export const platePaints: readonly SeriesPaint[] = [
	{ fill: '#C8102E', stroke: '#C8102E' },
	{ fill: '#003DA5', stroke: '#003DA5' },
	{ fill: '#FFCD00', stroke: '#5C4A00' },
	{ fill: '#00843D', stroke: '#00843D' },
	{ fill: '#1A1A1A', stroke: '#1A1A1A' }
];

const fallbackPlatePaints: readonly SeriesPaint[] = [
	{ fill: '#4B5563', stroke: '#4B5563' },
	{ fill: '#374151', stroke: '#374151' },
	{ fill: '#57534E', stroke: '#57534E' }
];

export const bodyweightColor = '#0072B2';

export const platePaintAt = (rank: number): SeriesPaint =>
	rank < platePaints.length
		? platePaints[rank]
		: fallbackPlatePaints[(rank - platePaints.length) % fallbackPlatePaints.length];

export function platePaintsForCounts(counts: readonly number[]): ReadonlyMap<number, SeriesPaint> {
	const unique = [...new Set(counts)].toSorted((a, b) => a - b);
	return new Map(unique.map((count, rank) => [count, platePaintAt(rank)]));
}

export type MarkerShape = 'circle' | 'triangle' | 'rect' | 'rectRot' | 'star' | 'crossRot';

export const markerShapes: readonly MarkerShape[] = [
	'circle',
	'triangle',
	'rect',
	'rectRot',
	'star',
	'crossRot'
];

export const markerShape = (index: number): MarkerShape =>
	markerShapes[index % markerShapes.length];

export const selectionOutline = '#111827';

export const referenceLineColors = { target: '#b45309', next: '#64748b' } as const;

export const milestoneColors = {
	line: '#eab308',
	starFill: '#facc15',
	starOutline: '#a16207',
	label: '#854d0e'
} as const;
