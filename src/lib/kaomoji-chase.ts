export type Pose = {
	dust: string;
	boy: string;
	cat: string;
	accent: string;
};

/** Visible columns per frame (combining marks do not count). */
export const LINE_CELLS = 25;

export const FRAME_MS = 200;

export const poses: readonly Pose[] = [
	{ dust: 'ε=ε=  ', boy: '( ò_ó ) ', cat: '(=^•ω•^=)●', accent: ' ' },
	{ dust: ' ε=ε  ', boy: '( òωó ) ', cat: '(=ΦωΦ=)  ●', accent: ' ' },
	{ dust: 'ε=ε=ε ', boy: '( ò_ó )/', cat: '(=^•ω•^=)●', accent: '!' },
	{ dust: '  ε=  ', boy: '\\(ò_ó)/ ', cat: '(=^•ω•^=)●', accent: '♡' }
];

export const CYCLE_MS = FRAME_MS * poses.length;

export function poseLine(pose: Pose): string {
	return `${pose.dust}${pose.boy}${pose.cat}${pose.accent}`;
}

export function cellWidth(text: string): number {
	let width = 0;
	for (const ch of text) {
		if (/\p{M}/u.test(ch)) continue;
		width += 1;
	}
	return width;
}
