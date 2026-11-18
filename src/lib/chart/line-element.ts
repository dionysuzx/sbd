import { Chart, LinearScale, LineController, LineElement, PointElement, Tooltip } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, Tooltip);

// Canvas/Chart.js default lineJoin is miter, which extends to a sharp spike
// at acute V corners. Round joins keep the stroke within a semicircle of
// the vertex, so it stays under the data-point marker.
Chart.defaults.elements.line.borderJoinStyle = 'round';
Chart.defaults.elements.line.borderCapStyle = 'round';

export { Chart };
