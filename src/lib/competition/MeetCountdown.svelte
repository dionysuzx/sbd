<script lang="ts">
	import type { CalendarDate } from '#lib/calendar-date.js';
	import { describeCountdown, type Meet } from './meet.js';

	let { meet, today }: { meet: Meet; today: CalendarDate } = $props();

	const label = $derived(describeCountdown(meet, today));
</script>

{#snippet meetName()}
	{#if meet.url}
		<a href={meet.url} target="_blank" rel="noopener noreferrer">
			<span class="name">{meet.name}</span><span class="outbound" aria-hidden="true">↗</span>
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
			{label.weeks}
			{@render meetName()}
		{/if}
	</p>
{/if}

<style>
	p {
		display: inline-block;
		margin: 0 0 16px;
		padding: 8px 14px;
		border-radius: 6px;
		background: #111827;
		color: #e5e7eb;
		font-size: 0.92rem;
		font-weight: 500;
		line-height: 1.25;
	}

	a {
		color: #fff;
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	a:hover .name,
	a:focus .name,
	a:focus-visible .name {
		text-decoration: underline;
		text-underline-offset: 0.18em;
		text-decoration-thickness: 1px;
	}

	.outbound {
		position: relative;
		top: -0.14em;
		margin-left: 0.28em;
		font-size: 0.78em;
		font-weight: 600;
		line-height: 1;
		opacity: 0.75;
	}
</style>
