<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { localCalendarDate } from '#lib/calendar-date.js';
	import BodyweightOverview from '#lib/bodyweight/BodyweightOverview.svelte';
	import { timelineFrom } from '#lib/chart/timeline.js';
	import Collapsible from '#lib/Collapsible.svelte';
	import MeetCountdown from '#lib/competition/MeetCountdown.svelte';
	import WeekPlan from '#lib/plan/WeekPlan.svelte';
	import { isCharted } from '#lib/program.js';
	import ExerciseCard from '#lib/training/ExerciseCard.svelte';
	import { exercises, type Exercise } from '#lib/training/exercise.js';
	import SessionLog from '#lib/training/SessionLog.svelte';
	import { selectSession, type SessionSelection } from '#lib/training/session-selection.js';
	import type { Session } from '#lib/training/session.js';
	import type { PageProps } from './$types.js';

	let { data }: PageProps = $props();

	const title = "David's Knee & SBD Progress";
	const description = "David's squat, bench, deadlift, and knee-rehab training log.";

	const mainLifts = Object.values(exercises).filter(
		(exercise) => exercise.category === 'main-lift'
	);
	const program = $derived(data.program);

	let today = $derived(data.builtOn);
	let selection = $state.raw<SessionSelection>();
	let accessoriesOpen = $state(false);

	onMount(() => {
		today = localCalendarDate(new Date());
	});

	const sessionsByExercise = $derived(Map.groupBy(data.sessions, (session) => session.exercise.id));

	const timeline = $derived(
		timelineFrom(program.therapyStart.date, [
			...data.sessions.map((session) => session.date),
			...data.weighIns.map((weighIn) => weighIn.date)
		])
	);

	async function openSession(session: Session) {
		selection = selectSession(session);
		if (session.exercise.category === 'accessory') accessoriesOpen = true;
		await tick();
		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		document
			.getElementById(`exercise-${session.exercise.id}`)
			?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
	}

	const selectionFor = (exercise: Exercise) =>
		selection?.session.exercise.id === exercise.id ? selection : undefined;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="https://sbd.wtf" />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') selection = undefined;
	}}
/>

{#snippet exerciseCard(exercise: Exercise)}
	<ExerciseCard
		{exercise}
		sessions={sessionsByExercise.get(exercise.id) ?? []}
		{timeline}
		milestone={program.therapyStart}
		selection={selectionFor(exercise)}
		onselect={(next) => (selection = next)}
	/>
{/snippet}

<main>
	<h1>{title}</h1>
	<MeetCountdown meet={program.meet} {today} />

	<Collapsible title="Workout">
		<WeekPlan weeks={data.weeks} meet={program.meet} {today} />
	</Collapsible>

	{#each mainLifts as exercise (exercise.id)}
		{@render exerciseCard(exercise)}
	{/each}

	<Collapsible title="Accessories" bind:open={accessoriesOpen}>
		{#each program.currentAccessories as exercise (exercise.id)}
			{@render exerciseCard(exercise)}
		{/each}
	</Collapsible>

	<Collapsible title="All sessions">
		<SessionLog
			sessions={data.sessions}
			isCharted={(exercise) => isCharted(program, exercise)}
			onopen={openSession}
		/>
	</Collapsible>

	<Collapsible title="Bodyweight">
		<BodyweightOverview weighIns={data.weighIns} weightClasses={program.weightClasses} {timeline} />
	</Collapsible>
</main>
