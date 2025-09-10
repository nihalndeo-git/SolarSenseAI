import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import BipvToolPage from './pages/BipvToolPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/" exact component={HomePage} />
        <Route path="/bipv-tool" component={BipvToolPage} />
        <Route path="/dashboard" component={DashboardPage} />
      </Switch>
      <Footer />
    </Router>
  );
};

export default App;