import React, { useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { AnalysisResult } from '../App';
import { FaFilter, FaSolarPanel, FaLeaf, FaBolt, FaSearch, FaTrash } from 'react-icons/fa';
import './DashboardPage.css';

interface DashboardPageProps {
  history: AnalysisResult[];
  onDeleteAnalysis: (index: number) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ history, onDeleteAnalysis }) => {
  const routerHistory = useHistory();

  const metrics = useMemo(() => {
    const totalSites = history.length;
    const totalEnergy = history.reduce((acc, curr) => acc + (curr.power * 365), 0); // kWh/year
    const totalArea = history.reduce((acc, curr) => acc + curr.area, 0);
    const totalCo2 = (totalEnergy * 0.82) / 1000; // Tons

    // Find highest yield site
    const topSite = history.reduce((prev, current) => {
      const prevYield = prev.power / (prev.area / 6); // approx yield
      const currYield = current.power / (current.area / 6);
      return (prevYield > currYield) ? prev : current;
    }, history[0]);

    return { totalSites, totalEnergy, totalArea, totalCo2, topSite };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px' }}>
        <h1>Dashboard</h1>
        <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '24px' }}>
          No analyses saved yet. Start by analyzing a site.
        </p>
        <button
          className="ui-button primary-button"
          onClick={() => routerHistory.push('/')}
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <FaFilter className="icon" style={{ color: '#666' }} />
          <span className="filter-label">Filter by:</span>
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>All Time</option>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
          </select>
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option>All Locations</option>
          </select>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <div className="filter-group">
            <FaSearch style={{ color: '#999' }} />
            <input
              type="text"
              placeholder="Search sites..."
              className="filter-select"
              style={{ minWidth: '200px' }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="comparison-grid">
        <div className="comparison-card">
          <span className="comp-title">Total Sites Analyzed</span>
          <span className="comp-value">{metrics.totalSites}</span>
          <span className="comp-sub">Across all locations</span>
        </div>

        <div className="comparison-card">
          <span className="comp-title">Total Potential Energy</span>
          <span className="comp-value">{(metrics.totalEnergy / 1000).toFixed(2)}</span>
          <span className="comp-sub">MWh / Year</span>
        </div>

        <div className="comparison-card">
          <span className="comp-title">CO₂ Offset Potential</span>
          <span className="comp-value">{metrics.totalCo2.toFixed(1)}</span>
          <span className="comp-sub">Tons / Year</span>
        </div>

        <div className="comparison-card">
          <span className="comp-title">Top Site Yield</span>
          <span className="comp-value">
            {metrics.topSite ? (metrics.topSite.power * 365 / 1000).toFixed(1) : 0}
          </span>
          <span className="comp-sub">MWh / Year</span>
        </div>
      </div>

      {/* Saved Sites Table */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Saved Sites</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sites-table">
            <thead>
              <tr>
                <th>Site Name / Date</th>
                <th>Location</th>
                <th>Area (m²)</th>
                <th>Daily Output (kWh)</th>
                <th>Annual Output (MWh)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ fontWeight: 500 }}>Site #{history.length - index}</div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>
                      {item.timestamp.toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    {item.location.lat.substring(0, 6)}, {item.location.lng.substring(0, 6)}
                  </td>
                  <td>{item.area.toFixed(1)}</td>
                  <td>{item.power.toFixed(1)}</td>
                  <td>{(item.power * 365 / 1000).toFixed(2)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="action-btn"
                        onClick={() => routerHistory.push({
                          pathname: '/solar-analysis',
                          state: {
                            // Reconstruct state needed for analysis page
                            // Note: We now have the full polygon saved!
                            area_m2: item.area,
                            latitude: parseFloat(item.location.lat),
                            longitude: parseFloat(item.location.lng),
                            method: 'History View',
                            polygonGeoJson: item.polygonGeoJson
                          }
                        })}
                      >
                        View Analysis
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => routerHistory.push({
                          pathname: '/prediction',
                          state: {
                            pvOutputAnnual: item.power * 365,
                            area: item.area
                          }
                        })}
                      >
                        Prediction
                      </button>
                      <button
                        className="action-btn"
                        onClick={() => routerHistory.push({
                          pathname: '/carbon-credits',
                          state: {
                            // Pass necessary data for Carbon Credits calculation
                            // Assuming we can derive annual_kWh from power (which seems to be annual output in some contexts or daily?)
                            // In DashboardPage metrics, power * 365 is used for annual energy.
                            // So let's pass a constructed object that CarbonCreditsPage expects.
                            // CarbonCreditsPage expects latestResult which has power.
                            // But wait, CarbonCreditsPage uses latestResult.power * 1450 in the useEffect if annual_kWh is not passed?
                            // Actually CarbonCreditsPage takes latestResult prop.
                            // But we are navigating via history push.
                            // Let's check CarbonCreditsPage again. It takes props `latestResult`.
                            // But when navigating via router, we usually pass state.
                            // The CarbonCreditsPage component is rendered in App.tsx with `latestResult={analysisHistory[0]}`.
                            // If we navigate from Dashboard, we want to view a SPECIFIC site's carbon credits, not just the latest one in App state.
                            // However, the current App structure passes `analysisHistory[0]` to CarbonCreditsPage.
                            // To support viewing any site, we might need to update App.tsx or CarbonCreditsPage to read from location.state as well.
                            // For now, let's pass the data in state and assume we might need to update CarbonCreditsPage to read it.
                            // Actually, let's just pass it and see if we can update CarbonCreditsPage to use location state too.
                            power: item.power, // Daily kWh
                            area: item.area,
                            monthly_kWh: item.monthly_kWh
                          }
                        })}
                      >
                        <FaLeaf /> Credits
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this analysis?')) {
                            onDeleteAnalysis(index);
                          }
                        }}
                        title="Delete Analysis"
                        style={{ color: '#ef5350' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;