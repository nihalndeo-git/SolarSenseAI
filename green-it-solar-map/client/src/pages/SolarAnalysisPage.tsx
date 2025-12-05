import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
    FaArrowLeft, FaSun, FaMap, FaBolt, FaSync, FaArrowRight, FaChartBar, FaClock, FaSolarPanel
} from 'react-icons/fa';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { AnalysisResult, SiteSetup } from '../App';
import { sampleGHI, computePV, PVCalculationResult, ZonalStats, getHourlyIrradiance, PVSystemPreset } from '../services/api';
import { pvPresets } from '../config/pvPresets';
import './SolarAnalysisPage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface SolarAnalysisPageProps {
    onAnalysisComplete?: (result: AnalysisResult) => void;
    siteSetup: SiteSetup | null;
}

interface AnalysisData {
    layers: Record<string, ZonalStats> | null;
    pv: PVCalculationResult | null;
    loading: boolean;
    error: string | null;
    systemConfig: PVSystemPreset | null;
}

interface HourlyIrradianceData {
    hourly: {
        time: string[];
        shortwave_radiation?: (number | null)[];
        direct_radiation?: (number | null)[];
        global_tilted_irradiance?: (number | null)[];
    };
}

const PanelTechProfiles = {
    mono: { power: 420, area: 1.7, coeff: -0.35, noct: 45 },
    poly: { power: 400, area: 1.8, coeff: -0.40, noct: 45 },
    thinfilm: { power: 150, area: 1.2, coeff: -0.25, noct: 44 },
};

