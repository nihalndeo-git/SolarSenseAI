import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  const headerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '15px 30px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textDecoration: 'none',
    color: '#007bff',
  };

  const navStyle: React.CSSProperties = {
    display: 'flex',
    gap: '20px',
  };

  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#333',
    fontSize: '1rem',
  };

  return (
    <header style={headerStyle}>
      <Link to="/" style={logoStyle}>
        SolarSense
      </Link>
      <nav style={navStyle}>
        <Link to="/" style={linkStyle}>Home</Link>
        <Link to="/bipv-tool" style={linkStyle}>Prediction Tool</Link>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
      </nav>
    </header>
  );
};

export default Header;