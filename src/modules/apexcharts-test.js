/**
 * ApexCharts test module for Perchance
 * Tests: dynamic SVG charts (bar, line, pie, radar, donut)
 * CDN: https://cdn.jsdelivr.net/npm/apexcharts@3/dist/apexcharts.min.js
 * @version 1.0.0
 */

const APEXCHARTS_CDN = 'https://cdn.jsdelivr.net/npm/apexcharts@3/dist/apexcharts.min.js';

let ApexCharts = null;
let container = null;
let chartInstance = null;

async function loadApexCharts() {
  if (window.ApexCharts) {
    ApexCharts = window.ApexCharts;
    return true;
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = APEXCHARTS_CDN;
    script.onload = () => {
      ApexCharts = window.ApexCharts;
      resolve(true);
    };
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function ensureContainer() {
  if (container && document.body.contains(container)) return container;

  container = document.createElement('div');
  container.id = 'apexcharts-container';
  Object.assign(container.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    background: '#1a1a2e',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: '9999',
    overflow: 'auto'
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  });
  closeBtn.onclick = () => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    container.remove();
    container = null;
  };
  container.appendChild(closeBtn);

  const chartDiv = document.createElement('div');
  chartDiv.id = 'apexcharts-chart';
  container.appendChild(chartDiv);

  document.body.appendChild(container);
  return container;
}

function getBaseOptions() {
  return {
    chart: {
      background: 'transparent',
      foreColor: '#ffffff',
      toolbar: { show: false },
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    theme: { mode: 'dark' },
    grid: { borderColor: '#333', strokeDashArray: 4 },
    tooltip: { theme: 'dark' },
    dataLabels: { style: { fontSize: '12px', fontWeight: 600 } }
  };
}

export const apexchartsTest = {
  available: false,

  async init() {
    this.available = await loadApexCharts();
    console.log(this.available ? '✅ [ApexCharts] Loaded' : '❌ [ApexCharts] Failed to load');
    return this.available;
  },

  async renderBarChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error('ApexCharts not loaded');

    ensureContainer();
    if (chartInstance) chartInstance.destroy();

    const options = {
      ...getBaseOptions(),
      series: [{
        name: 'Stats',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
      }],
      chart: {
        ...getBaseOptions().chart,
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '60%',
          distributed: true
        }
      },
      xaxis: {
        categories: ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA', 'LCK', 'PER', 'END'],
        labels: { style: { fontSize: '12px' } }
      },
      yaxis: { title: { text: 'Value' } },
      legend: { show: false },
      colors: ['#00e396', '#008ffb', '#feb019', '#ff4560', '#775dd0', '#00d4aa', '#f86624', '#3f51b5', '#e91e63']
    };

    chartInstance = new ApexCharts(document.getElementById('apexcharts-chart'), options);
    await chartInstance.render();
    return { success: true, type: 'bar', categories: 9 };
  },

  async renderLineChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error('ApexCharts not loaded');

    ensureContainer();
    if (chartInstance) chartInstance.destroy();

    const generateSeries = (points, base, variance) => {
      const data = [];
      let value = base;
      for (let i = 0; i < points; i++) {
        value += (Math.random() - 0.5) * variance;
        data.push({ x: i, y: Math.round(value) });
      }
      return data;
    };

    const options = {
      ...getBaseOptions(),
      series: [
        { name: 'Player HP', data: generateSeries(20, 100, 15) },
        { name: 'Enemy HP', data: generateSeries(20, 120, 20) }
      ],
      chart: {
        ...getBaseOptions().chart,
        type: 'area',
        height: 350
      },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 }
      },
      xaxis: { title: { text: 'Turn' }, type: 'numeric' },
      yaxis: { title: { text: 'HP' } },
      colors: ['#00e396', '#ff4560']
    };

    chartInstance = new ApexCharts(document.getElementById('apexcharts-chart'), options);
    await chartInstance.render();
    return { success: true, type: 'line', points: 20 };
  },

  async renderPieChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error('ApexCharts not loaded');

    ensureContainer();
    if (chartInstance) chartInstance.destroy();

    const options = {
      ...getBaseOptions(),
      series: [35, 25, 20, 12, 8],
      labels: ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger'],
      chart: {
        ...getBaseOptions().chart,
        type: 'donut',
        height: 380
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Total',
                fontSize: '16px',
                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        }
      },
      stroke: { width: 2, colors: ['#1a1a2e'] },
      colors: ['#ff4560', '#008ffb', '#00e396', '#feb019', '#775dd0'],
      legend: { position: 'bottom', fontSize: '14px' }
    };

    chartInstance = new ApexCharts(document.getElementById('apexcharts-chart'), options);
    await chartInstance.render();
    return { success: true, type: 'donut', slices: 5 };
  },

  async renderRadarChart() {
    if (!this.available) await this.init();
    if (!ApexCharts) throw new Error('ApexCharts not loaded');

    ensureContainer();
    if (chartInstance) chartInstance.destroy();

    const randomStats = () => [40, 60, 75, 50, 65, 55].map(v => v + Math.floor(Math.random() * 30));

    const options = {
      ...getBaseOptions(),
      series: [
        { name: 'Player', data: randomStats() },
        { name: 'NPC', data: randomStats() }
      ],
      chart: {
        ...getBaseOptions().chart,
        type: 'radar',
        height: 380
      },
      xaxis: {
        categories: ['Attack', 'Defense', 'Speed', 'Magic', 'Stamina', 'Luck']
      },
      stroke: { width: 2 },
      fill: { opacity: 0.3 },
      markers: { size: 4 },
      colors: ['#00e396', '#ff4560'],
      plotOptions: {
        radar: {
          polygons: {
            strokeColors: '#333',
            connectorColors: '#333'
          }
        }
      }
    };

    chartInstance = new ApexCharts(document.getElementById('apexcharts-chart'), options);
    await chartInstance.render();
    return { success: true, type: 'radar', axes: 6 };
  },

  destroy() {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
  }
};

console.log('📊 [ApexCharts] Module loaded');
