import { Router } from 'express'
import { query, pool } from '../config/db.js'
import fetch from 'node-fetch'
import { grantReward } from './rewards.js'
import multer from 'multer'
import cloudinary from 'cloudinary'
import fs from 'fs'
import path from 'path'
// Configure multer
const upload = multer({
  dest: '/tmp/',
  limits: {
  }
})

// Configure Cloudinary

// Helper functions
function extractMetadataFromFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '')
  let title = nameWithoutExt
  let artist = 'Unknown Creator'
  let album = null
  const separators = [' - ', '_-_', '__', ' – ']
  for (const separator of separators) {
    if (nameWithoutExt.includes(separator)) {
      const parts = nameWithoutExt.split(separator)
      if (parts.length >= 2) {
        artist = parts[0].trim()
        title = parts.slice(1).join(separator).trim()
        break
      }
    }
  }
  title = title.replace(/^(official|music|video|audio|song)\s+/i, '')
  title = title.replace(/\s+(official|music|video|audio|song)$/i, '')
  return { title: title || nameWithoutExt, artist, album }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB"
}

function cfHeaders() {
  const token = process.env.CLOUDFLARE_STREAM_TOKEN
  if (!token) throw new Error('CF_TOKEN_MISSING')
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

function cfAccountId() {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID
  if (!id) throw new Error('CF_ACCOUNT_MISSING')
  return id
}

// Request a direct upload URL (no server file handling)
  try {
    const id = cfAccountId()
    const url = `https://api.cloudflare.com/client/v4/accounts/${id}/stream/direct_upload`
    const r = await fetch(url, { method: 'POST', headers: cfHeaders(), body: JSON.stringify({}) })
    if (!r.ok) return res.status(500).json({ ok: false, error: 'CF_DIRECT_UPLOAD_FAILED' })
    const data = await r.json()
    const upload_url = data?.result?.uploadURL
    const stream_uid = data?.result?.uid
    if (!upload_url || !stream_uid) return res.status(500).json({ ok: false, error: 'CF_RESPONSE_INVALID' })

    try {
      await query(
      )
    } catch (_) {}

    res.json({ ok: true, upload_url, stream_uid })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'UPLOAD_REQUEST_ERROR' })
  }
})

// Cloudflare webhook: processing/ready/failed
export async function webhookCloudflare(req, res) {
  try {
    const secret = process.env.CF_STREAM_WEBHOOK_SECRET
    if (secret) {
      const hdr = req.headers['x-webhook-token'] || req.headers['x-cf-webhook-token']
      if (hdr !== secret) return res.status(403).json({ ok: false })
    }
    const body = req.body || {}
    const uid = body?.uid || body?.video?.uid
    const status = body?.status || body?.video?.status?.state
    const duration = Math.floor(body?.duration || body?.video?.duration || 0)
    const size = Math.floor(body?.size || body?.video?.size || 0)
    const playback_url = body?.playback?.hls || body?.video?.playback?.hls || null

    if (!uid) return res.status(400).json({ ok: false, error: 'MISSING_UID' })

    let newStatus = 'processing'
    if (status === 'ready' || status === 'success') newStatus = 'ready'
    else if (status === 'inprogress' || status === 'queued') newStatus = 'processing'
    else if (status === 'error' || status === 'failed') newStatus = 'failed'

    try {
      await query(
        `UPDATE farragna_videos SET status=$2, playback_url=COALESCE($3, playback_url), duration=COALESCE($4, duration), size=COALESCE($5, size)
         WHERE stream_uid=$1`,
        [uid, newStatus, playback_url, duration || null, size || null]
      )
    } catch (_) {}
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ ok: false })
  }
}

router.post('/webhook/cloudflare', webhookCloudflare)

// View video (only ready). Count unique view and reward owner once.
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const id = req.params.id
    const vres = await client.query('SELECT id, owner_id, status, playback_url FROM farragna_videos WHERE id=$1', [id])
    const v = vres.rows[0]
    if (!v || v.status !== 'ready') {
      await client.query('ROLLBACK')
      return res.status(404).json({ ok: false, error: 'NOT_READY' })
    }
      await client.query('UPDATE farragna_videos SET views_count=views_count+1, rewards_earned=rewards_earned+1 WHERE id=$1', [id])
    }
    await client.query('COMMIT')

    if (!exists.rowCount) {
      try { await grantReward({ userId: v.owner_id, amount: 1, source: 'watch', meta: { video_id: id } }) } catch (_) {}
    }

    res.json({ ok: true, id: v.id, playback_url: v.playback_url, status: v.status })
  } catch (e) {
    try { await pool.query('ROLLBACK') } catch (_) {}
    res.status(500).json({ ok: false, error: 'VIEW_ERROR' })
  } finally {
  }
})

