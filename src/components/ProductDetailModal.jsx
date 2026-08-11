import React, { useState } from 'react';
import { Image } from 'antd';
import { X, CheckCircle, Truck, Palette, MessageCircle, Phone, ShieldCheck, Tag, AlertCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
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

export default function ProductDetailModal({ product, onClose }) {
  if (!product) return null;

  const zaloPhone = import.meta.env.VITE_ZALO_PHONE || '0900000000';
  const facebookLink = import.meta.env.VITE_FACEBOOK_LINK || 'https://m.me/makotodecor';

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [mainSwiper, setMainSwiper] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSelectVariant = (idx) => {
    setSelectedVariantIndex(idx);
    const targetVariant = product.variants[idx];
    if (targetVariant && targetVariant.image) {
      const imgIdx = images.findIndex((img) => img === targetVariant.image);
      if (imgIdx !== -1) {
        setActiveImageIndex(imgIdx);
        if (mainSwiper && !mainSwiper.destroyed) {
          mainSwiper.slideTo(imgIdx);
        }
      }
    }
  };

  const selectedVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const isVariantOutOfStock = selectedVariant.isOutOfStock || selectedVariant.status === 'Hết hàng';

  const zaloMessage = encodeURIComponent(
    `Xin chào Makoto Decor, tôi muốn tư vấn báo giá sản phẩm "${product.name}" - Quy cách/Kích thước: ${selectedVariant.size}.`
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Backdrop overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container with Max Height & Inner Scroll */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#14141c] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700/80 shadow-2xl transition-all duration-300 z-10">
        
        {/* Fixed Close Button - Always visible on mobile & desktop */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 dark:bg-black/70 hover:bg-red-600 dark:hover:bg-red-600 text-gray-700 dark:text-gray-200 hover:text-white flex items-center justify-center transition-all border border-gray-200 dark:border-gray-700 shadow-md cursor-pointer backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto w-full h-full custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:min-h-[615px]">
          
          {/* Left Column: Image Slider */}
          <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-950/60 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800/80">
            
            {/* Antd Image.PreviewGroup from smedia_fe_react */}
            <Image.PreviewGroup
              preview={{
                open: isPreviewOpen,
                onOpenChange: (open) => setIsPreviewOpen(open),
                current: activeImageIndex,
                onChange: (current) => setActiveImageIndex(current),
              }}
            >
              {/* Main Image Square Area */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-900 dark:bg-gray-950 shadow-inner border border-gray-200 dark:border-gray-800">
                
                <Swiper
                  onSwiper={setMainSwiper}
                  modules={[Navigation, Thumbs]}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  navigation={{
                    prevEl: '.modal-prev-btn',
                    nextEl: '.modal-next-btn',
                  }}
                  onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                  className="w-full h-full"
                >
                  {images.map((imgUrl, idx) => (
                    <SwiperSlide key={idx} className="w-full h-full flex items-center justify-center bg-gray-900 dark:bg-gray-950">
                      <Image
                        src={imgUrl || DEFAULT_FALLBACK_IMAGE}
                        alt={`${product.name} - Ảnh ${idx + 1}`}
                        rootClassName="w-full h-full flex items-center justify-center"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        className="w-full h-full object-contain cursor-pointer"
                        onError={(e) => handleImageError(e)}
                        preview={{
                          cover: (
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-white bg-black/50 px-4 py-2 rounded-full backdrop-blur-md shadow-xl border border-white/20">
                              <Eye className="w-4 h-4 text-red-500" />
                              <span>Xem chi tiết</span>
                            </div>
                          ),
                          src: imgUrl || DEFAULT_FALLBACK_IMAGE,
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Sleek Custom Navigation Arrows (Outside Image mask, z-30 stopPropagation) */}
                {images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="modal-prev-btn absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
                      title="Ảnh trước"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => e.stopPropagation()} 
                      className="modal-next-btn absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
                      title="Ảnh tiếp theo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </Image.PreviewGroup>

            {/* Thumbnail Carousel Selector (Removed "Bộ sưu tập" line) */}
            {images.length > 1 && (
              <div className="mt-3">
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={8}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[FreeMode, Thumbs]}
                  className="thumbs-swiper"
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

          {/* Right Column: Product Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-2 min-h-[56px]">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50 flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>{product.category}</span>
                </span>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                  {product.subcategory}
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

              {/* Title */}
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-wide">
                {product.name}
              </h2>

              {/* Price Display */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800/90 min-h-[132px] flex flex-col justify-center space-y-1">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Đơn giá</div>
                <div className={`text-3xl font-extrabold ${isVariantOutOfStock ? 'text-gray-400 line-through' : 'text-red-600 dark:gold-gradient-text'}`}>
                  {formatVND(selectedVariant.price)}
                </div>
                
                {!isVariantOutOfStock && selectedVariant.wholesalePrice > 0 && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Giá sỉ: {formatVND(selectedVariant.wholesalePrice)} áp dụng từ {selectedVariant.minWholesaleQty || 10} sản phẩm</span>
                  </div>
                )}

                {isVariantOutOfStock && (
                  <div className="text-xs text-rose-600 dark:text-rose-400 font-semibold pt-1 flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Phiên bản {selectedVariant.size} hiện đang tạm hết hàng. Quý khách có thể chọn kích thước khác hoặc liên hệ xưởng đặt làm.</span>
                  </div>
                )}
              </div>

              {/* Size & Variant Selector */}
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
                        onClick={() => handleSelectVariant(idx)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border relative ${
                          selectedVariantIndex === idx
                            ? isOutOfStock 
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-200 border-rose-500 shadow-md'
                              : 'crimson-gradient-bg text-white border-red-500 shadow-md shadow-red-900/40 scale-102'
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

              {/* Specifications */}
              <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-800/80 text-xs">
                {selectedVariant.material && (
                  <div className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                    <Palette className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Chất liệu:</strong> {selectedVariant.material}</span>
                  </div>
                )}

                <div className="flex items-start space-x-2 text-gray-700 dark:text-gray-300">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Thiết kế theo yêu cầu:</strong> {selectedVariant.customDesign || 'Có'}</span>
                </div>
              </div>

            </div>

            {/* Call To Action Buttons: Top = Facebook, Bottom = Zalo */}
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
  </div>
  );
}
