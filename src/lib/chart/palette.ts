export const seriesColors = [
	'#0072B2',
	'#FE6100',
	'#332288',
	'#648FFF',
	'#AA3377',
	'#CC79A7',
	'#882255',
	'#9C755F'
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

export const milestoneColors = {
	line: '#a16207',
	star: '#facc15',
	label: '#854d0e'
} as const;
