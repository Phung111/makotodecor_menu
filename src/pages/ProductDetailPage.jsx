import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Truck, Palette, MessageCircle, Phone, Tag, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import { formatVND } from '../utils/productTransformer';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export default function ProductDetailPage({ products = [] }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const zaloPhone = import.meta.env.VITE_ZALO_PHONE || '0900000000';
  const facebookLink = import.meta.env.VITE_FACEBOOK_LINK || 'https://m.me/makotodecor';

  const product = products.find(p => p.id === id) || products[0];

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-sm">Không tìm thấy sản phẩm</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-xl crimson-gradient-bg text-white text-xs font-bold cursor-pointer"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const isVariantOutOfStock = selectedVariant.isOutOfStock || selectedVariant.status === 'Hết hàng';

  const zaloMessage = encodeURIComponent(
    `Xin chào Makoto Decor, tôi muốn tư vấn báo giá sản phẩm "${product.name}" - Quy cách/Kích thước: ${selectedVariant.size}.`
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center space-x-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Menu Sản Phẩm</span>
      </button>

      {/* Product Detail Container */}
      <div className="relative w-full max-w-6xl bg-white dark:bg-[#14141c] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700/80 shadow-2xl transition-colors duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          
          {/* Left Column: Image Slider */}
          <div className="p-6 bg-gray-50 dark:bg-gray-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
            
            {/* Main Image Square Area */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900 dark:bg-gray-950 shadow-inner border border-gray-200 dark:border-gray-800">
              <Swiper
                modules={[Navigation, Thumbs]}
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                navigation={{
                  prevEl: '.detail-prev-btn',
                  nextEl: '.detail-next-btn',
                }}
                onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                className="w-full h-full"
              >
                {images.map((imgUrl, idx) => (
                  <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center bg-gray-900 dark:bg-gray-950">
                    <img
                      src={imgUrl || DEFAULT_FALLBACK_IMAGE}
                      alt={`${product.name} - Ảnh ${idx + 1}`}
                      className="w-full h-full object-contain"
                      onError={(e) => handleImageError(e)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Sleek Custom Navigation Arrows (In-frame, no overflow) */}
              {images.length > 1 && (
                <>
                  <button className="detail-prev-btn absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button className="detail-next-btn absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel Selector */}
            {images.length > 1 && (
              <div className="mt-3">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Thumbs]}
                >
                  {images.map((imgUrl, idx) => (
                    <SwiperSlide key={idx} className="cursor-pointer">
                      <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-red-500 scale-95 shadow-md' : 'border-gray-200 dark:border-gray-800 opacity-60 hover:opacity-100'
                      }`}>
                        <img 
                          src={imgUrl || DEFAULT_FALLBACK_IMAGE} 
                          alt="thumb" 
                          className="w-full h-full object-cover" 
                          onError={(e) => handleImageError(e)}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </div>

          {/* Right Column: Details & Variant selector */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{product.category}</span>
                </span>
                
                {/* Status Badge */}
                {isVariantOutOfStock ? (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Tạm hết hàng</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Hiện hành</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-wide">
                {product.name}
              </h1>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 min-h-[108px] flex flex-col justify-center space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Đơn giá</div>
                <div className={`text-3xl font-extrabold ${isVariantOutOfStock ? 'text-gray-400 line-through' : 'text-red-600 dark:gold-gradient-text'}`}>
                  {formatVND(selectedVariant.price)}
                </div>
              </div>

              {/* Size Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Kích thước:
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => {
                    const isOutOfStock = variant.isOutOfStock || variant.status === 'Hết hàng';
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantIndex(idx)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                          selectedVariantIndex === idx
                            ? isOutOfStock
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border-rose-500 shadow-md'
                              : 'crimson-gradient-bg text-white border-red-500 shadow-lg shadow-red-900/50 scale-102'
                            : isOutOfStock
                              ? 'bg-gray-100 dark:bg-gray-900/60 text-gray-400 border-gray-200 dark:border-gray-800 line-through'
                              : 'bg-gray-100 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700/70 hover:bg-gray-200 dark:hover:bg-gray-700/80'
                        }`}
                      >
                        {variant.size}
                        {isOutOfStock && <span className="ml-1 text-[10px] text-rose-500 font-normal"> - Hết</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300">
                {selectedVariant.material && (
                  <p><strong>Chất liệu:</strong> {selectedVariant.material}</p>
                )}
                <p><strong>Thiết kế riêng:</strong> {selectedVariant.customDesign || 'Có'}</p>
              </div>
            </div>

            {/* CTA: Top = Facebook, Bottom = Zalo */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
              >
                <FacebookIcon />
                <span>{isVariantOutOfStock ? 'Nhắn Tin Facebook Đặt Trước' : 'Tư Vấn Báo Giá Qua Facebook'}</span>
              </a>

              <a
                href={`https://zalo.me/${zaloPhone}?text=${zaloMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 flex items-center justify-center space-x-2 border border-blue-200 dark:border-blue-500/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{isVariantOutOfStock ? 'Nhắn Zalo Đặt Hàng Trước' : 'Tư Vấn Báo Giá Qua Zalo'}</span>
              </a>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
