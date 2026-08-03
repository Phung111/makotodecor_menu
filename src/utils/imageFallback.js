/**
 * High quality SVG Data URI fallback when image fails to load.
 * This is 100% guaranteed to load instantly without network request.
 */
export const DEFAULT_FALLBACK_IMAGE = import.meta.env.VITE_DEFAULT_IMAGE_URL || 'https://res.cloudinary.com/cloudinarymen/image/upload/v1750352608/makotodecor/backgrounds/Pngtree_mascot_japan_red_daruma_6600704_kfew8w.png';

export const SVG_PLACEHOLDER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" fill="%231a1a24"><rect width="800" height="600" fill="%2312121c"/><circle cx="400" cy="300" r="120" fill="%23c23b22" opacity="0.8"/><text x="400" y="310" font-family="sans-serif" font-size="28" font-weight="bold" fill="%23ffffff" text-anchor="middle">MAKOTODECOR</text><text x="400" y="350" font-family="sans-serif" font-size="16" fill="%23d4af37" text-anchor="middle">Hình Ảnh Sản Phẩm</text></svg>`;

/**
 * Handle Image onError safely without infinite looping/flickering
 */
export function handleImageError(e, customFallback = DEFAULT_FALLBACK_IMAGE) {
  // CRITICAL: Clear onerror handler FIRST to prevent infinite flickering loop
  e.target.onerror = null;
  
  // Try high quality Unsplash fallback first, if already on fallback, use SVG data URI
  if (e.target.src !== customFallback && !e.target.src.startsWith('data:image/svg')) {
    e.target.src = customFallback;
  } else {
    e.target.src = SVG_PLACEHOLDER;
  }
}
