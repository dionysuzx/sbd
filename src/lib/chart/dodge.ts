export type Marker = { readonly x: number; readonly y: number; readonly radius: number };
export type Bounds = { readonly left: number; readonly right: number };

const GAP = 2;

export function dodgeOffsets(markers: readonly Marker[], bounds: Bounds): number[] {
	const offsets = markers.map(() => 0);
	const columns = Map.groupBy(markers.keys(), (index) => Math.round(markers[index].x));
	for (const column of columns.values()) {
		for (const cluster of hiddenClusters(column, markers)) {
			if (cluster.length < 2) continue;
			const radius = Math.max(...cluster.map((index) => markers[index].radius));
			const spacing = 2 * radius + GAP;
			const halfWidth = ((cluster.length - 1) / 2) * spacing;
			const center = markers[cluster[0]].x;
			const leftEdge = center - halfWidth - radius;
			const rightEdge = center + halfWidth + radius;
			const shift =
				leftEdge < bounds.left
					? bounds.left - leftEdge
					: rightEdge > bounds.right
						? bounds.right - rightEdge
						: 0;
			cluster
				.toSorted((a, b) => a - b)
				.forEach((index, position) => {
					offsets[index] = position * spacing - halfWidth + shift;
				});
		}
	}
	return offsets;
}

function hiddenClusters(column: readonly number[], markers: readonly Marker[]): number[][] {
	const byHeight = column.toSorted((a, b) => markers[a].y - markers[b].y);
	const clusters: number[][] = [];
	for (const index of byHeight) {
		const current = clusters.at(-1);
		const previous = current?.at(-1);
		const hides =
			previous !== undefined &&
			markers[index].y - markers[previous].y <
				Math.min(markers[index].radius, markers[previous].radius);
		if (current && hides) current.push(index);
		else clusters.push([index]);
	}
	return clusters;
}
