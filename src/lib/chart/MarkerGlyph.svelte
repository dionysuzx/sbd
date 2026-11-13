<script lang="ts">
	import type { MarkerShape } from './palette.js';

	let { shape }: { shape: MarkerShape } = $props();
</script>

<svg viewBox="0 0 12 12" aria-hidden="true">
	{#if shape === 'circle'}
		<circle cx="6" cy="6" r="5" />
	{:else if shape === 'triangle'}
		<polygon points="6,1 11,11 1,11" />
	{:else if shape === 'rect'}
		<rect x="1.5" y="1.5" width="9" height="9" />
	{:else if shape === 'rectRot'}
		<polygon points="6,0.5 11.5,6 6,11.5 0.5,6" />
	{:else if shape === 'star'}
		<polygon points="6,0.6 7.4,4.2 11.4,4.5 8.3,7.1 9.3,11 6,9 2.7,11 3.7,7.1 0.6,4.5 4.6,4.2" />
	{:else}
		<path d="M2 2 10 10M10 2 2 10" stroke="currentColor" stroke-width="2" />
	{/if}
</svg>

<style>
	svg {
		display: block;
		width: var(--legend-glyph);
		height: var(--legend-glyph);
		fill: currentColor;
	}
</style>
