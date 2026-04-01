/**
 * routes/farragna.routes.js
 *
 * Express router for Farragna (video gallery) endpoints.
 *
 * Active endpoints:
 *   POST /upload   — Bulk video upload to Cloudinary (with local-storage fallback)
 *
 * Stub endpoints (legacy / unused — always return 404):
 *   POST /webhook  — Cloudinary notification webhook (not implemented)
 *
 * Mount at /api/farragna in app.js, e.g.:
 *   app.use('/api/farragna', farragnaRouter);
 *
 * BUG FIXES applied:
 *   - Replaced `cloudinary.v2.uploader` with `cloudinary.uploader` (the
 *     default export from config/cloudinary.js already exposes the v2 API).
 *   - Replaced `__dirname` (unavailable in ES modules) with `process.cwd()`
 *     for the local fallback upload directory path.
 */

import { Router } from 'express';
import path from 'path';
import fs from 'fs-extra';
import cloudinary from '../config/cloudinary.js';
import upload from '../config/multer.js';

const router = Router();

// ---------------------------------------------------------------------------
// Internal helper: extract title / creator from a video filename
// ---------------------------------------------------------------------------

function extractMetadataFromFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  let title = nameWithoutExt;
  let artist = 'Unknown Creator';

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
// POST /upload — bulk video upload to Cloudinary with local-storage fallback
// ---------------------------------------------------------------------------

router.post('/upload', upload.any(), async (req, res) => {
  try {   
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select video files to upload',
      });
    }

    console.log(`📤 Starting bulk upload for ${files.length} Farragna files`);

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
        if (!file.mimetype.startsWith('video/')) {
          errors.push({
            file: file.originalname,
            error: 'Invalid file type',
            message: 'Only video files are allowed',
          });
          failCount++;
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
          continue;
        }

        // Validate file size (500 MB limit for videos)
        const maxSize = 500 * 1024 * 1024;
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
        const publicId = `farragna/video_${timestamp}_${randomId}`;

        try {   
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'farragna',
            public_id: publicId,
            format: 'mp4',
            quality: 'auto',
            context: {
              title: metadata.title,
              creator: metadata.artist || 'Unknown Creator',
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
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
            size: formatFileSize(result.bytes),
            metadata: {
              title: metadata.title,
              creator: metadata.artist || 'Unknown Creator',
            },
            uploaded_at: new Date().toISOString(),
          });
          successCount++;
          console.log(`✅ Successfully uploaded: ${file.originalname} (${formatFileSize(result.bytes)})`);

        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.originalname}:`, uploadError.message);

          // Fallback: save to local filesystem
          try {   
            const localDir = path.join(process.cwd(), 'services/codebank/farragna/uploads');
            if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });

            const localFileName = `local_${timestamp}_${file.originalname}`;
            const localFilePath = path.join(localDir, localFileName);
            fs.moveSync(file.path, localFilePath);

            uploadResults.push({
              success: true,
              file: file.originalname,
              url: `/services/codebank/farragna/uploads/${localFileName}`,
              public_id: `local_${timestamp}`,
              duration: 0,
              width: 0,
              height: 0,
              format: 'mp4',
              bytes: file.size,
              size: formatFileSize(file.size),
              offline_mode: true,
              metadata: {
                title: metadata.title,
                creator: metadata.artist || 'Unknown Creator',
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
    if (successCount > 0) console.log('🎥 New videos are now available in the gallery');

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
// Legacy / stub endpoints — unused, preserved as 404 stubs
// ---------------------------------------------------------------------------

// Cloudinary webhook — not implemented
router.post('/webhook', (_req, res) => res.status(404).end());

export default router;
