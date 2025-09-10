import React, { useState } from 'react';
import { predictEnergy } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const BipvToolPage = () => {
  const [formData, setFormData] = useState({
    lat: 40.7128,
    lng: -74.0060,
    area_sq_ft: 1000,
    panel_efficiency: 0.2,
  });
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrediction(null);
    try {
      const response = await predictEnergy(formData);
      setPrediction(response.data);
    } catch (err) {
      setError('Failed to get prediction. Please check the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>BIPV Management & Prediction Tool</h2>
      <form onSubmit={handleSubmit}>
        <Input label="Latitude" type="number" name="lat" value={formData.lat} onChange={handleChange} />
        <Input label="Longitude" type="number" name="lng" value={formData.lng} onChange={handleChange} />
        <Input label="Building Area (sq ft)" type="number" name="area_sq_ft" value={formData.area_sq_ft} onChange={handleChange} />
        <Input label="Panel Efficiency (e.g., 0.2 for 20%)" type="number" name="panel_efficiency" step="0.01" value={formData.panel_efficiency} onChange={handleChange} />
        <Button type="submit" disabled={loading}>
          {loading ? 'Calculating...' : 'Predict Energy Generation'}
        </Button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {prediction && (
        <div style={{ marginTop: '20px' }}>
          <h3>Prediction Results</h3>
          <p><strong>Predicted Energy (kWh/year):</strong> {prediction.predicted_energy_kwh_per_year}</p>
          <p><strong>Carbon Reduction (tons CO2/year):</strong> {prediction.carbon_reduction_tons}</p>
        </div>
      )}
    </div>
  );
};

export default BipvToolPage;