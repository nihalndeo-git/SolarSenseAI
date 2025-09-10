import { SolarIrradianceData } from '../models/SolarIrradianceData'; // Assuming you have a model for solar irradiance data
import { PredictionResult } from '../models/PredictionResult'; // Assuming you have a model for prediction results

export class SolarService {
    private performanceRatio: number;

    constructor() {
        this.performanceRatio = 0.75; // Example performance ratio
    }

    public async predictEnergyGeneration(areaSqFt: number, panelEfficiency: number, location: { lat: number; lng: number }): Promise<PredictionResult> {
        const solarIrradiance = await this.getSolarIrradianceData(location);
        const energyGeneration = this.calculateEnergy(areaSqFt, panelEfficiency, solarIrradiance);

        const carbonReduction = this.calculateCarbonReduction(energyGeneration);
        const estimatedSavings = this.calculateEstimatedSavings(energyGeneration);

        return {
            energyOutputKwh: energyGeneration,
            carbonReductionTons: carbonReduction,
            estimatedSavings: estimatedSavings,
        };
    }

    private async getSolarIrradianceData(location: { lat: number; lng: number }): Promise<number> {
        // Fetch solar irradiance data based on location
        const data = await SolarIrradianceData.findOne({ location: location });
        return data ? data.averageSolarIrradiance : 0; // Return average solar irradiance or 0 if not found
    }

    private calculateEnergy(areaSqFt: number, panelEfficiency: number, solarIrradiance: number): number {
        return areaSqFt * panelEfficiency * solarIrradiance * this.performanceRatio;
    }

    private calculateCarbonReduction(energyKwh: number): number {
        const carbonFactor = 0.0005; // Example carbon factor (tons of CO2 per kWh)
        return energyKwh * carbonFactor;
    }

    private calculateEstimatedSavings(energyKwh: number): number {
        const costPerKwh = 0.12; // Example cost per kWh
        return energyKwh * costPerKwh;
    }
}