<script lang="ts">
	import { formatLongDate } from '#lib/calendar-date.js';
	import type { Exercise } from './exercise.js';
	import { abbreviateLoad, describeVolume } from './set-group.js';
	import type { Session } from './session.js';

	type Props = {
		sessions: readonly Session[];
		isCharted: (exercise: Exercise) => boolean;
		onopen: (session: Session) => void;
	};

	let { sessions, isCharted, onopen }: Props = $props();

	const tabs = [
		{ category: 'main-lift', label: 'SBD', exerciseHeading: 'Lift' },
		{ category: 'accessory', label: 'Accessories', exerciseHeading: 'Exercise' }
	] as const;

	let activeTab = $state(0);
	const tabButtons: HTMLButtonElement[] = $state([]);

	const newestFirst = $derived(
		sessions.toSorted(
			(a, b) => b.date.localeCompare(a.date) || a.exercise.name.localeCompare(b.exercise.name)
		)
	);

	function moveFocus(event: KeyboardEvent) {
		const last = tabs.length - 1;
		const target = {
			ArrowRight: activeTab === last ? 0 : activeTab + 1,
			ArrowDown: activeTab === last ? 0 : activeTab + 1,
			ArrowLeft: activeTab === 0 ? last : activeTab - 1,
			ArrowUp: activeTab === 0 ? last : activeTab - 1,
			Home: 0,
			End: last
		}[event.key];
		if (target === undefined) return;
		event.preventDefault();
		activeTab = target;
		tabButtons[target]?.focus();
	}
</script>

<div class="tabs" role="tablist" aria-label="Session type">
	{#each tabs as tab, index (tab.category)}
		<button
			type="button"
			role="tab"
			id="tab-{tab.category}"
			aria-controls="panel-{tab.category}"
			aria-selected={activeTab === index}
			tabindex={activeTab === index ? 0 : -1}
			bind:this={tabButtons[index]}
			onclick={() => (activeTab = index)}
			onkeydown={moveFocus}
		>
			{tab.label}
		</button>
	{/each}
</div>

{#each tabs as tab, index (tab.category)}
	<div
		class="scroll"
		role="tabpanel"
		id="panel-{tab.category}"
		aria-labelledby="tab-{tab.category}"
		hidden={activeTab !== index}
	>
		<table>
			<thead>
				<tr>
					<th scope="col">Date</th>
					<th scope="col">{tab.exerciseHeading}</th>
					<th scope="col">Weight (lb)</th>
					<th scope="col">Sets × reps</th>
					<th scope="col">RPE</th>
					<th scope="col">Variation</th>
					<th scope="col">Notes</th>
				</tr>
			</thead>
			<tbody>
				{#each newestFirst.filter((session) => session.exercise.category === tab.category) as session (`${session.date} ${session.exercise.id}`)}
					{@const charted = isCharted(session.exercise)}
					{#each session.setGroups as group, groupIndex (groupIndex)}
						<tr class:charted onclick={charted ? () => onopen(session) : undefined}>
							<td class="nowrap">
								{#if charted}
									<button
										type="button"
										onclick={(event) => {
											event.stopPropagation();
											onopen(session);
										}}
									>
										{formatLongDate(session.date)}
									</button>
								{:else}
									{formatLongDate(session.date)}
								{/if}
							</td>
							<td class="nowrap">{session.exercise.name}</td>
							<td class="nowrap">{abbreviateLoad(group.load)}</td>
							<td class="nowrap">{describeVolume(group)}{group.warmup ? ' (warm-up)' : ''}</td>
							<td class="nowrap">{group.rpe ?? ''}</td>
							<td>{group.variation?.label ?? '—'}</td>
							<td class="notes">{group.note ?? '—'}</td>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
{/each}

<style>
	.tabs {
		display: flex;
		margin: 0 0 12px;
		border-bottom: 1px solid var(--border);
	}

	[role='tab'] {
		flex: 1;
		min-height: 44px;
		margin-bottom: -1px;
		padding: 10px 12px;
		appearance: none;
		background: transparent;
		border: 0;
		border-bottom: 2px solid transparent;
		font: inherit;
		font-size: 0.95rem;
		font-weight: 650;
		color: var(--muted);
		cursor: pointer;
	}

	[role='tab'][aria-selected='true'] {
		color: var(--text);
		border-bottom-color: #111827;
	}

	[role='tab']:focus-visible {
		outline-offset: -2px;
	}

	.scroll {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.88rem;
	}

	th,
	td {
		padding: 7px 8px;
		text-align: left;
		vertical-align: top;
		border-bottom: 1px solid var(--border);
	}

	th {
		background: #f3f4f6;
		white-space: nowrap;
	}

	.nowrap {
		white-space: nowrap;
	}

	.notes {
		min-width: 220px;
	}

	tr.charted {
		cursor: pointer;
	}

	tr.charted:hover,
	tr.charted:has(:focus-visible) {
		background: var(--highlight);
	}

	td button {
		padding: 0;
		appearance: none;
		background: none;
		border: 0;
		font: inherit;
		color: inherit;
		text-align: left;
		cursor: pointer;
	}
</style>
