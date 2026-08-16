import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import CloudinaryUploadModal from './components/CloudinaryUploadModal';

import { fetchGoogleSheetRows } from './services/googleSheetService';
import { groupProductsByName } from './utils/productTransformer';
import { initAntiInspect } from './utils/antiInspect';

export default function App() {
  // Read Sheet URL from .env variable VITE_GOOGLE_SHEET_URL
  const sheetUrl = import.meta.env.VITE_GOOGLE_SHEET_URL;

  // Theme state: Default is 'light' as requested
  const [theme, setTheme] = useState(() => localStorage.getItem('MAKOTO_THEME') || 'light');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cloudinary Upload Tool Modal State
  const [isCloudinaryModalOpen, setIsCloudinaryModalOpen] = useState(false);

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

  // Set history scrollRestoration to manual to prevent browser auto-jumping during async data load
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      // Save scroll position
      sessionStorage.setItem('MAKOTO_SCROLL_Y', window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Restore scroll position after products data is loaded and rendered
  useEffect(() => {
    if (!loading && products.length > 0) {
      const savedY = sessionStorage.getItem('MAKOTO_SCROLL_Y');
      if (savedY !== null) {
        const targetY = parseInt(savedY, 10);
        if (targetY > 0) {
          requestAnimationFrame(() => {
            setTimeout(() => {
              window.scrollTo({ top: targetY, behavior: 'instant' });
            }, 80);
          });
        }
      }
    }
  }, [loading, products]);

  return (
    <BrowserRouter>
      <div className="min-h-screen transition-colors duration-300 bg-[#faf9f6] dark:bg-[#0f0f13] text-gray-900 dark:text-gray-100 selection:bg-red-500 selection:text-white">
        
        {/* Top Sticky Header */}
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenCloudinaryModal={() => setIsCloudinaryModalOpen(true)}
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

        {/* Cloudinary Batch Upload Tool Modal */}
        <CloudinaryUploadModal
          isOpen={isCloudinaryModalOpen}
          onClose={() => setIsCloudinaryModalOpen(false)}
        />

      </div>
    </BrowserRouter>
  );
}
