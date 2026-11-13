import { kilogramsToPounds } from '#lib/mass.js';

export type WeightClass = { readonly kilograms: number; readonly limitPounds: number };

export function weightClass(kilograms: number): WeightClass {
	return { kilograms, limitPounds: Math.round(kilogramsToPounds(kilograms) * 10) / 10 };
}

export function describeWeightClass({ kilograms, limitPounds }: WeightClass): string {
	return `${kilograms} kg class (${limitPounds.toFixed(1)} lb)`;
}
