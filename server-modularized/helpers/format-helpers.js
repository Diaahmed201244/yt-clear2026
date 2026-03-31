/**
 * helpers/format-helpers.js
 *
 * Pure formatting / display utility functions used across the application.
 * No side-effects, no database access — just data transformation.
 */

// ---------------------------------------------------------------------------
// File size formatting
// ---------------------------------------------------------------------------

/**
 * Format a byte count into a human-readable string (B / KB / MB / GB).
 *
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ---------------------------------------------------------------------------
// Metadata extraction from filenames
// ---------------------------------------------------------------------------

/**
 * Extract artist / title / album metadata from a filename.
 *
 * Tries common separator patterns ("Artist - Title", "Artist_-_Title", etc.).
 * Falls back to the full filename (minus extension) as the title.
 *
 * @param {string} filename
 * @returns {{ title: string, artist: string, album: string|null }}
 */
export function extractMetadataFromFilename(filename) {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  let title = nameWithoutExt;
  let artist = 'Unknown Artist';
  let album = null;

  // Try to split on common separators
  const separators = [' - ', '_-_', '__', ' – '];

  for (const separator of separators) {
    if (nameWithoutExt.includes(separator)) {
      const parts = nameWithoutExt.split(separator);
      if (parts.length >= 2) {
        artist = parts[0].trim();
        title = parts.slice(1).join(separator).trim();
        break;
      }
    }
  }

  // Clean up common noise words at the start or end
  title = title.replace(/^(official|music|video|audio|song)\s+/i, '');
  title = title.replace(/\s+(official|music|video|audio|song)$/i, '');

  return {
    title: title || nameWithoutExt,
    artist,
    album,
  };
}
