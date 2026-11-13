<script lang="ts">
	import { bodyweightChartConfiguration } from '#lib/chart/bodyweight-chart.js';
	import Legend, { type LegendEntry } from '#lib/chart/Legend.svelte';
	import { lineChart } from '#lib/chart/line-chart.svelte.js';
	import { seriesColor } from '#lib/chart/palette.js';
	import type { ReferenceLine } from '#lib/chart/plugins.js';
	import { strokeScaleFor } from '#lib/chart/stroke-scale.js';
	import type { Timeline } from '#lib/chart/timeline.js';
	import { describeWeightClass, type WeightClass } from '#lib/competition/weight-class.js';
	import { formatKilograms, formatPounds } from '#lib/mass.js';
	import { summarizeBodyweight, type WeighIn } from './weigh-in.js';

	type Props = {
		weighIns: readonly WeighIn[];
		weightClasses: { target: WeightClass; next: WeightClass };
		timeline: Timeline;
	};

	let { weighIns, weightClasses, timeline }: Props = $props();

	let chartWidth = $state(0);

	const bodyweightColor = seriesColor(0);

	const classLines = $derived<ReferenceLine[]>([
		{
			y: weightClasses.target.limitPounds,
			label: describeWeightClass(weightClasses.target),
			color: seriesColor(1),
			dash: [6, 4]
		},
		{
			y: weightClasses.next.limitPounds,
			label: describeWeightClass(weightClasses.next),
			color: seriesColor(2),
			dash: [3, 3]
		}
	]);

	const legend = $derived<LegendEntry[]>([
		{ kind: 'line', label: 'Bodyweight', color: bodyweightColor },
		...classLines.map(({ label, color, dash }): LegendEntry => ({
			kind: 'line',
			label,
			color,
			dash
		}))
	]);

	const summary = $derived(summarizeBodyweight(weighIns, weightClasses.target));

	const signed = (pounds: number) => `${pounds > 0 ? '+' : ''}${formatPounds(pounds)}`;
</script>

{#if summary}
	<div class="legends">
		<Legend entries={legend} />
	</div>
	<p class="summary">
		<span>
			Latest: <strong>{formatPounds(summary.latest.pounds)} lb</strong>
			({formatKilograms(summary.latest.pounds)} kg)
		</span>
		{#if summary.weeklyChange !== undefined}
			<span>7-day change: <strong>{signed(summary.weeklyChange)} lb</strong></span>
		{/if}
		<span>
			{formatPounds(Math.abs(summary.marginBelowClass))} lb
			{summary.marginBelowClass >= 0 ? 'under' : 'over'} the {weightClasses.target.kilograms} kg limit
			({weightClasses.target.limitPounds.toFixed(1)} lb)
		</span>
	</p>
	<div class="chart" role="img" aria-label="Bodyweight chart" bind:clientWidth={chartWidth}>
		<canvas
			{@attach lineChart(() =>
				bodyweightChartConfiguration({
					weighIns,
					color: bodyweightColor,
					classLines,
					timeline,
					scale: strokeScaleFor(chartWidth)
				})
			)}
		></canvas>
	</div>
{:else}
	<p class="empty">No weigh-ins yet. The chart appears here once the first weigh-in is logged.</p>
{/if}

<style>
	.summary {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 18px;
		margin: 0 0 10px;
		font-size: 0.95rem;
	}
</style>
