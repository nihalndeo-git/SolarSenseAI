import React, { useEffect, useState } from 'react';
import { fetchEnergyData } from '../services/api';
import EnergyChart from '../components/charts/EnergyChart';

const DashboardPage = () => {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      // In a real app, you'd pass a user or project ID
      const data = await fetchEnergyData('project-123');
      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: 'Energy Consumption (kWh)',
            data: data.consumption,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Energy Generation (kWh)',
            data: data.generation,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      });
      setLoading(false);
    };

    getData();
  }, []);

  return (
    <div>
      <h2>Energy Management Dashboard</h2>
      {loading ? (
        <p>Loading chart data...</p>
      ) : (
        <div style={{ maxWidth: '800px' }}>
          {chartData && <EnergyChart data={chartData} />}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;