<script lang="ts">
	import { formatWeekdayDate, type CalendarDate } from '#lib/calendar-date.js';
	import type { Meet } from '#lib/competition/meet.js';
	import {
		describeDose,
		describeRpe,
		describeWeek,
		weekIndexFor,
		type TrainingWeek
	} from './training-week.js';

	type Props = {
		weeks: readonly TrainingWeek[];
		meet: Meet;
		today: CalendarDate;
	};

	let { weeks, meet, today }: Props = $props();

	let chosen = $state<number>();
	const index = $derived(chosen ?? weekIndexFor(weeks, today));
	const week = $derived(weeks[index]);
</script>

{#if week}
	<nav aria-label="Training weeks">
		<button
			type="button"
			aria-label="Previous week"
			disabled={index === 0}
			onclick={() => (chosen = index - 1)}>‹</button
		>
		<h3 aria-live="polite">{describeWeek(week, meet)}</h3>
		<button
			type="button"
			aria-label="Next week"
			disabled={index === weeks.length - 1}
			onclick={() => (chosen = index + 1)}>›</button
		>
	</nav>

	{#if week.note}
		<p class="week-note">{week.note}</p>
	{/if}

	<ol>
		{#each week.days as day (day.date)}
			<li class:today={day.date === today} class:rest={day.work.length === 0}>
				<p class="day">
					<strong>{formatWeekdayDate(day.date)}</strong>
					<span>{day.title}</span>
					{#if day.date === today}<span class="badge">Today</span>{/if}
				</p>
				{#if day.note}
					<p class="note">{day.note}</p>
				{/if}
				{#if day.work.length > 0}
					<ul>
						{#each day.work as item, itemIndex (itemIndex)}
							<li>
								<span class="name">{item.exercise.name}</span>
								<span class="dose">
									{describeDose(item)}{#if item.rpe}&nbsp;{describeRpe(item.rpe)}{/if}
								</span>
								{#if item.note}<span class="note">{item.note}</span>{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ol>
{/if}

<style>
	nav {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 0 0 12px;
	}

	h3 {
		flex: 1;
		margin: 0;
		font-size: 0.98rem;
		text-align: center;
	}

	nav button {
		min-width: 44px;
		min-height: 44px;
		appearance: none;
		background: #fff;
		border: 1px solid var(--border);
		border-radius: 8px;
		font: inherit;
		font-size: 1.4rem;
		line-height: 1;
		color: var(--text);
		cursor: pointer;
	}

	nav button:disabled {
		color: var(--border);
		cursor: default;
	}

	ol,
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	ol > li {
		padding: 10px 12px;
		border-top: 1px solid var(--border);
	}

	ol > li.today {
		background: var(--highlight);
		border-radius: 8px;
		border-top-color: transparent;
	}

	ol > li.today + li {
		border-top-color: transparent;
	}

	p {
		margin: 0;
	}

	.day {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 8px;
	}

	.rest .day span {
		color: var(--muted);
	}

	.badge {
		padding: 1px 7px;
		border-radius: 6px;
		background: #111827;
		color: #fff;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.week-note,
	.note {
		color: var(--muted);
		font-size: 0.86rem;
	}

	.week-note {
		margin: 0 0 8px;
	}

	ul {
		margin-top: 6px;
		font-size: 0.9rem;
	}

	ul li {
		display: flex;
		flex-wrap: wrap;
		gap: 0 8px;
		padding: 2px 0;
	}

	.name {
		font-weight: 600;
	}

	.dose {
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	ul .note {
		flex-basis: 100%;
	}
</style>
