<script lang="ts">
	import { linkedText } from './linked-text.js';

	let { text }: { text: string } = $props();

	const parts = $derived(linkedText(text));
</script>

{#each parts as part, i (i)}
	{#if part.kind === 'link'}
		<a href={part.href} target="_blank" rel="noopener noreferrer">{part.text}</a>
	{:else}
		{part.text}
	{/if}
{/each}

<style>
	a {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.15em;
		overflow-wrap: anywhere;
	}
</style>
