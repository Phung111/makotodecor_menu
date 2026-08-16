/**
 * Transform raw Google Sheet rows into grouped Product entities
 * Grouping logic: Rows with identical `Ten_San_Pham` (or `Ma_SP_Chinh`) are merged into 1 Product entity.
 * Variants (sizes, prices, custom attributes, status) are accumulated under `variants`.
 * Images (split from `Danh_Sach_Anh` by comma) are accumulated under `images`.
 */
export function groupProductsByName(rows = []) {
  const groupedMap = new Map();

  rows.forEach((row, index) => {
    const rawName = row.Ten_San_Pham || row.ten_san_pham || row.name || '';
    if (!rawName.trim()) return;

    const normalizedKey = rawName.trim().toLowerCase();

    // Parse image list (5+ images separated by comma or newline)
    const rawGalleryStr = row.Danh_Sach_Anh || row.danh_sach_anh || row.gallery || '';
    let galleryImages = rawGalleryStr
      ? rawGalleryStr.split(/[\n,]+/).map(url => url.trim()).filter(Boolean)
      : [];

    const thumbImage = row.Anh_Dai_Dien || row.anh_dai_dien || galleryImages[0] || 'https://via.placeholder.com/600x400?text=Makoto+Decor';
    
    if (!galleryImages.includes(thumbImage) && thumbImage) {
      galleryImages.unshift(thumbImage);
    }

    const price = Number(row.Gia_Niem_Yet || row.gia_niem_yet || row.price || 0);
    const wholesalePrice = Number(row.Gia_Si || row.gia_si || 0);
    const rawStatus = (row.Trang_Thai || row.trang_thai || 'Hiện hành').toString().trim();
    const isOutOfStock = rawStatus.toLowerCase().includes('hết') || rawStatus.toLowerCase().includes('het');
    const rawBanner = (row.Banner || row.banner || row.Banner_Tag || '').toString().trim();

    const noteText = (row.Ghi_Chu || row.ghi_chu || row['Ghi chú'] || row.Ghi_chu || '').toString().trim();

    const variantItem = {
      id: row.Ma_SP || `VAR-${index}`,
      size: row.Phien_Ban_Kich_Thuoc || 'Tiêu chuẩn',
      price: price,
      wholesalePrice: wholesalePrice,
      minWholesaleQty: row.SL_Si_Tu || '',
      status: isOutOfStock ? 'Hết hàng' : 'Hiện hành',
      isOutOfStock: isOutOfStock,
      note: noteText,
      material: row.Chat_Lieu || '',
      customDesign: row.Thiet_Ke_Rieng || 'Có',
      shippingFee: row.Phi_Ship || 'Liên hệ',
      image: thumbImage,
      images: galleryImages
    };

    if (!groupedMap.has(normalizedKey)) {
      groupedMap.set(normalizedKey, {
        id: `PROD-${index + 1}`,
        name: rawName,
        category: row.Nhom_Vat_Lieu || 'Trang trí',
        subcategory: row.Nhom_San_Pham || 'Mỹ thuật',
        banner: rawBanner,
        thumbnail: thumbImage,
        images: galleryImages,
        material: row.Chat_Lieu || '',
        customDesign: row.Thiet_Ke_Rieng || 'Có',
        shippingFee: row.Phi_Ship || 'Liên hệ',
        note: noteText,
        variants: [variantItem],
        minPrice: price,
        maxPrice: price
      });
    } else {
      const existingProduct = groupedMap.get(normalizedKey);
      if (!existingProduct.banner && rawBanner) {
        existingProduct.banner = rawBanner;
      }
      
      // If row.Anh_Dai_Dien and galleryImages are both empty, reuse primary product thumbnail
      if (!row.Anh_Dai_Dien && galleryImages.length === 0 && existingProduct.thumbnail) {
        variantItem.image = existingProduct.thumbnail;
      }

      // Add variant
      existingProduct.variants.push(variantItem);

      // Update min/max prices
      if (price > 0) {
        if (existingProduct.minPrice === 0 || price < existingProduct.minPrice) {
          existingProduct.minPrice = price;
        }
        if (price > existingProduct.maxPrice) {
          existingProduct.maxPrice = price;
        }
      }

      // Combine unique gallery images
      galleryImages.forEach(imgUrl => {
        if (!existingProduct.images.includes(imgUrl)) {
          existingProduct.images.push(imgUrl);
        }
      });
    }
  });

  // Post-process to calculate overall product status (all variants out of stock -> Hết hàng)
  const products = Array.from(groupedMap.values()).map(product => {
    const allOutOfStock = product.variants.every(v => v.isOutOfStock);
    const hasAvailableVariant = product.variants.some(v => !v.isOutOfStock);

    return {
      ...product,
      isFullyOutOfStock: allOutOfStock,
      status: allOutOfStock ? 'Hết hàng' : (hasAvailableVariant ? 'Hiện hành' : 'Hiện hành')
    };
  });

  return products;
}

/**
 * Format currency in VND (e.g. 180000 -> 180.000 đ)
 */
export function formatVND(amount) {
  if (!amount || isNaN(amount)) return 'Liên hệ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}
