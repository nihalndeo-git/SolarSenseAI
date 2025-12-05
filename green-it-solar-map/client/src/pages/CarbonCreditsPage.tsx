import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { AnalysisResult } from '../App';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './CarbonCreditsPage.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

interface CarbonResult {
    annual_CO2_kg: number;
    annual_CO2_tons: number;
    carbon_credits: number;
    monthly_CO2_tons: number;
    daily_CO2_kg: number;
    daily_CO2_tons: number;
    lifetime_years: number;
    lifetime_CO2_tons: number;
    lifetime_credits: number;
    price_low_usd: number;
    price_high_usd: number;
    usd_to_inr: number;
    annual_revenue_low_usd: number;
    annual_revenue_high_usd: number;
    annual_revenue_low_inr: number;
    annual_revenue_high_inr: number;
    trees_equivalent: number;
    cars_offset: number;
    petrol_liters_saved: number;
}

interface CarbonCreditsPageProps {
    latestResult?: AnalysisResult;
}

interface LocationState {
    power?: number; // Daily kWh
    area?: number;
    monthly_kWh?: number[];
}

const CarbonCreditsPage: React.FC<CarbonCreditsPageProps> = ({ latestResult }) => {
    const [carbonData, setCarbonData] = useState<CarbonResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const history = useHistory();
    const location = useLocation<LocationState>();
    const contentRef = useRef<HTMLDivElement>(null);

    // Use location state (from Dashboard) or latestResult (from App)
    const sourceData = location.state || latestResult;

    const handleDownloadPdf = () => {
        const element = contentRef.current;
        if (!element) return;

        const opt = {
            margin: 10,
            filename: 'Carbon_Impact_Certificate.pdf',
            image: { type: 'jpeg', quality: 0.98 } as any,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        } as any;

        html2pdf().set(opt).from(element).save();
    };

    useEffect(() => {
        const fetchCarbonData = async () => {
            if (!sourceData || sourceData.power === undefined) return;

            setLoading(true);
            setError(null);
            try {
                // power is Daily kWh (as per SolarAnalysisPage and DashboardPage)
                // Annual kWh = Daily kWh * 365
                const annual_kWh = sourceData.power * 365;

                const response = await fetch('http://localhost:5000/api/carbon/calculate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ annual_kWh }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch carbon data');
                }

                const data = await response.json();
                setCarbonData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCarbonData();
    }, [sourceData]);

    if (!sourceData) {
        return (
            <div className="carbon-page-container">
                <div className="no-data-message">
                    <h2>No Analysis Found</h2>
                    <p>Please complete a solar analysis first to view carbon credits.</p>
                    <button onClick={() => history.push('/')} className="primary-btn">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="loading">Calculating Carbon Impact...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!carbonData) return null;

    return (
        <div className="carbon-page-container" ref={contentRef}>
            <div className="page-header">
                <h1>Carbon Credits & Climate Impact</h1>
                <p>Monetize your environmental contribution through India's Carbon Credit Trading Scheme (CCTS)</p>
            </div>

            {/* SECTION A: Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Annual CO₂ Avoided</h3>
                    <div className="value">{carbonData.annual_CO2_tons.toFixed(2)} Tons</div>
                    <div className="sub-text">~{carbonData.annual_CO2_kg.toFixed(0)} kg per year</div>
                </div>
                <div className="stat-card highlight">
                    <h3>Carbon Credits Earned</h3>
                    <div className="value">{carbonData.carbon_credits.toFixed(2)}</div>
                    <div className="sub-text">Credits / Year</div>
                </div>
                <div className="stat-card">
                    <h3>Revenue Potential</h3>
                    <div className="value">₹{carbonData.annual_revenue_low_inr.toFixed(0)} - ₹{carbonData.annual_revenue_high_inr.toFixed(0)}</div>
                    <div className="sub-text">Per Year (Estimated)</div>
                </div>
                <div className="stat-card">
                    <h3>Lifetime Impact (25 Years)</h3>
                    <div className="value">{carbonData.lifetime_CO2_tons.toFixed(1)} Tons</div>
                    <div className="sub-text">Total CO₂ Avoided</div>
                </div>
            </div>

            <div className="impact-equivalents">
                <div className="impact-item">
                    <span className="icon">🌳</span>
                    <span className="text">Equivalent to planting <strong>{carbonData.trees_equivalent.toFixed(0)}</strong> trees</span>
                </div>
                <div className="impact-item">
                    <span className="icon">🚗</span>
                    <span className="text">Removes <strong>{carbonData.cars_offset.toFixed(1)}</strong> cars from the road</span>
                </div>
                <div className="impact-item">
                    <span className="icon">⛽</span>
                    <span className="text">Saves <strong>{carbonData.petrol_liters_saved.toFixed(0)}</strong> liters of petrol</span>
                </div>
            </div>

            {/* SECTION B: Charts */}
            <div className="charts-section">
                <div className="chart-container">
                    <h3>Annual vs Lifetime Credits</h3>
                    <Bar
                        data={{
                            labels: ['Annual', 'Lifetime (25y)'],
                            datasets: [
                                {
                                    label: 'Carbon Credits',
                                    data: [carbonData.carbon_credits, carbonData.lifetime_credits],
                                    backgroundColor: ['#4CAF50', '#2E7D32'],
                                },
                            ],
                        }}
                        options={{ responsive: true }}
                    />
                </div>
                <div className="chart-container">
                    <h3>Monthly CO₂ Avoided (Tons)</h3>
                    <Line
                        data={{
                            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            datasets: [
                                {
                                    label: 'CO₂ Avoided',
                                    data: sourceData.monthly_kWh
                                        ? sourceData.monthly_kWh.map(kwh => (kwh * 0.9) / 1000)
                                        : Array(12).fill(carbonData.monthly_CO2_tons),
                                    borderColor: '#2196F3',
                                    backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                    fill: true,
                                },
                            ],
                        }}
                        options={{ responsive: true }}
                    />
                </div>
            </div>

            {/* SECTION C: Educational Content */}
            <div className="educational-section">
                <h2>Understanding Carbon Credits</h2>
                <div className="info-block">
                    <h3>What are Carbon Credits?</h3>
                    <p>
                        A carbon credit is a permit that allows the owner to emit a certain amount of carbon dioxide or other greenhouse gases.
                        One credit permits the emission of one ton of carbon dioxide or the equivalent in other greenhouse gases.
                    </p>
                </div>

                <div className="info-block">
                    <h3>India’s Carbon Credit Trading Scheme (CCTS)</h3>
                    <p>
                        The CCTS was established under the Energy Conservation Act Amendments (2022). It operates as a rate-based Emissions Trading Scheme (ETS),
                        where Carbon Credit Certificates (CCCs) are issued by the Bureau of Energy Efficiency (BEE).
                    </p>
                    <ul>
                        <li><strong>Sectors Covered:</strong> Aluminium, cement, refining, steel, fertilizers, petrochemicals, textiles, pulp & paper, and chlor-alkali (starting ~2026).</li>
                        <li><strong>Mechanism:</strong> Entities that overachieve their emission intensity targets earn CCCs, while underachievers must purchase them.</li>
                        <li><strong>Regulation:</strong> The CERC acts as the market regulator, and the National Registry is managed by the Grid Controller of India.</li>
                    </ul>
                </div>

                <div className="info-block">
                    <h3>Why Solar PV Earns Credits?</h3>
                    <p>
                        India's grid is heavily reliant on coal. Every kWh of solar energy generated avoids approximately 0.9 kg of CO₂ emissions.
                        This makes solar power an extremely strong generator of carbon credits.
                    </p>
                </div>
            </div>

            {/* SECTION D: PDF Export */}
            <div className="actions-section" data-html2canvas-ignore="true">
                <button className="download-btn" onClick={handleDownloadPdf}>
                    Download Carbon Impact Certificate (PDF)
                </button>
            </div>
        </div>
    );
};

export default CarbonCreditsPage;
