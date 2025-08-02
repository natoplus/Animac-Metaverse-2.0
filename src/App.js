// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import BuzzfeedHub from './pages/BuzzfeedHub';
import EastPortal from './pages/EastPortal';
import WestPortal from './pages/WestPortal';
import ArticlePage from './pages/ArticlePage';
import WatchTowerPage from './pages/WatchTower/WatchTowerPage';
import AdminDashboard from './pages/Admin/Admin';

// Hooks
import useSupabaseAuth from './hooks/useSupabaseAuth'; // Custom hook to handle auth

// Styles
import './App.css';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/buzzfeed" element={<BuzzfeedHub />} />
        <Route path="/buzzfeed/east" element={<EastPortal />} />
        <Route path="/buzzfeed/west" element={<WestPortal />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/watch-tower" element={<WatchTowerPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

const AppContent = () => {
  useSupabaseAuth(); // Run auth effect once

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-netflix-black text-white">
      {!isAdminRoute && <Header />}
      <AnimatedRoutes />
      {!isAdminRoute && <Footer />}
    </div>
  );
};

const App = () => (
  <React.StrictMode>
    <Router>
      <AppContent />
    </Router>
  </React.StrictMode>
);

export default App;
