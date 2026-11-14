<script lang="ts">
	import {
		glyphCenter,
		glyphCircleRadius,
		glyphCrossPath,
		glyphCrossStrokeWidth,
		glyphPoints,
		glyphViewBox
	} from './marker-geometry.js';
	import type { MarkerShape } from './palette.js';

	let { shape }: { shape: MarkerShape } = $props();
</script>

<svg viewBox={glyphViewBox} aria-hidden="true">
	{#if shape === 'circle'}
		<circle cx={glyphCenter} cy={glyphCenter} r={glyphCircleRadius} />
	{:else if shape === 'crossRot'}
		<path
			d={glyphCrossPath()}
			fill="none"
			stroke="currentColor"
			stroke-width={glyphCrossStrokeWidth}
		/>
	{:else}
		<polygon points={glyphPoints(shape)} />
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
