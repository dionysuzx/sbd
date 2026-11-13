import type { z } from 'zod';

export type Pounds = number & z.$brand<'Pounds'>;

const POUNDS_PER_KILOGRAM = 2.20462;

export function kilogramsToPounds(kilograms: number): number {
	return kilograms * POUNDS_PER_KILOGRAM;
}

function poundsToKilograms(pounds: number): number {
	return pounds / POUNDS_PER_KILOGRAM;
}

export function formatPounds(pounds: number): string {
	return String(Math.round(pounds * 10) / 10);
}

export function formatKilograms(pounds: number): string {
	return poundsToKilograms(pounds).toFixed(1);
}
