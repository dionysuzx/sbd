import { describe, expect, it } from 'vitest';
import { Chart } from './line-element.js';

describe('line element defaults', () => {
	it('uses round joins so sharp V corners do not miter into spikes', () => {
		expect(Chart.defaults.elements.line.borderJoinStyle).toBe('round');
		expect(Chart.defaults.elements.line.borderCapStyle).toBe('round');
	});
});
