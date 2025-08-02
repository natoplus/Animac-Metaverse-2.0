// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import BuzzfeedHub from './pages/BuzzfeedHub';
import EastPortal from './pages/EastPortal';
import WestPortal from './pages/WestPortal';
import ArticlePage from './pages/ArticlePage';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Supabase
import { supabase } from './utils/supabaseClient';

// Styles
import './App.css';

// Wrapper for AnimatePresence with route transitions
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
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  useEffect(() => {
    async function testSupabaseAuth() {
      try {
        const result = await supabase.auth.getUser();
        console.log('✅ Supabase Auth Test:', result);
      } catch (error) {
        console.error('❌ Supabase Auth Error:', error);
      }
    }
    testSupabaseAuth();
  }, []);

  return (
    <React.StrictMode>
      <Router>
        <div className="min-h-screen bg-netflix-black text-white">
          <Header />
          <AnimatedRoutes />
          <Footer />
        </div>
      </Router>
    </React.StrictMode>
  );
}

export default App;
