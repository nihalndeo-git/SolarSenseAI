import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSun, FaQuestionCircle, FaMoon, FaSun as FaSunIcon } from 'react-icons/fa';
import './TopAppBar.css';

interface TopAppBarProps {
  currentStep?: number;
  onThemeToggle?: () => void;
  isDark?: boolean;
}

const TopAppBar: React.FC<TopAppBarProps> = ({ currentStep, onThemeToggle, isDark = false }) => {
  const location = useLocation();

  // Determine current step based on route
  let step = 1;
  if (location.pathname === '/solar-analysis') step = 2;
  else if (location.pathname === '/prediction') step = 3;
  else if (location.pathname === '/dashboard') step = 4;
  else if (location.pathname === '/carbon-credits') step = 5;

  const steps = [
    { num: 1, label: 'Site Setup', path: '/' },
    { num: 2, label: 'Solar Analysis', path: '/solar-analysis' },
    { num: 3, label: 'Prediction', path: '/prediction' },
    { num: 4, label: 'Dashboard', path: '/dashboard' },
    { num: 5, label: 'Carbon Credits', path: '/carbon-credits' },
  ];

  return (
    <header className="top-app-bar">
      <div className="app-bar-content">
        <div className="app-bar-left">
          <Link to="/" className="app-logo">
            <FaSun className="logo-icon" />
            <span className="logo-text">SolarSenseAI</span>
          </Link>
        </div>

        <div className="app-bar-center">
          <div className="step-indicator">
            {steps.map((s, idx) => (
              <React.Fragment key={s.num}>
                <Link
                  to={s.path}
                  className={`step-item ${step >= s.num ? 'active' : ''} ${step === s.num ? 'current' : ''}`}
                >
                  <span className="step-number">{s.num}</span>
                  <span className="step-label">{s.label}</span>
                </Link>
                {idx < steps.length - 1 && <div className="step-connector" />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="app-bar-right">
          <button className="icon-button" title="Help / Info">
            <FaQuestionCircle />
          </button>
          {onThemeToggle && (
            <button className="icon-button" onClick={onThemeToggle} title="Toggle theme">
              {isDark ? <FaSunIcon /> : <FaMoon />}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;

