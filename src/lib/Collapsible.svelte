<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { title: string; open?: boolean; children: Snippet };

	let { title, open = $bindable(false), children }: Props = $props();
</script>

<details class="card" bind:open>
	<summary>{title}</summary>
	<div class="body">
		{@render children()}
	</div>
</details>

<style>
	details {
		padding: 0;
	}

	summary {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px;
		font-weight: 700;
		font-size: 1.15rem;
		list-style: none;
		cursor: pointer;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	summary::before {
		content: '▸';
		color: var(--muted);
		transition: transform 0.15s;
	}

	details[open] > summary::before {
		transform: rotate(90deg);
	}

	.body {
		padding: 0 16px 16px;
	}

	.body :global(.card) {
		border-color: #eef0f3;
	}
</style>
