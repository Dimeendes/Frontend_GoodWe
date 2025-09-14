"use client";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartClient({ labels, data, title }) {
  const dataset = {
    labels,
    datasets: [
      {
        label: title || 'Distribuição',
        data,
        backgroundColor: ['#ff6b6b', '#ff8fa3', '#ffd166', '#6ee7b7'],
        borderColor: '#2a2a30'
      }
    ]
  };
  const options = {
    plugins: {
      legend: { labels: { color: '#e9e9ee' } },
      title: { display: !!title, text: title, color: '#e9e9ee' }
    }
  };
  return <Pie data={dataset} options={options} />;
}
