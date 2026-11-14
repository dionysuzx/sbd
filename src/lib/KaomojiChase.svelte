<script lang="ts">
	import { onMount } from 'svelte';
	import { CYCLE_MS, LINE_CELLS, poseLine, poses } from './kaomoji-chase.js';

	let track: HTMLDivElement | undefined;
	let motion = $state(false);
	let go = $state(false);

	onMount(() => {
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
		let onScreen = false;

		const sync = () => {
			motion = !reduce.matches;
			go = motion && onScreen && document.visibilityState === 'visible';
		};

		if (!track) return;
		const io = new IntersectionObserver((entries) => {
			onScreen = entries.some((entry) => entry.isIntersecting);
			sync();
		});
		io.observe(track);

		const onVis = () => sync();
		document.addEventListener('visibilitychange', onVis);
		reduce.addEventListener('change', sync);

		return () => {
			io.disconnect();
			document.removeEventListener('visibilitychange', onVis);
			reduce.removeEventListener('change', sync);
		};
	});
</script>

<div class="track" bind:this={track} aria-hidden="true">
	<div class="scene" class:motion class:go style="--cells: {LINE_CELLS}; --cycle: {CYCLE_MS}ms">
		<div class="bob">
			<div class="window">
				<div class="strip">
					{#each poses as pose}
						<span class="frame">{poseLine(pose)}</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.track {
		container-type: inline-size;
		position: relative;
		overflow: hidden;
		height: 1.4em;
		margin: 6px 0 16px;
		color: var(--muted);
		font-family:
			ui-monospace, 'SFMono-Regular', 'SF Mono', Menlo, Monaco, 'Cascadia Mono', 'Segoe UI Mono',
			'Noto Sans Mono', 'DejaVu Sans Mono', monospace;
		font-size: 0.86rem;
		font-kerning: none;
		line-height: 1.4em;
		pointer-events: none;
		user-select: none;
	}

	.scene {
		position: absolute;
		top: 0;
		left: 0.25rem;
		width: calc(var(--cells) * 1ch);
	}

	.window {
		height: 1.4em;
		overflow: hidden;
	}

	.frame {
		display: block;
		height: 1.4em;
		white-space: pre;
	}

	.scene.motion {
		left: 0;
		will-change: transform;
		animation: travel 16s linear infinite;
		animation-delay: -2.5s;
		animation-play-state: paused;
	}

	.scene.motion .strip {
		animation: reel var(--cycle) steps(4, end) infinite;
		animation-play-state: paused;
	}

	.scene.motion .bob {
		animation: bob 0.45s ease-in-out infinite;
		animation-play-state: paused;
	}

	.scene.motion.go,
	.scene.motion.go .strip,
	.scene.motion.go .bob {
		animation-play-state: running;
	}

	@keyframes travel {
		from {
			transform: translateX(-100%);
		}

		to {
			transform: translateX(100cqi);
		}
	}

	@keyframes reel {
		to {
			transform: translateY(-100%);
		}
	}

	@keyframes bob {
		0%,
		100% {
			transform: translateY(0);
		}

		50% {
			transform: translateY(-0.12em);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scene.motion,
		.scene.motion .strip,
		.scene.motion .bob {
			animation: none;
			transform: none;
			will-change: auto;
		}

		.scene.motion {
			left: 0.25rem;
		}
	}
</style>
