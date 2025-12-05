import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, NavLink } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PredictionPage from './pages/PredictionPage';
import DashboardPage from './pages/DashboardPage';
import SolarAnalysisPage from './pages/SolarAnalysisPage';
import CarbonCreditsPage from './pages/CarbonCreditsPage';
import AppLayout from './components/layout/AppLayout';
import './App.css';

export interface AnalysisResult {
  area: number;
  power: number;
  location: { lat: string; lng: string };
  timestamp: Date;
  polygonGeoJson: { type: 'Polygon'; coordinates: number[][][] };
  monthly_kWh?: number[];
}

export interface SiteSetup {
  polygonGeoJson: { type: 'Polygon'; coordinates: number[][][] };
  area_m2: number;
  latitude?: number;
  longitude?: number;
  method?: string;
  systemConfig?: { panels: number; watts: number };
  panelTechnology?: "mono" | "poly" | "thinfilm";
  gridType?: "on_grid" | "hybrid" | "off_grid";
  systemType?: string;
}

const App: React.FC = () => {
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [siteSetup, setSiteSetup] = useState<SiteSetup | null>(null);

  const handleNewAnalysis = (result: AnalysisResult) => {
    setAnalysisHistory(prevHistory => [result, ...prevHistory]);
  };

  const deleteAnalysis = (index: number) => {
    setAnalysisHistory(prevHistory => prevHistory.filter((_, i) => i !== index));
  };

  return (
    <Router>
      <AppLayout>
        <Switch>
          <Route path="/" exact>
            <HomePage onAnalysisComplete={handleNewAnalysis} setSiteSetup={setSiteSetup} />
          </Route>
          <Route path="/solar-analysis">
            <SolarAnalysisPage onAnalysisComplete={handleNewAnalysis} siteSetup={siteSetup} />
          </Route>
          <Route path="/prediction">
            <PredictionPage latestResult={analysisHistory[0]} />
          </Route>
          <Route path="/dashboard">
            <DashboardPage history={analysisHistory} onDeleteAnalysis={deleteAnalysis} />
          </Route>
          <Route path="/carbon-credits">
            <CarbonCreditsPage latestResult={analysisHistory[0]} />
          </Route>
        </Switch>
      </AppLayout>
    </Router>
  );
};

export default App;