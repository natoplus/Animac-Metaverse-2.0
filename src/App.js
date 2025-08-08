// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

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

// ScrollToTop component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// PageWrapper with fade and slight slide up animation
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.5 }}
    style={{ minHeight: '100vh' }}
  >
    {children}
  </motion.div>
);

// AnimatedRoutes now uses PageWrapper and includes ScrollToTop
const AnimatedRoutes = ({ setIsLoading }) => {
  const location = useLocation();

  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => setIsLoading(false), 500); // simulate page load delay
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
          <Route path="/buzzfeed" element={<PageWrapper><BuzzfeedHub /></PageWrapper>} />
          <Route path="/buzzfeed/east" element={<PageWrapper><EastPortal /></PageWrapper>} />
          <Route path="/buzzfeed/west" element={<PageWrapper><WestPortal /></PageWrapper>} />
          <Route path="/article/:id" element={<PageWrapper><ArticlePage /></PageWrapper>} />
          <Route path="/watch-tower" element={<PageWrapper><WatchTowerPage /></PageWrapper>} />
          <Route path="/admin/*" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
        </Routes>
      </AnimatePresence>
    </>
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
