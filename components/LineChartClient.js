"use client";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler, zoomPlugin);

export default function LineChartClient({ labels, datasets, title, enableZoom = true, chartRef }) {
  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e9e9ee' } },
      tooltip: { mode: 'index', intersect: false },
      title: { display: !!title, text: title, color: '#e9e9ee' },
      zoom: enableZoom ? {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' },
        limits: { x: { min: 0 } }
      } : undefined
    },
    scales: {
      x: { ticks: { color: '#b5b5c2', maxRotation: 0, autoSkip: true }, grid: { color: '#3d3d46' } },
      y: { ticks: { color: '#b5b5c2' }, grid: { color: '#3d3d46' } }
    }
  };

  const data = { labels, datasets };

  return <Line ref={chartRef} options={options} data={data} />;
}
