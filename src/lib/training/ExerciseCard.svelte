<script lang="ts">
	import Legend, { type LegendEntry } from '#lib/chart/Legend.svelte';
	import { canHover, lineChart } from '#lib/chart/line-chart.svelte.js';
	import { markerShape, seriesColor } from '#lib/chart/palette.js';
	import { progressChartConfiguration } from '#lib/chart/progress-chart.js';
	import { strokeScaleFor } from '#lib/chart/stroke-scale.js';
	import type { Timeline } from '#lib/chart/timeline.js';
	import type { Milestone } from '#lib/program.js';
	import type { Exercise } from './exercise.js';
	import { progressAxisLabel, progressSeries } from './progress.js';
	import SessionDetail from './SessionDetail.svelte';
	import type { SessionSelection } from './session-selection.js';
	import type { Session } from './session.js';

	type Props = {
		exercise: Exercise;
		sessions: readonly Session[];
		timeline: Timeline;
		milestone: Milestone;
		selection: SessionSelection | undefined;
		onselect: (selection: SessionSelection | undefined) => void;
	};

	let { exercise, sessions, timeline, milestone, selection, onselect }: Props = $props();

	let chartWidth = $state(0);

	const series = $derived(progressSeries(exercise, sessions));

	const repEntries = $derived(
		series.map(({ label }, index): LegendEntry => ({
			kind: 'line',
			label,
			color: seriesColor(index)
		}))
	);

	const variationEntries = $derived.by((): LegendEntry[] => {
		const logged = new Set(
			sessions.flatMap((session) => session.setGroups.map((group) => group.variation?.id))
		);
		const used = exercise.variations
			.map((variation, index) => ({ variation, index }))
			.filter(({ variation }) => logged.has(variation.id));
		const worthShowing = exercise.category === 'main-lift' ? used.length > 0 : used.length > 1;
		return worthShowing
			? used.map(({ variation, index }) => ({
					kind: 'marker',
					label: variation.label,
					shape: markerShape(index)
				}))
			: [];
	});

	const configuration = () =>
		progressChartConfiguration({
			exercise,
			series,
			axisLabel: progressAxisLabel(exercise),
			timeline,
			milestone,
			highlighted: selection?.highlighted,
			scale: strokeScaleFor(chartWidth),
			hoverTooltips: canHover(),
			onSelect: (point) =>
				onselect(
					point && point.top !== selection?.highlighted
						? { session: point.session, highlighted: point.top }
						: undefined
				)
		});
</script>

<section class="card" id="exercise-{exercise.id}" aria-labelledby="exercise-{exercise.id}-name">
	<h2 id="exercise-{exercise.id}-name">{exercise.name}</h2>
	{#if series.length === 0}
		<p class="empty">No entries yet. The chart appears here once the first set is logged.</p>
	{:else}
		<div class="legends">
			<Legend entries={repEntries} />
			{#if variationEntries.length > 0}
				<Legend entries={variationEntries} />
			{/if}
		</div>
		<div
			class="chart"
			role="img"
			aria-label="{exercise.name} progress chart"
			bind:clientWidth={chartWidth}
		>
			<canvas {@attach lineChart(configuration)}></canvas>
		</div>
	{/if}
	{#if selection}
		<SessionDetail {selection} onclose={() => onselect(undefined)} />
	{/if}
</section>
