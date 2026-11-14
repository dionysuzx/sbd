<script lang="ts">
	import type { CalendarDate } from '#lib/calendar-date.js';
	import { describeCountdown, type Meet } from './meet.js';

	let { meet, today }: { meet: Meet; today: CalendarDate } = $props();

	const label = $derived(describeCountdown(meet, today));
</script>

{#snippet meetName()}
	{#if meet.url}
		<a href={meet.url} target="_blank" rel="noopener noreferrer">
			{meet.name}<span class="outbound" aria-hidden="true">↗</span>
		</a>
	{:else}
		{meet.name}
	{/if}
{/snippet}

{#if label}
	<p>
		{#if label.kind === 'meet-day'}
			Meet day: {@render meetName()}
		{:else}
			{label.weeks} · {@render meetName()} · {label.date}
		{/if}
	</p>
{/if}

<style>
	p {
		display: inline-block;
		margin: 0 0 16px;
		padding: 7px 12px;
		border-radius: 6px;
		background: #111827;
		color: #fff;
		font-size: 0.92rem;
		font-weight: 600;
	}

	a {
		color: inherit;
		text-decoration: none;
	}

	a:hover,
	a:focus,
	a:focus-visible {
		text-decoration: underline;
	}

	.outbound {
		margin-left: 0.2em;
		font-size: 0.72em;
		font-weight: 500;
		opacity: 0.7;
	}
</style>
