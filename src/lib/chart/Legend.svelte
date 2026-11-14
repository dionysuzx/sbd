<script lang="ts" module>
	import type { MarkerShape } from './palette.js';

	export type LegendEntry =
		| {
				readonly kind: 'line';
				readonly label: string;
				readonly color: string;
				readonly stroke?: string;
				readonly dash?: readonly number[];
		  }
		| { readonly kind: 'marker'; readonly label: string; readonly shape: MarkerShape };
</script>

<script lang="ts">
	import MarkerGlyph from './MarkerGlyph.svelte';

	let { entries }: { entries: readonly LegendEntry[] } = $props();
</script>

<ul>
	{#each entries as entry (entry.label)}
		{#if entry.kind === 'line'}
			<li>
				<svg class="swatch" viewBox="0 0 24 8" preserveAspectRatio="none" aria-hidden="true">
					{#if entry.stroke}
						<line x1="0" y1="4" x2="24" y2="4" stroke={entry.stroke} stroke-width="8" />
					{/if}
					<line
						x1="0"
						y1="4"
						x2="24"
						y2="4"
						stroke={entry.color}
						stroke-width={entry.stroke ? 4 : 8}
						stroke-dasharray={entry.dash?.join(' ')}
					/>
				</svg>
				{entry.label}
			</li>
		{:else}
			<li>
				<MarkerGlyph shape={entry.shape} />
				{entry.label}
			</li>
		{/if}
	{/each}
</ul>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 14px;
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: var(--legend-font);
		color: #374151;
	}

	li {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}

	.swatch {
		width: var(--legend-swatch-width);
		height: var(--legend-swatch-height);
	}
</style>
