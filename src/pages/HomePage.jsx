import React, { useState, useMemo } from 'react';
import { Search, Sparkles, RefreshCw, ShoppingBag, Layers } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroBanner from '../components/HeroBanner';
import CategorySlider from '../components/CategorySlider';

export default function HomePage({ products = [], loading = false, onRefresh }) {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['Tất cả', ...Array.from(set)];
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesCategory = selectedCategory === 'Tất cả' || product.category === selectedCategory;
        const matchesSearch = searchQuery === '' || 
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.subcategory.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'price-asc') return a.minPrice - b.minPrice;
        if (sortOrder === 'price-desc') return b.minPrice - a.minPrice;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, sortOrder]);

  return (
    <div className="min-h-screen pb-20">
      
      {/* Hero Banner Component (Slideshow + Best Seller + Discount Cards) */}
      <HeroBanner 
        products={products} 
        onSelectProduct={(prod) => setSelectedProduct(prod)} 
      />

      {/* Main Header / Search Filter Bar */}
      <section className="relative overflow-hidden py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-300 border-gray-200/80 dark:border-gray-800/80 bg-gradient-to-b from-orange-50/50 via-white to-gray-50 dark:from-[#181216] dark:via-[#111118] dark:to-[#0f0f13]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/30 text-xs font-bold text-red-700 dark:text-red-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Makoto Decor 2026 • Japanese Decor & Art Menu</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
            DANH MỤC SẢN PHẨM & <span className="text-red-600 dark:gold-gradient-text">BẢNG GIÁ MENU</span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium">
            Khám phá trọn bộ các dòng sản phẩm thi công trang trí phong cách Nhật Bản: Cờ cá chép Koi Nobori, rèm Noren, bảng hiệu Izakaya, quạt Sensu và mascot decor.
          </p>

          {/* Search & Filter Inputs Container */}
          <div className="max-w-3xl mx-auto mt-8 glass-effect-light p-2 sm:p-3 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-lg dark:shadow-2xl flex flex-col sm:flex-row items-center gap-3">
            
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm sản phẩm theo tên, loại vật liệu..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs focus:outline-none focus:border-red-500 cursor-pointer font-medium"
                >
                  <option value="default">Sắp xếp: Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                </select>
              </div>

              <button
                onClick={onRefresh}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors shadow-sm"
                title="Tải lại dữ liệu từ Google Sheet"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-500' : ''}`} />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Category Slider Component (Positioned below Search bar and above Products) */}
      <CategorySlider
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        products={products}
      />

      {/* Main Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-red-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Sản phẩm • {filteredProducts.length}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-red-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang tải dữ liệu từ Google Sheet...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 glass-effect-light rounded-2xl text-center border border-gray-200 dark:border-gray-800 space-y-3 shadow-sm">
            <ShoppingBag className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-gray-500">Thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={setSelectedProduct}
              />
            ))}
          </div>
        )}

      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}
