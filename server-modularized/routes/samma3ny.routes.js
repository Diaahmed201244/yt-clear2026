/**
 * routes/samma3ny.routes.js
 *
 * Express router for Samma3ny (audio / music player) endpoints.
 *
 * Active endpoints:
 *   GET  /list         — List audio resources in samma3ny/ folder via direct Cloudinary API call
 *   GET  /songs        — Get songs via legacy middleware handler
 *   POST /upload       — Bulk audio upload to Cloudinary (with local-storage fallback)
 *   POST /rename-bulk  — Bulk rename songs via Cloudinary context update
 *
 * Stub endpoints (legacy / unused — always return 404):
 *   GET  /upload-status
 *   POST /refresh-playlist
 *   POST /order
 *   POST /rename
 *   POST /songs
 *
 * Mount at /api/samma3ny in app.js, e.g.:
 *   app.use('/api/samma3ny', samma3nyRouter);
 *
 * BUG FIXES applied:
 *   - Removed hardcoded Cloudinary credential fallbacks from /list endpoint.
 *     Credentials MUST be set via CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 *     and CLOUDINARY_API_SECRET environment variables.
 *   - Replaced `cloudinary.v2.*` with the pre-configured default export from
 *     config/cloudinary.js (which already exposes the v2 API surface).
 *   - Replaced `__dirname` (unavailable in ES modules) with `process.cwd()`
 *     for resolving the local fallback upload directory.
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs-extra';
import cloudinary from '../config/cloudinary.js';
import upload from '../config/multer.js';
import { handleSamma3nySongs } from '../api/samma3ny/middleware.js';

const router = Router();

// ---------------------------------------------------------------------------
// Internal helper: extract title / artist from an audio filename
// ---------------------------------------------------------------------------

function extractMetadataFromFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  let title = nameWithoutExt;
  let artist = 'Unknown Artist';

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

  // Strip common noise words from the title
  title = title.replace(/^(official|music|video|audio|song)\s+/i, '');
  title = title.replace(/\s+(official|music|video|audio|song)$/i, '');

  return { title: title || nameWithoutExt, artist, album: null };
}

// ---------------------------------------------------------------------------
// Internal helper: human-readable file size
// ---------------------------------------------------------------------------

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

// ---------------------------------------------------------------------------
// GET /list — list audio resources in samma3ny/ via direct Cloudinary REST API
// BUG FIX: removed hardcoded credential fallbacks; use env vars only.
// ---------------------------------------------------------------------------

router.get('/list', async (req, res) => {
  try {   
    console.log('🔄 Fetching Samma3ny songs with direct Cloudinary API call...');

    const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/resources/video?prefix=samma3ny/&type=upload&max_results=500`;
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64');

    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      throw new Error(`Cloudinary API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.resources || [];

    console.log(`✅ Direct fetch: Found ${files.length} resources in samma3ny/ folder`);
    res.json({ ok: true, files });
  } catch (error) {
    console.error('❌ Direct Cloudinary fetch error:', error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

// ---------------------------------------------------------------------------
// GET /songs — delegated to the legacy middleware handler
// ---------------------------------------------------------------------------

router.get('/songs', handleSamma3nySongs);

// ---------------------------------------------------------------------------
// POST /upload — bulk audio upload to Cloudinary with local-storage fallback
// BUG FIX: replaced cloudinary.v2.uploader with cloudinary.uploader (v2
//          surface is already the default export from config/cloudinary.js).
//          Replaced __dirname with process.cwd() for local fallback path.
// ---------------------------------------------------------------------------

router.post('/upload', upload.any(), async (req, res) => {
  try {   
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select audio files to upload',
      });
    }

    console.log(`📤 Starting bulk upload for ${files.length} Samma3ny files`);

    const uploadResults = [];
    const errors = [];
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileIndex = i + 1;

      try {   
        console.log(`📤 Processing file ${fileIndex}/${files.length}: ${file.originalname}`);

        // Validate MIME type
        if (!file.mimetype.startsWith('audio/')) {
          errors.push({
            file: file.originalname,
            error: 'Invalid file type',
            message: 'Only audio files are allowed',
          });
          failCount++;
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          continue;
        }

        // Validate file size (100 MB limit)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
          errors.push({
            file: file.originalname,
            error: 'File too large',
            message: `Maximum file size is ${Math.round(maxSize / (1024 * 1024))}MB`,
          });
          failCount++;
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          continue;
        }

        const metadata = extractMetadataFromFilename(file.originalname);
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const publicId = `media-player/audio_${timestamp}_${randomId}`;

        try {   
          // Upload to Cloudinary (resource_type 'video' is required for audio files)
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'media-player',
            public_id: publicId,
            format: 'mp3',
            quality: 'auto',
            context: {
              title: metadata.title,
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Samma3ny Collection',
              uploaded_by: 'admin',
              upload_date: new Date().toISOString(),
            },
          });

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

          uploadResults.push({
            success: true,
            file: file.originalname,
            url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration || 0,
            format: result.format,
            bytes: result.bytes,
            size: formatFileSize(result.bytes),
            metadata: {
              title: metadata.title,
              artist: metadata.artist || 'Unknown Artist',
              album: metadata.album || 'Samma3ny Collection',
            },
            uploaded_at: new Date().toISOString(),
          });
          successCount++;
          console.log(`✅ Successfully uploaded: ${file.originalname} (${formatFileSize(result.bytes)})`);

        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.originalname}:`, uploadError.message);

          // Fallback: save to local filesystem
          try {   
            const localDir = path.join(process.cwd(), 'services/codebank/samma3ny/uploads');
            if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

            const localFileName = `local_${timestamp}_${file.originalname}`;
            const localFilePath = path.join(localDir, localFileName);
            fs.moveSync(file.path, localFilePath);

            uploadResults.push({
              success: true,
              file: file.originalname,
              url: `/services/codebank/samma3ny/uploads/${localFileName}`,
              public_id: `local_${timestamp}`,
              duration: 0,
              format: 'mp3',
              bytes: file.size,
              size: formatFileSize(file.size),
              offline_mode: true,
              metadata: {
                title: metadata.title,
                artist: metadata.artist || 'Unknown Artist',
                album: metadata.album || 'Samma3ny Collection',
              },
              message: 'Uploaded locally - Cloudinary temporarily unavailable',
              uploaded_at: new Date().toISOString(),
            });
            successCount++;
            console.log(`⚠️ Uploaded locally: ${file.originalname}`);

          } catch (localError) {
            console.error(`❌ Local storage failed for ${file.originalname}:`, localError.message);
            errors.push({
              file: file.originalname,
              error: 'Upload failed',
              message: 'Both Cloudinary and local storage failed',
            });
            failCount++;
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          }
        }

      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError.message);
        errors.push({ file: file.originalname, error: 'Processing failed', message: fileError.message });
        failCount++;
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }
    }

    console.log(`📊 Bulk upload completed: ${successCount}/${files.length} files successful`);
    if (successCount > 0) console.log('🎵 New songs are now available in the playlist');

    res.json({
      total_files: files.length,
      successful_uploads: successCount,
      failed_uploads: failCount,
      results: uploadResults,
      errors,
      summary: `${successCount} files uploaded successfully, ${failCount} failed`,
    });

  } catch (error) {
    console.error('❌ Bulk upload error:', error);
    res.status(500).json({
      error: 'Bulk upload service error',
      message: error.message,
      total_files: 0,
      successful_uploads: 0,
      failed_uploads: 0,
      results: [],
      errors: [{ error: 'Server error', message: error.message }],
    });
  }
});

// ---------------------------------------------------------------------------
// POST /rename-bulk — update display name / title for multiple Cloudinary assets
// BUG FIX: replaced cloudinary.v2.api with cloudinary.api.
// ---------------------------------------------------------------------------

router.post('/rename-bulk', async (req, res) => {
  try {   
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const name = (req.body?.name || '').trim();
    if (ids.length === 0 || !name) {
      return res.status(400).json({ ok: false, error: 'INVALID_INPUT' });
    }

    let updated = 0;
    for (const id of ids) {
      try {   
        await cloudinary.api.update(id, { context: { title: name, display_name: name } });
        updated++;
      } catch (_) { /* ignore per-item errors */ }
    }
    res.json({ ok: true, updated });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---------------------------------------------------------------------------
// Legacy / stub endpoints — unused, preserved as 404 stubs
// ---------------------------------------------------------------------------

router.get('/upload-status', (_req, res) => res.status(404).end());
router.post('/refresh-playlist', (_req, res) => res.status(404).end());
router.post('/order', (_req, res) => res.status(404).end());
router.post('/rename', (_req, res) => res.status(404).end());
router.post('/songs', (_req, res) => res.status(404).end());

export default router;
