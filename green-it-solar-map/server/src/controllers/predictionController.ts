import { Request, Response } from 'express';

// This is a simplified model. In a real app, you'd fetch this from a database or a dedicated service.
const getSolarIrradiance = (lat: number, lng: number): number => {
  // Placeholder value. A real implementation would use a solar data API or a complex model.
  return 5.5; // Average peak sun hours per day
};

export const predictEnergy = (req: Request, res: Response) => {
  const { area_sq_ft, panel_efficiency, lat, lng } = req.body;

  if (!area_sq_ft || !panel_efficiency || !lat || !lng) {
    return res.status(400).json({ error: 'Missing required parameters.' });
  }

  const solarIrradiance = getSolarIrradiance(lat, lng);
  const performanceRatio = 0.75; // Accounts for real-world losses (e.g., temperature, dirt)

  // Energy (kWh per year) = Area (m^2) * Panel Efficiency * Solar Irradiance * Performance Ratio * 365
  const area_sq_m = area_sq_ft * 0.092903;
  const energy_output_kwh_per_year = area_sq_m * panel_efficiency * solarIrradiance * performanceRatio * 365;

  // Based on EPA conversion factor: 1 MWh = 0.709 metric tons of CO2
  const carbon_reduction_tons = (energy_output_kwh_per_year / 1000) * 0.709;

  res.json({
    predicted_energy_kwh_per_year: energy_output_kwh_per_year.toFixed(2),
    carbon_reduction_tons: carbon_reduction_tons.toFixed(2),
  });
};