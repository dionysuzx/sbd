export type LinkedTextPart =
	| { readonly kind: 'text'; readonly text: string }
	| { readonly kind: 'link'; readonly href: string; readonly text: string };

const urlPattern = /https?:\/\/[^\s<>"'`]+/g;

function httpUrl(raw: string): string | undefined {
	const href = raw.replace(/[.,;:!?]+$/u, '');
	try {
		const url = new URL(href);
		if ((url.protocol === 'http:' || url.protocol === 'https:') && url.hostname) return href;
	} catch {
		return undefined;
	}
	return undefined;
}

export function linkedText(text: string): readonly LinkedTextPart[] {
	const parts: LinkedTextPart[] = [];
	let last = 0;
	for (const match of text.matchAll(urlPattern)) {
		const href = httpUrl(match[0]);
		if (href === undefined) continue;
		const index = match.index ?? 0;
		if (index > last) parts.push({ kind: 'text', text: text.slice(last, index) });
		parts.push({ kind: 'link', href, text: href });
		last = index + href.length;
	}
	if (last < text.length) parts.push({ kind: 'text', text: text.slice(last) });
	return parts;
}
