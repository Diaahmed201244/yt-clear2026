/**
 * config/cloudinary.js
 *
 * Configures and exports the Cloudinary v2 SDK instance.
 *
 * BUG FIX: All hardcoded fallback credentials have been removed.
 * Credentials MUST be provided via environment variables:
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 */

import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.warn(
    '⚠️  [CLOUDINARY] One or more Cloudinary credentials are missing. ' +
    'File uploads to Cloudinary will fail until CLOUDINARY_CLOUD_NAME, ' +
    'CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.'
  );
}

export default cloudinary.v2;
