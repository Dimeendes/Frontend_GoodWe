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
  // Verifica se há algum dataset do SOC ativo
  const hasSocDataset = datasets && datasets.some(dataset => 
    dataset.yAxisID === 'y1' || 
    (dataset.label && dataset.label.includes('SOC'))
  );
  
  console.log('SOC Detection:', {
    datasets: datasets?.map(d => ({ label: d.label, yAxisID: d.yAxisID })),
    hasSocDataset
  });
  
  // Configuração base dos eixos
  const baseScales = {
    x: { 
      ticks: { 
        color: '#b5b5c2', 
        maxRotation: 0, 
        autoSkip: false, // Desabilita autoSkip para controle manual
        maxTicksLimit: 12, // Mantém aproximadamente 12 ticks sempre
        callback: function(value, index, ticks) {
          const label = this.getLabelForValue(value);
          
          if (label) {
            // Extrai hora e minuto
            const [hourStr, minuteStr] = label.split(':');
            const hour = parseInt(hourStr);
            const minute = parseInt(minuteStr);
            
            // Evita horários quebrados - só mostra :00, :05, :10, :15, :20, :25, :30, :35, :40, :45, :50, :55
            const validMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
            if (!validMinutes.includes(minute)) {
              return '';
            }
            
            // Calcula o intervalo baseado no range de dados e número de ticks
            const totalTicks = ticks.length;
            const scale = this;
            const range = scale.max - scale.min;
            
            let showTick = false;
            
            // Determina o intervalo baseado no range de dados e número de ticks
            // Zoom out total (reset zoom) = range próximo de 24h ou muitos ticks
            if (range >= 23 || totalTicks > 20) {
              // Zoom out total (reset zoom): mostra de 2 em 2 horas (00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00)
              showTick = (hour % 2 === 0 && minute === 0);
            } else if (range > 6 || totalTicks > 6) {
              // Zoom médio: mostra a cada hora (00:00, 01:00, 02:00, 03:00...)
              showTick = (minute === 0);
            } else if (range > 3 || totalTicks > 4) {
              // Zoom alto: mostra a cada 30 minutos (12:00, 12:30, 13:00, 13:30, 14:00...)
              showTick = (minute === 0 || minute === 30);
            } else {
              // Zoom máximo: mostra a cada 15 minutos (12:00, 12:15, 12:30, 12:45, 13:00...)
              showTick = (minute === 0 || minute === 15 || minute === 30 || minute === 45);
            }
            
            // Sempre mostra o primeiro e último tick para contexto
            const isFirstOrLast = index === 0 || index === ticks.length - 1;
            
            return (showTick || isFirstOrLast) ? label : '';
          }
          return '';
        }
      }, 
      grid: { color: '#3d3d46' } 
    },
    y: { 
      type: 'linear',
      display: true,
      position: 'left',
      ticks: { 
        color: '#b5b5c2',
        callback: function(value) {
          return value + 'W';
        }
      }, 
      grid: { color: '#3d3d46' },
      title: {
        display: true,
        text: 'W',
        color: '#b5b5c2'
      }
    }
  };

  // Adiciona eixo Y secundário apenas se SOC estiver ativo
  if (hasSocDataset) {
    baseScales.y1 = {
      type: 'linear',
      display: true,
      position: 'right',
      ticks: { 
        color: '#8ab4f8',
        autoSkip: false,
        maxTicksLimit: 8,
        callback: function(value, index, ticks) {
          const scale = this;
          const range = scale.max - scale.min;
          const totalTicks = ticks.length;
          
          let showTick = false;
          
          // Determina intervalo baseado no range visível e zoom
          if (range >= 80) {
            // Zoom out: mostra de 20 em 20%
            showTick = (value % 20 === 0);
          } else if (range >= 40) {
            // Zoom médio: mostra de 10 em 10%
            showTick = (value % 10 === 0);
          } else if (range >= 20) {
            // Zoom alto: mostra de 5 em 5%
            showTick = (value % 5 === 0);
          } else if (range >= 10) {
            // Zoom muito alto: mostra de 2 em 2%
            showTick = (value % 2 === 0);
          } else if (range >= 5) {
            // Zoom máximo: mostra de 1 em 1%
            showTick = (value % 1 === 0);
          } else {
            // Zoom extremo: mostra de 0.5 em 0.5%
            showTick = (value % 0.5 === 0);
          }
          
          // Sempre mostra o primeiro e último tick para contexto
          const isFirstOrLast = index === 0 || index === ticks.length - 1;
          
          return (showTick || isFirstOrLast) ? value + '%' : '';
        }
      },
      grid: {
        drawOnChartArea: false,
      },
      title: {
        display: true,
        text: '%',
        color: '#8ab4f8'
      }
    };
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: '#e9e9ee' } },
      tooltip: { 
        mode: 'index', 
        intersect: false,
        callbacks: {
          label: function(context) {
            const dataset = context.dataset;
            const value = context.parsed.y;
            const label = dataset.label;
            
            // Adiciona legendas dinâmicas baseadas no valor
            let dynamicLabel = label;
            
            if (label.includes('Grid(W)')) {
              if (value < 0) {
                dynamicLabel += ' (Importando)';
              } else if (value > 0) {
                dynamicLabel += ' (Exportando)';
              }
            } else if (label.includes('Bateria(W)') || label.includes('Battery(W)')) {
              if (value < 0) {
                dynamicLabel += ' (Carregando)';
              } else if (value > 0) {
                dynamicLabel += ' (Descarregando)';
              }
            }
            
            return `${dynamicLabel}: ${value}${label.includes('SOC') ? '%' : 'W'}`;
          }
        }
      },
      title: { display: !!title, text: title, color: '#e9e9ee' },
      zoom: enableZoom ? {
        zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' },
        pan: { enabled: true, mode: 'x' },
        limits: { x: { min: 0 } }
      } : undefined
    },
    scales: baseScales
  };

  const data = { labels, datasets };

  return <Line ref={chartRef} options={options} data={data} />;
}