const SolarAnalysisPage: React.FC<SolarAnalysisPageProps> = ({ onAnalysisComplete, siteSetup }) => {
    const location = useLocation<SiteSetup>();
    const history = useHistory();
    // Use location state if available (fresh navigation), otherwise fallback to persistent app state
    const state = location.state || siteSetup;

    // Local state for interactive configuration
    const [config, setConfig] = useState({
        systemType: state?.systemType || 'smallResidential',
        panelTechnology: (state?.panelTechnology || 'mono') as "mono" | "poly" | "thinfilm",
        gridType: (state?.gridType || 'on_grid') as "on_grid" | "hybrid" | "off_grid",
    });

    const [analysis, setAnalysis] = useState<AnalysisData>({
        layers: null,
        pv: null,
        loading: false,
        error: null,
        systemConfig: null,
    });

    const [hourlyData, setHourlyData] = useState<HourlyIrradianceData | null>(null);
    const [hourlyLoading, setHourlyLoading] = useState(false);

    // Initial Analysis
    useEffect(() => {
        if (state && state.polygonGeoJson && state.area_m2 > 0) {
            runFullAnalysis();
        }
    }, [state]);

    // Re-calculate when config changes (if layers exist)
    useEffect(() => {
        if (analysis.layers && !analysis.loading) {
            recalculatePV();
        }
    }, [config]);

    useEffect(() => {
        if (state?.latitude && state?.longitude) {
            fetchHourlyIrradiance();
        }
    }, [state?.latitude, state?.longitude]);

    const runFullAnalysis = async () => {
        setAnalysis(prev => ({ ...prev, loading: true, error: null }));
        try {
            // 1. Sample all required layers
            const layerNames = ['GHI', 'DNI', 'DIF', 'PVOUT', 'GTI', 'OPTA', 'TEMP', 'ELE'];
            for (let i = 1; i <= 12; i++) {
                layerNames.push(`PVOUT_${String(i).padStart(2, '0')}`);
            }

            const gisResult = await sampleGHI(state.polygonGeoJson, layerNames);

            if (!gisResult.layers || !gisResult.layers.GHI) {
                throw new Error('Failed to sample GHI data');
            }

            const layers = gisResult.layers;

            // 2. Compute PV Output
            const pvResult = await computePV({
                polygonGeoJson: state.polygonGeoJson,
                area_m2: state.area_m2,
                ghi_mean: layers.GHI.mean,
                systemConfig: config.systemType,
                useTiltCorrection: true,
                latitude: state.latitude,
                longitude: state.longitude,
                panelTechnology: config.panelTechnology,
                gridType: config.gridType,
                layers: layers
            });

            setAnalysis({
                layers: layers,
                pv: pvResult.pv,
                loading: false,
                error: null,
                systemConfig: (pvResult as any).systemConfig
            });

        } catch (error: any) {
            console.error('Analysis error:', error);
            setAnalysis(prev => ({ ...prev, loading: false, error: error.message }));
        }
    };

    const recalculatePV = async () => {
        if (!analysis.layers) return;

        try {
            const pvResult = await computePV({
                polygonGeoJson: state.polygonGeoJson,
                area_m2: state.area_m2,
                ghi_mean: analysis.layers.GHI.mean,
                systemConfig: config.systemType,
                useTiltCorrection: true,
                latitude: state.latitude,
                longitude: state.longitude,
                panelTechnology: config.panelTechnology,
                gridType: config.gridType,
                layers: analysis.layers
            });

            setAnalysis(prev => ({
                ...prev,
                pv: pvResult.pv,
                systemConfig: (pvResult as any).systemConfig
            }));
        } catch (error) {
            console.error('Recalculation error:', error);
        }
    };

    const fetchHourlyIrradiance = async () => {
        if (!state?.latitude || !state?.longitude) return;

        setHourlyLoading(true);
        try {
            const today = new Date().toISOString().slice(0, 10);
            const data = await getHourlyIrradiance({
                lat: state.latitude,
                lng: state.longitude,
                start: today,
                end: today,
            });
            setHourlyData(data);
        } catch (error) {
            console.error('Error fetching hourly irradiance:', error);
        } finally {
            setHourlyLoading(false);
        }
    };

    const handlePrediction = () => {
        if (analysis.pv && state.latitude && state.longitude) {
            const result: AnalysisResult = {
                area: state.area_m2,
                power: analysis.pv.daily_kWh,
                location: { lat: state.latitude.toString(), lng: state.longitude.toString() },
                timestamp: new Date(),
                polygonGeoJson: state.polygonGeoJson,
                monthly_kWh: analysis.pv.monthly_kWh_usable || analysis.pv.monthly_kWh
            };
            if (onAnalysisComplete) onAnalysisComplete(result);
            history.push({
                pathname: '/prediction',
                state: {
                    pvOutputAnnual: analysis.pv.yearly_kWh_usable || analysis.pv.yearly_kWh,
                    installedCapacity: analysis.pv.P_dc_kWp || analysis.pv.installed_capacity_kWp,
                    area: state.area_m2
                }
            });
        }
    };

    if (!state) return <div className="error-state">No data available. Please start from the map.</div>;

    const { layers, pv, systemConfig } = analysis;

    // Chart Data
    const monthlyData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
            {
                label: 'Monthly Energy Output (kWh)',
                data: pv ? (pv.monthly_kWh_usable || pv.monthly_kWh) : [],
                backgroundColor: 'rgba(255, 152, 0, 0.7)',
                borderColor: 'rgba(255, 152, 0, 1)',
                borderWidth: 1,
                borderRadius: 4,
            },
        ],
    };

    const hourlyChartData = hourlyData ? {
        labels: hourlyData.hourly.time.map((t: string) => {
            const date = new Date(t);
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        }),
        datasets: [
            {
                label: 'Global Tilted (W/m²)',
                data: hourlyData.hourly.global_tilted_irradiance || [],
                borderColor: 'rgba(255, 152, 0, 1)',
                backgroundColor: 'rgba(255, 152, 0, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Shortwave (W/m²)',
                data: hourlyData.hourly.shortwave_radiation || [],
                borderColor: 'rgba(33, 150, 243, 0.8)',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                fill: true,
                tension: 0.4,
                borderDash: [5, 5],
            },
        ],
    } : null;

    return (
        <div className="solar-analysis-page">
            <div className="page-header">
                <h1>Solar Potential Analysis</h1>
                <div className="header-actions">
                    <button className="ui-button primary-button" onClick={runFullAnalysis} disabled={analysis.loading}>
                        <FaSync className={analysis.loading ? 'fa-spin' : ''} /> Refresh Analysis
                    </button>
                </div>
            </div>

            {analysis.error && (
                <div className="error-banner">
                    <p>Error: {analysis.error}</p>
                </div>
            )}

            <div className="analysis-grid">
                {/* Left Column */}
                <div className="left-column">
                    {/* 1. Site Overview */}
                    <div className="analysis-card site-overview">
                        <h3 className="card-title"><FaMap /> Site Overview</h3>
                        <div className="card-content">
                            <div className="overview-item">
                                <span className="label">Total Area</span>
                                <span className="value">{state.area_m2.toFixed(1)} <small>m²</small></span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Effective Area</span>
                                <span className="value">{pv?.area_effective_m2.toFixed(1) || '-'} <small>m²</small></span>
                            </div>
                            <div className="overview-item">
                                <span className="label">Location</span>
                                <span className="value">{state.latitude?.toFixed(4)}, {state.longitude?.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. Solar Resource */}
                    <div className="analysis-card solar-resource">
                        <h3 className="card-title"><FaSun /> Solar Resource</h3>
                        <div className="resource-grid">
                            <div className="resource-item">
                                <span className="res-label">GHI</span>
                                <span className="res-value">{layers?.GHI?.mean.toFixed(2) || '-'}</span>
                                <span className="res-unit">kWh/m²/day</span>
                            </div>
                            <div className="resource-item">
                                <span className="res-label">DNI</span>
                                <span className="res-value">{layers?.DNI?.mean.toFixed(2) || '-'}</span>
                                <span className="res-unit">kWh/m²/day</span>
                            </div>
                            <div className="resource-item">
                                <span className="res-label">GTI (POA)</span>
                                <span className="res-value">{layers?.GTI?.mean.toFixed(2) || '-'}</span>
                                <span className="res-unit">kWh/m²/day</span>
                            </div>
                            <div className="resource-item">
                                <span className="res-label">PVOUT</span>
                                <span className="res-value">{layers?.PVOUT?.mean ? (layers.PVOUT.mean / 365).toFixed(2) : '-'}</span>
                                <span className="res-unit">kWh/kWp/day</span>
                            </div>
                            <div className="resource-item">
                                <span className="res-label">Temp</span>
                                <span className="res-value">{layers?.TEMP?.mean.toFixed(1) || '-'}</span>
                                <span className="res-unit">°C</span>
                            </div>
                            <div className="resource-item">
                                <span className="res-label">Optimum Tilt</span>
                                <span className="res-value">{layers?.OPTA?.mean.toFixed(1) || '-'}</span>
                                <span className="res-unit">°</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. PV Configuration (Interactive) */}
                    <div className="analysis-card pv-config">
                        <h3 className="card-title"><FaSolarPanel /> PV Configuration</h3>
                        <div className="card-content">
                            <div className="config-input-group">
                                <label>System Type</label>
                                <div className="option-group">
                                    {Object.entries(pvPresets).map(([key, preset]) => (
                                        <div
                                            key={key}
                                            className={`option-chip ${config.systemType === key ? 'active' : ''}`}
                                            onClick={() => setConfig({ ...config, systemType: key })}
                                        >
                                            {preset.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="config-input-group">
                                <label>Panel Technology</label>
                                <div className="option-group">
                                    {[
                                        { value: 'mono', label: 'Monocrystalline' },
                                        { value: 'poly', label: 'Polycrystalline' },
                                        { value: 'thinfilm', label: 'Thin Film' }
                                    ].map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`option-chip ${config.panelTechnology === opt.value ? 'active' : ''}`}
                                            onClick={() => setConfig({ ...config, panelTechnology: opt.value as any })}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="config-input-group">
                                <label>Grid Connection</label>
                                <div className="option-group">
                                    {[
                                        { value: 'on_grid', label: 'On Grid' },
                                        { value: 'hybrid', label: 'Hybrid' },
                                        { value: 'off_grid', label: 'Off Grid' }
                                    ].map((opt) => (
                                        <div
                                            key={opt.value}
                                            className={`option-chip ${config.gridType === opt.value ? 'active' : ''}`}
                                            onClick={() => setConfig({ ...config, gridType: opt.value as any })}
                                        >
                                            {opt.label}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="config-details">
                                <div className="detail-item">
                                    <span className="detail-label">Panel Power</span>
                                    <span className="detail-value">{PanelTechProfiles[config.panelTechnology].power} W</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Panel Area</span>
                                    <span className="detail-value">{PanelTechProfiles[config.panelTechnology].area} m²</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Temp Coeff</span>
                                    <span className="detail-value">{PanelTechProfiles[config.panelTechnology].coeff}%/°C</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* 4. Energy Yield Summary */}
                    <div className="analysis-card energy-yield">
                        <h3 className="card-title"><FaBolt /> Energy Yield Summary</h3>
                        {pv ? (
                            <div className="yield-content">
                                <div className="main-metric">
                                    <span className="metric-value">{(pv.yearly_kWh_usable || pv.yearly_kWh).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                    <span className="metric-unit">kWh/year</span>
                                    <span className="metric-label">Estimated Annual Production</span>
                                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 400 }}>
                                        * Yield adjusted for selected technology’s temperature coefficient at local climate.
                                    </div>
                                </div>
                                <div className="secondary-metrics">
                                    <div className="metric-item">
                                        <span className="m-label">System Size</span>
                                        <span className="m-value">{pv.P_dc_kWp.toFixed(2)} kWp</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="m-label">No. of Panels</span>
                                        <span className="m-value">{pv.num_panels || pv.n_panels || '-'}</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="m-label">Usable Area</span>
                                        <span className="m-value">{pv.area_effective_m2?.toFixed(1) || '-'} m²</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="m-label">Specific Yield</span>
                                        <span className="m-value">{pv.specific_yield_kwh_kwp_calibrated.toFixed(0)} kWh/kWp</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="m-label">Perf. Ratio</span>
                                        <span className="m-value">{(pv.performance_ratio * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="metric-item">
                                        <span className="m-label">Daily Avg</span>
                                        <span className="m-value">{((pv.yearly_kWh_usable || pv.yearly_kWh) / 365).toFixed(1)} kWh</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="loading-placeholder">Calculating...</div>
                        )}
                    </div>

                    {/* 5. Monthly Production Graph */}
                    <div className="analysis-card monthly-graph">
                        <h3 className="card-title"><FaChartBar /> Monthly Production</h3>
                        <div className="chart-container">
                            <Bar data={monthlyData} options={{ maintainAspectRatio: false, responsive: true }} />
                        </div>
                    </div>

                    {/* 6. Hourly Irradiance (Optional/Extra) */}
                    <div className="analysis-card hourly-graph">
                        <h3 className="card-title"><FaClock /> Hourly Solar Irradiance (Today)</h3>
                        <div className="chart-container">
                            {hourlyLoading ? (
                                <div className="loading-spinner"><FaSync className="fa-spin" /></div>
                            ) : hourlyChartData ? (
                                <Line data={hourlyChartData} options={{ maintainAspectRatio: false, responsive: true }} />
                            ) : (
                                <div className="no-data">No hourly data available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-actions">
                <button className="ui-button secondary-button large" onClick={() => history.push('/')}>
                    <FaArrowLeft /> Back to Map
                </button>
                <div className="spacer" style={{ flex: 1 }}></div>
                <button className="ui-button primary-button large" onClick={handlePrediction} disabled={!pv}>
                    Continue to Financial Prediction <FaArrowRight />
                </button>
            </div>
        </div>
    );
};

export default SolarAnalysisPage;
