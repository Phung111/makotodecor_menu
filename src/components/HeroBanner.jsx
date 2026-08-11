import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';

import 'swiper/css';
import 'swiper/css/navigation';

export default function HeroBanner({ products = [], onSelectProduct }) {
  // Read slides directly from .env variable VITE_HERO_SLIDES
  const envSlidesStr = import.meta.env.VITE_HERO_SLIDES;
  const slides = envSlidesStr
    ? envSlidesStr.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Best seller product (Product marked as "Bán chạy" in Google Sheet Banner column)
  const bestSellerProduct = products.find(p => p.banner && p.banner.toLowerCase().includes('bán chạy')) 
    || products.find(p => p.variants && p.variants.some(v => !v.isOutOfStock)) 
    || products[0];

  // Discount product (Product marked as "Giảm giá" in Google Sheet Banner column)
  const discountProduct = products.find(p => p.banner && p.banner.toLowerCase().includes('giảm giá')) 
    || products.find(p => p.variants && p.variants.some(v => v.wholesalePrice > 0)) 
    || products[1] 
    || products[0];

  const handleBestSellerClick = () => {
    if (bestSellerProduct && onSelectProduct) {
      onSelectProduct(bestSellerProduct);
    }
  };

  const handleDiscountClick = () => {
    if (discountProduct && onSelectProduct) {
      onSelectProduct(discountProduct);
    }
  };

  return (
    <section id="banner" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[460px] lg:h-[500px]">
        
        {/* Left Column: Introduce Slide (7 cols on md) */}
        <div className="md:col-span-7 bg-[#fff3e5] dark:bg-[#1e1713] rounded-2xl overflow-hidden relative border border-amber-200/40 dark:border-amber-950/40 shadow-sm flex flex-col justify-center items-center min-h-[340px] md:min-h-full">
          <div className="relative flex flex-col justify-center items-center w-full h-full p-4 sm:p-6">
            
            {/* White Japanese Kanji Watermark Text "MAKOTO DECOR" */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none p-4">
              <img
                className="w-full h-full object-contain brightness-0 invert opacity-90 dark:opacity-20"
                src="https://res.cloudinary.com/cloudinarymen/image/upload/v1743358608/makotodecor/backgrounds/loading_akamr3.png"
                alt="Makoto Decor Watermark"
              />
            </div>

            {/* Swiper Slider */}
            <div className="flex w-full justify-center items-center h-full relative z-10">
              <Swiper
                modules={[Autoplay, Navigation]}
                autoplay={{
                  delay: 3500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                loop={true}
                speed={1000}
                className="h-full w-full"
              >
                {slides.map((slideUrl, index) => (
                  <SwiperSlide key={index} className="flex items-center justify-center">
                    <img
                      src={getOptimizedCloudinaryUrl(slideUrl, { width: 1200, crop: 'limit' })}
                      alt={`slide-${index}`}
                      loading="lazy"
                      className="object-contain h-full w-full max-h-[380px]"
                      onError={(e) => handleImageError(e)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>

            {/* Maneki Neko Waving Cat Sprite Animation */}
            <div className="absolute bottom-[5%] right-[25%] z-20 pointer-events-none">
              <div className="cat-mascot"></div>
            </div>

          </div>
        </div>

        {/* Right Column: BestSeller (Top) & Discount (Bottom) (5 cols on md) */}
        <div className="md:col-span-5 flex flex-col gap-6 justify-between">
          
          {/* Top Card: BestSeller (Bán chạy nhất) */}
          <div
            onClick={handleBestSellerClick}
            className="bg-[#e8f8f0] dark:bg-[#0b2419] flex-1 rounded-2xl overflow-hidden border border-emerald-200/50 dark:border-emerald-950/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative flex items-center p-6 min-h-[210px]"
          >
            {/* Text Section */}
            <div className="relative z-10 flex flex-col justify-center gap-1 sm:gap-2 max-w-[60%]">
              <p className="text-lg sm:text-xl font-serif text-[#164332] dark:text-[#9ee6c5] leading-none opacity-80">
                Bán chạy
              </p>

              <div className="flex items-center gap-2 my-1">
                <span className="w-8 h-[1px] bg-gray-600 dark:bg-gray-400"></span>
                <span className="text-[10px] font-black tracking-widest text-gray-800 dark:text-gray-200 leading-none">HOT</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug line-clamp-2">
                {bestSellerProduct?.name || 'Bán chạy nhất'}
              </h3>

              <p className="text-xs sm:text-sm font-medium text-emerald-800 dark:text-emerald-300">
                Bán chạy nhất
              </p>

              <button
                className="flex items-center gap-2 cursor-pointer hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs sm:text-sm pt-1 transition-colors text-gray-800 dark:text-gray-200"
              >
                <span>Mua ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right Product Image (No border, no background container) */}
            <div className="absolute top-0 right-0 h-full w-[45%] flex justify-end items-center overflow-hidden">
              <img
                src={getOptimizedCloudinaryUrl(bestSellerProduct?.thumbnail, { width: 600, height: 600, crop: 'fill' }) || DEFAULT_FALLBACK_IMAGE}
                alt={bestSellerProduct?.name || 'Bán chạy nhất'}
                loading="lazy"
                className="object-cover h-full w-full rounded-r-2xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e)}
              />
            </div>
          </div>

          {/* Bottom Card: Discount (Đang giảm giá) */}
          <div
            onClick={handleDiscountClick}
            className="bg-[#e8f0fe] dark:bg-[#0d1d33] flex-1 rounded-2xl overflow-hidden border border-blue-200/50 dark:border-blue-950/50 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative flex items-center p-6 min-h-[210px]"
          >
            {/* Text Section */}
            <div className="relative z-10 flex flex-col justify-center gap-1 sm:gap-2 max-w-[55%]">
              <p className="text-lg sm:text-xl font-serif text-[#162f4d] dark:text-[#9ebef3] leading-none opacity-80">
                Đang giảm giá
              </p>

              <div className="flex items-center gap-2 my-1">
                <span className="w-8 h-[1px] bg-gray-600 dark:bg-gray-400"></span>
                <span className="text-[10px] font-black tracking-widest text-gray-800 dark:text-gray-200 leading-none">SALE</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-snug line-clamp-2">
                {discountProduct?.name || 'Đang giảm giá'}
              </h3>

              <p className="text-xs sm:text-sm font-medium text-blue-800 dark:text-blue-300">
                Đang giảm giá
              </p>

              <button
                className="flex items-center gap-2 cursor-pointer hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs sm:text-sm pt-1 transition-colors text-gray-800 dark:text-gray-200"
              >
                <span>Mua ngay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Right Product Image (No border, no background container) */}
            <div className="absolute top-0 right-0 h-full w-[45%] flex justify-end items-center overflow-hidden">
              <img
                src={getOptimizedCloudinaryUrl(discountProduct?.thumbnail, { width: 600, height: 600, crop: 'fill' }) || DEFAULT_FALLBACK_IMAGE}
                alt={discountProduct?.name || 'Đang giảm giá'}
                loading="lazy"
                className="object-cover h-full w-full rounded-r-2xl group-hover:scale-105 transition-transform duration-300"
                onError={(e) => handleImageError(e)}
              />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
