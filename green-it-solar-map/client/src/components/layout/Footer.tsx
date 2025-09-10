import React from 'react';

const Footer = () => {
  const footerStyle: React.CSSProperties = {
    backgroundColor: '#333',
    color: 'white',
    textAlign: 'center',
    padding: '20px',
    marginTop: 'auto',
  };

  return (
    <footer style={footerStyle}>
      <p>&copy; 2025 SolarSense. All Rights Reserved.</p>
    </footer>
  );
};

export default Footer;