/**
 * Utility to optimize Cloudinary image URLs with dynamic transformation parameters.
 * Inserts format (f_auto), quality (q_auto), width, height, and cropping parameters.
 *
 * @param {string} url - Original image URL
 * @param {object} options - { width, height, crop = 'fill', quality = 'auto', format = 'auto' }
 * @returns {string} - Transformed URL or original URL
 */
export function getOptimizedCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== 'string') return url || '';

  // Only transform Cloudinary URLs
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) {
    return url;
  }

  // Prevent double transformation if URL already has transformation flags
  if (url.includes('/upload/f_auto') || url.includes('/upload/q_auto') || url.includes('/upload/w_')) {
    return url;
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  const transforms = [];

  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  if (transforms.length === 0) return url;

  const transformString = transforms.join(',');
  return url.replace('/upload/', `/upload/${transformString}/`);
}
