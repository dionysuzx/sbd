<script lang="ts">
	import { formatWeekdayDate, type CalendarDate } from '#lib/calendar-date.js';
	import { countdownTo, type Meet } from './meet.js';

	let { meet, today }: { meet: Meet; today: CalendarDate } = $props();

	const countdown = $derived(countdownTo(meet, today));
</script>

{#if countdown.kind !== 'over'}
	<p>
		{#if countdown.kind === 'meet-day'}
			Meet day: {meet.name}
		{:else}
			{countdown.weeks.toFixed(1)} weeks out · {countdown.days}
			{countdown.days === 1 ? 'day' : 'days'} to {meet.name} ({formatWeekdayDate(meet.date)})
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
</style>
