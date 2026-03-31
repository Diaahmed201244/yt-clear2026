/**
 * config/multer.js
 *
 * Multer upload middleware configured for disk storage.
 * Files land in UPLOAD_DIR (defaults to /tmp) and are validated/moved
 * by individual route handlers.
 */

import multer from 'multer';
import { UPLOAD_DIR } from './index.js';

const upload = multer({
  dest: UPLOAD_DIR,
  limits: {
    fileSize: 200 * 1024 * 1024,   // 200 MB per file (high-quality audio support)
    files: 2000,                     // Maximum 2000 files per request
    fieldSize: 200 * 1024 * 1024,   // 200 MB field size
    fields: 10,                      // Allow multiple form fields
  },
  fileFilter: (_req, _file, cb) => {
    // Accept any file type — route handlers perform specific validation
    cb(null, true);
  },
});

export default upload;
