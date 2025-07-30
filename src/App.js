// App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import AdminDashboard from './pages/admin/AdminDashboard'; // ✅ Admin Panel

// Supabase
import { supabase } from './utils/supabaseClient';

// Styles
import './App.css';

function App() {
  useEffect(() => {
    async function testSupabaseAuth() {
      const result = await supabase.auth.getUser();
      console.log('✅ Supabase Auth Test:', result);
    }
    testSupabaseAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-netflix-black text-white">
        <Header />

        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/buzzfeed" element={<BuzzfeedHub />} />
            <Route path="/buzzfeed/east" element={<EastPortal />} />
            <Route path="/buzzfeed/west" element={<WestPortal />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/admin" element={<AdminDashboard />} /> {/* ✅ Admin route */}
          </Routes>
        </AnimatePresence>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
