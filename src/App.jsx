import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';

import { fetchGoogleSheetRows } from './services/googleSheetService';
import { groupProductsByName } from './utils/productTransformer';
import { initAntiInspect } from './utils/antiInspect';

export default function App() {
  // Read Sheet URL from .env variable VITE_GOOGLE_SHEET_URL
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL || '';

  // Theme state: Default is 'light' as requested
  const [theme, setTheme] = useState(() => localStorage.getItem('MAKOTO_THEME') || 'light');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize Anti-Inspect if enabled in .env
  useEffect(() => {
    const cleanup = initAntiInspect();
    return cleanup;
  }, []);

  // Sync theme with HTML document root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('MAKOTO_THEME', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadData = useCallback(async (currentSheetUrl) => {
    setLoading(true);
    try {
      const rawRows = await fetchGoogleSheetRows(currentSheetUrl);
      const grouped = groupProductsByName(rawRows);
      setProducts(grouped);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(sheetUrl);
  }, [sheetUrl, loadData]);

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-300 bg-[#faf9f6] dark:bg-[#0f0f13] text-gray-900 dark:text-gray-100 selection:bg-red-500 selection:text-white">
        
        {/* Top Sticky Header */}
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Page Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={products}
                loading={loading}
                onRefresh={() => loadData(sheetUrl)}
              />
            }
          />
          <Route
            path="/product/:id"
            element={<ProductDetailPage products={products} />}
          />
        </Routes>

        {/* Footer */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}
