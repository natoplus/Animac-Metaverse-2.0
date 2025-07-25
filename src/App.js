import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import BuzzfeedHub from './pages/BuzzfeedHub';
import EastPortal from './pages/EastPortal';
import WestPortal from './pages/WestPortal';
import ArticlePage from './pages/ArticlePage';

// Styles
import './App.css';

function App() {
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
          </Routes>
        </AnimatePresence>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;