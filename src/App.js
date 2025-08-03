// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// Pages
import Home from './pages/Home';
import BuzzfeedHub from './pages/BuzzfeedHub';
import EastPortal from './pages/EastPortal';
import WestPortal from './pages/WestPortal';
import ArticlePage from './pages/ArticlePage';
import WatchTowerPage from './pages/WatchTowerPage';
import AdminDashboard from './pages/AdminDashboard';

// Hooks
import useSupabaseAuth from './hooks/useSupabaseAuth';

// Styles
import './App.css';

const AnimatedRoutes = ({ setIsLoading }) => {
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500); // simulate page load delay
    return () => clearTimeout(timeout);
  }, [location.pathname]);

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
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Must be called at the top level of the component
  useSupabaseAuth();

  useEffect(() => {
    console.log('[Auth] Supabase auth initialized');
  }, []);

  return (
    <div className="min-h-screen bg-netflix-black text-white relative">
      {!isAdminRoute && <Header />}
      {isLoading && <LoadingScreen />}
      <AnimatedRoutes setIsLoading={setIsLoading} />
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