// Feed: only ready videos, paginated
router.get('/feed', async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const pageSize = Math.min(parseInt(req.query.page_size, 10) || 20, 100)
  const offset = (page - 1) * pageSize
  try {
    const r = await query(
      `SELECT id, owner_id, playback_url, views_count, rewards_earned, created_at
       FROM farragna_videos
       WHERE status='ready'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    )
    res.json({ ok: true, videos: r.rows })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'FEED_ERROR' })
  }
})

// Trending v1
router.get('/trending', async (_req, res) => {
  try {
    const r = await query(
      `SELECT id, owner_id, playback_url, views_count, rewards_earned, created_at
       FROM farragna_videos
       WHERE status='ready'
       ORDER BY created_at DESC
       LIMIT 500`,
      []
    )
    const now = Date.now()
    const scored = r.rows.map(v => {
      const ageMs = now - new Date(v.created_at).getTime()
      let freshness = 0
      if (ageMs < 24 * 60 * 60 * 1000) freshness = 50
      else if (ageMs < 72 * 60 * 60 * 1000) freshness = 20
      const score = (v.views_count * 1.5) + (v.rewards_earned * 3) + freshness
      return { ...v, score }
    })
    scored.sort((a, b) => b.score - a.score)
    res.json({ ok: true, videos: scored })
  } catch (e) {
    res.status(500).json({ ok: false, error: 'TRENDING_ERROR' })
  }
})

  try {
    const files = req.files
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded', message: 'Please select video files to upload' })
    }
    console.log(`📤 Starting bulk upload for ${files.length} Farragna files`)
    const uploadResults = []
    const errors = []
    let successCount = 0
    let failCount = 0
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileIndex = i + 1
      try {
        console.log(`📤 Processing file ${fileIndex}/${files.length}: ${file.originalname}`)
        if (!file.mimetype.startsWith('video/')) {
          errors.push({ file: file.originalname, error: 'Invalid file type', message: 'Only video files are allowed' })
          failCount++
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
          continue
        }
        if (file.size > maxSize) {
          errors.push({ file: file.originalname, error: 'File too large', message: `Maximum file size is ${Math.round(maxSize / (1024 * 1024))}MB` })
          failCount++
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
          continue
        }
        const metadata = extractMetadataFromFilename(file.originalname)
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substr(2, 9)
        const publicId = `farragna/video_${timestamp}_${randomId}`
        try {
          const result = await cloudinary.v2.uploader.upload(file.path, {
            resource_type: 'video',
            folder: 'farragna',
            public_id: publicId,
            format: 'mp4',
            quality: 'auto',
            context: {
              title: metadata.title,
              creator: metadata.artist || 'Unknown Creator',
              uploaded_by: 'admin',
              upload_date: new Date().toISOString()
            }
          })
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
          const uploadResult = {
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
            metadata: { title: metadata.title, creator: metadata.artist || 'Unknown Creator' },
            uploaded_at: new Date().toISOString()
          }
          uploadResults.push(uploadResult)
          successCount++
          console.log(`✅ Successfully uploaded: ${file.originalname} (${formatFileSize(result.bytes)})`)
        } catch (uploadError) {
          console.error(`❌ Cloudinary upload failed for ${file.originalname}:`, uploadError.message)
          try {
            const localPath = path.join(process.cwd(), 'services/codebank/farragna/uploads')
            if (!fs.existsSync(localPath)) fs.mkdirSync(localPath, { recursive: true })
            const localFileName = `local_${timestamp}_${file.originalname}`
            const localFilePath = path.join(localPath, localFileName)
            fs.moveSync(file.path, localFilePath)
            const uploadResult = {
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
              metadata: { title: metadata.title, creator: metadata.artist || 'Unknown Creator' },
              message: 'Uploaded locally - Cloudinary temporarily unavailable',
              uploaded_at: new Date().toISOString()
            }
            uploadResults.push(uploadResult)
            successCount++
            console.log(`⚠️ Uploaded locally: ${file.originalname}`)
          } catch (localError) {
            console.error(`❌ Local storage failed for ${file.originalname}:`, localError.message)
            errors.push({ file: file.originalname, error: 'Upload failed', message: 'Both Cloudinary and local storage failed' })
            failCount++
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
          }
        }
      } catch (fileError) {
        console.error(`❌ Error processing ${file.originalname}:`, fileError.message)
        errors.push({ file: file.originalname, error: 'Processing failed', message: fileError.message })
        failCount++
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
      }
    }
    const response = {
      total_files: files.length,
      successful_uploads: successCount,
      failed_uploads: failCount,
      results: uploadResults,
      errors: errors,
      summary: `${successCount} files uploaded successfully, ${failCount} failed`
    }
    console.log(`📊 Bulk upload completed: ${successCount}/${files.length} files successful`)
    if (successCount > 0) console.log('🎥 New videos are now available in the gallery')
    res.json(response)
  } catch (error) {
    console.error('❌ Bulk upload error:', error)
    res.status(500).json({
      error: 'Bulk upload service error',
      message: error.message,
      total_files: 0,
      successful_uploads: 0,
      failed_uploads: 0,
      results: [],
      errors: [{ error: 'Server error', message: error.message }]
    })
  }
})

// Admin videos
router.all('/admin/videos', async (req, res) => {
  try {
    const { default: adminVideosHandler } = await import('../../api/admin/videos.js')
    await adminVideosHandler(req, res)
  } catch (error) {
    console.error('Admin videos API error:', error)
    res.status(500).json({ error: 'Admin API processing failed' })
  }
})

// Admin views
router.all('/admin/views', async (req, res) => {
  try {
    const { default: adminViewsHandler } = await import('../../api/admin/views.js')
    await adminViewsHandler(req, res)
  } catch (error) {
    console.error('Admin views API error:', error)
    res.status(500).json({ error: 'Admin API processing failed' })
  }
})

export default router
