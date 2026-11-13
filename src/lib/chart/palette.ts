export const seriesColors = [
	'#0072B2',
	'#007A4D',
	'#C08A00',
	'#E5609E',
	'#7C3AED',
	'#0E8FA8',
	'#D55E00',
	'#882255'
] as const;

export type MarkerShape = 'circle' | 'triangle' | 'rect' | 'rectRot' | 'star' | 'crossRot';

export const markerShapes: readonly MarkerShape[] = [
	'circle',
	'triangle',
	'rect',
	'rectRot',
	'star',
	'crossRot'
];

export const seriesColor = (index: number): string => seriesColors[index % seriesColors.length];

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
