import { describe, expect, it } from 'vitest';
import { linkedText } from './linked-text.js';

describe('linkedText', () => {
	it('keeps plain text as a single text part', () => {
		expect(linkedText('Lying, per the gym')).toEqual([
			{ kind: 'text', text: 'Lying, per the gym' }
		]);
	});

	it('turns a bare http(s) URL into a link with the same href', () => {
		const url = 'https://www.youtube.com/shorts/QsLtYTJL5LI';
		expect(linkedText(url)).toEqual([{ kind: 'link', href: url, text: url }]);
	});

	it('keeps surrounding text and trailing punctuation outside the href', () => {
		expect(linkedText('See https://example.com/form for cues.')).toEqual([
			{ kind: 'text', text: 'See ' },
			{ kind: 'link', href: 'https://example.com/form', text: 'https://example.com/form' },
			{ kind: 'text', text: ' for cues.' }
		]);
		expect(linkedText('https://example.com/form.')).toEqual([
			{ kind: 'link', href: 'https://example.com/form', text: 'https://example.com/form' },
			{ kind: 'text', text: '.' }
		]);
	});

	it('ignores non-http schemes and urls without a host', () => {
		expect(linkedText('javascript:alert(1)')).toEqual([
			{ kind: 'text', text: 'javascript:alert(1)' }
		]);
		expect(linkedText('https://')).toEqual([{ kind: 'text', text: 'https://' }]);
	});

	it('splits multiple urls', () => {
		expect(linkedText('http://a.example https://b.example/x')).toEqual([
			{ kind: 'link', href: 'http://a.example', text: 'http://a.example' },
			{ kind: 'text', text: ' ' },
			{ kind: 'link', href: 'https://b.example/x', text: 'https://b.example/x' }
		]);
	});
});
