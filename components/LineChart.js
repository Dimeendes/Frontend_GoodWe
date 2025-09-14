"use client";
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Importação dinâmica para evitar problemas de SSR
const LineChartComponent = dynamic(() => import('./LineChartClient'), {
  ssr: false,
  loading: () => <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e9e9ee' }}>Carregando gráfico...</div>
});

export default function LineChart(props) {
  return <LineChartComponent {...props} />;
}


