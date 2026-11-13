<script lang="ts">
	import { formatLongDate } from '#lib/calendar-date.js';
	import { describeLoad, describeVolume } from './set-group.js';
	import type { SessionSelection } from './session-selection.js';

	let { selection, onclose }: { selection: SessionSelection; onclose: () => void } = $props();

	const { session, highlighted } = $derived(selection);
	const title = $derived(formatLongDate(session.date));
</script>

<section class="session" aria-label="{session.exercise.name} on {title}">
	<header>
		<h3>{title}</h3>
		<button type="button" aria-label="Close session" onclick={onclose}>×</button>
	</header>
	<ol>
		{#each session.setGroups as group, index (index)}
			<li class:highlighted={group === highlighted} class:warmup={group.warmup}>
				<p class="load">{describeLoad(group.load, session.exercise)}</p>
				<p>
					{[
						describeVolume(group),
						group.rpe === undefined ? undefined : `RPE ${group.rpe}`,
						group.variation?.label,
						group.warmup ? 'warm-up' : undefined
					]
						.filter(Boolean)
						.join(' · ')}
				</p>
				{#if group.note}
					<p class="note">{group.note}</p>
				{/if}
			</li>
		{/each}
	</ol>
</section>

<style>
	.session {
		margin-top: 12px;
		background: #f8fafc;
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 12px;
		font-size: 0.88rem;
	}

	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: 0 0 4px;
	}

	h3 {
		font-size: 0.95rem;
		margin: 0;
		font-weight: 650;
	}

	button {
		flex: none;
		width: 28px;
		height: 28px;
		border: 0;
		border-radius: 8px;
		background: var(--border);
		color: #374151;
		font: inherit;
		font-size: 1.2rem;
		line-height: 1;
		cursor: pointer;
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		padding: 8px;
		color: #374151;
	}

	li + li {
		border-top: 1px solid var(--border);
	}

	li.highlighted {
		background: var(--highlight);
		border-radius: 8px;
	}

	li.highlighted,
	li.highlighted + li {
		border-top-color: transparent;
	}

	li.warmup {
		opacity: 0.78;
	}

	p {
		margin: 0;
	}

	.load {
		font-weight: 650;
		color: var(--text);
	}

	.note {
		margin-top: 3px;
		color: var(--muted);
		font-size: 0.84rem;
		line-height: 1.4;
	}
</style>
