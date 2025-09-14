"use client";
import dynamic from 'next/dynamic';

// Importação dinâmica para evitar problemas de SSR
const PieChartComponent = dynamic(() => import('./PieChartClient'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9e9ee' }}>Carregando gráfico...</div>
});

export default function PieChart(props) {
  return <PieChartComponent {...props} />;
}


