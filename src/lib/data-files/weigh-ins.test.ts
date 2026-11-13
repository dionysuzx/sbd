import { describe, expect, it } from 'vitest';
import { WeighIns } from './weigh-ins.js';

describe('WeighIns', () => {
	it('orders weigh-ins by date', () => {
		const weighIns = WeighIns.parse([
			{ date: '2026-11-13', pounds: 199.1 },
			{ date: '2026-11-11', pounds: 199.4 }
		]);
		expect(weighIns.map((weighIn) => weighIn.date)).toEqual(['2026-11-11', '2026-11-13']);
	});

	it('rejects two weigh-ins on one date', () => {
		const result = WeighIns.safeParse([
			{ date: '2026-11-13', pounds: 199.1 },
			{ date: '2026-11-13', pounds: 198.8 }
		]);
		expect(result.success).toBe(false);
	});
});
