import React, { useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';

import 'swiper/css';
import 'swiper/css/navigation';

export default function CategorySlider({ 
  categories = [], 
  selectedCategory = 'Tất cả', 
  onSelectCategory,
  products = [] 
}) {
  // Multiply categories array so loop=true is 100% smooth from start
  const displayCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    let list = [...categories];
    while (list.length < 24) {
      list = [...list, ...categories];
    }
    return list;
  }, [categories]);

  // Map category to a representative thumbnail image (first product in category or red daruma mascot)
  const getCategoryIcon = (catName) => {
    if (catName === 'Tất cả') {
      return 'https://res.cloudinary.com/cloudinarymen/image/upload/v1750352608/makotodecor/backgrounds/Pngtree_mascot_japan_red_daruma_6600704_kfew8w.png';
    }
    const matchedProduct = products.find(p => p.category === catName || p.subcategory === catName);
    return matchedProduct?.thumbnail || 'https://res.cloudinary.com/cloudinarymen/image/upload/v1750352608/makotodecor/backgrounds/Pngtree_mascot_japan_red_daruma_6600704_kfew8w.png';
  };

  return (
    <section id="category" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      {/* Swiper Category Carousel */}
      <div className="relative">
        <div className="absolute left-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-r from-gray-50 dark:from-[#0f0f13] via-transparent to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 w-8 sm:w-16 h-full bg-gradient-to-l from-gray-50 dark:from-[#0f0f13] via-transparent to-transparent z-10 pointer-events-none" />

        <Swiper
          modules={[Autoplay, Navigation]}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          speed={8000}
          slidesPerView={3}
          spaceBetween={14}
          breakpoints={{
            480: {
              slidesPerView: 4,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 5,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 6,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 7,
              spaceBetween: 24,
            },
          }}
          style={{
            '--swiper-wrapper-transition-timing-function': 'linear',
          }}
          className="w-full !py-3 !px-1"
        >
          {displayCategories.map((catName, index) => {
            const isSelected = selectedCategory === catName;
            const iconUrl = getCategoryIcon(catName);

            return (
              <SwiperSlide key={index} className="group">
                <div
                  onClick={() => onSelectCategory && onSelectCategory(catName)}
                  className={`bg-white dark:bg-[#15151f] aspect-square rounded-2xl p-2.5 sm:p-3 text-center shadow-sm hover:shadow-xl transition-all cursor-pointer duration-300 transform hover:-translate-y-2 border flex flex-col items-center justify-between ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-500/40 bg-red-50/40 dark:bg-red-950/20'
                      : 'border-gray-200/80 dark:border-gray-800/80'
                  }`}
                >
                  <div className="relative w-full h-full flex flex-col items-center justify-between">
                    {/* Circle Background & Image Area */}
                    <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden">
                      <div className="absolute aspect-square rounded-full h-[80%] bg-gray-100 dark:bg-gray-800/60 opacity-80 pointer-events-none" />
                      
                      {/* Category Mascot / Thumbnail Image */}
                      <img
                        src={getOptimizedCloudinaryUrl(iconUrl, { width: 250, height: 250, crop: 'fit' })}
                        alt={catName}
                        loading="lazy"
                        className="object-contain h-[75%] w-[75%] transition-all duration-300 group-hover:-translate-y-1 z-10"
                        onError={(e) => handleImageError(e)}
                      />
                    </div>
                    
                    {/* Category Label (2 lines allowed, centered) */}
                    <h3 className={`font-bold text-[11px] sm:text-xs leading-tight z-10 line-clamp-2 max-w-full text-center h-[2.3rem] flex items-center justify-center transition-colors px-0.5 ${
                      isSelected
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-800 dark:text-gray-200 group-hover:text-red-600 dark:group-hover:text-red-400'
                    }`}>
                      {catName}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

    </section>
  );
}
