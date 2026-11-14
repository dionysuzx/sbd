// IPF calibrated plates, heaviest first: 25 kg red, 20 kg blue, 15 kg yellow,
// 10 kg green, 2.5 kg black. White 5 kg plates are skipped so series stay
// visible on the light background. After those five, further rep counts fall
// back to gray, then darker stone shades, then wrap.
export const plateColors = ['#C8102E', '#003DA5', '#FFCD00', '#00843D', '#1A1A1A'] as const;

const fallbackPlateColors = ['#4B5563', '#374151', '#57534E'] as const;

export const bodyweightColor = '#0072B2';

export const plateColorAt = (rank: number): string =>
	rank < plateColors.length
		? plateColors[rank]
		: fallbackPlateColors[(rank - plateColors.length) % fallbackPlateColors.length];

export function plateColorsForCounts(counts: readonly number[]): ReadonlyMap<number, string> {
	const unique = [...new Set(counts)].toSorted((a, b) => a - b);
	return new Map(unique.map((count, rank) => [count, plateColorAt(rank)]));
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
