import React from 'react';
import { Layers, Tag, AlertCircle, Eye } from 'lucide-react';
import { formatVND } from '../utils/productTransformer';
import { handleImageError, DEFAULT_FALLBACK_IMAGE } from '../utils/imageFallback';
import { getOptimizedCloudinaryUrl } from '../utils/cloudinary';

export default function ProductCard({ product, onSelectProduct }) {
  const variantCount = product.variants ? product.variants.length : 1;

  const displayPrice = product.minPrice === product.maxPrice
    ? formatVND(product.minPrice)
    : `${formatVND(product.minPrice)} - ${formatVND(product.maxPrice)}`;

  const isOutOfStock = product.isFullyOutOfStock;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      title={`Xem chi tiết ${product.name}`}
      className={`group rounded-2xl overflow-hidden cursor-pointer card-hover-effect flex flex-col h-full border transition-all duration-300 ${
        isOutOfStock 
          ? 'bg-gray-100 dark:bg-gray-900/60 border-gray-200 dark:border-gray-800/60 opacity-80' 
          : 'bg-white dark:bg-[#161622] border-gray-200/90 dark:border-gray-800/80 hover:border-red-500/50 shadow-sm dark:shadow-xl'
      }`}
    >
      {/* Clean Product Image */}
      <div className="relative aspect-4/3 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        <img
          src={getOptimizedCloudinaryUrl(product.thumbnail, { width: 500, height: 375, crop: 'fill' }) || DEFAULT_FALLBACK_IMAGE}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isOutOfStock ? 'grayscale-30 opacity-75' : 'group-hover:scale-105'
          }`}
          loading="lazy"
          onError={(e) => handleImageError(e)}
        />

        {/* Hover "Xem chi tiết" Badge Overlay */}
        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20 pointer-events-none">
          <span className="px-4 py-2 rounded-full bg-white/95 dark:bg-black/90 text-gray-900 dark:text-white text-xs font-bold shadow-2xl backdrop-blur-md transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex items-center space-x-1.5 border border-white/40 dark:border-gray-700">
            <Eye className="w-4 h-4 text-red-500" />
            <span>Xem chi tiết</span>
          </span>
        </div>

        {/* Only show Out of Stock Badge on Image if item is out of stock */}
        {isOutOfStock && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-500 text-white shadow-md flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>Hết hàng</span>
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
        <div>
          {/* Subcategory & Variant Count Tags Row */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
              <Tag className="w-3 h-3 text-red-500" />
              <span>{product.subcategory || product.category}</span>
            </span>

            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50 shadow-xs">
              <Layers className="w-3 h-3 text-rose-500" />
              <span>{variantCount} kích thước</span>
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Material */}
          {product.material && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-1 italic">
              Chất liệu: {product.material}
            </p>
          )}
        </div>

        {/* Price Section */}
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 block font-medium">Khoảng giá niêm yết</span>
            <span className={`text-base font-extrabold ${isOutOfStock ? 'text-gray-400' : 'text-red-600 dark:gold-gradient-text'}`}>
              {displayPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
