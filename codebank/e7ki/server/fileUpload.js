import crypto from "crypto";

const files = new Map();

function now() {
  return Date.now();
}

function scheduleDeletion(id, ttlMs) {
  setTimeout(() => {
    const meta = files.get(id);
    if (!meta) return;
    if (meta.expiresAt <= now()) {
      files.delete(id);
    }
  }, ttlMs + 1000);
}

export function storeFile(buffer, mimeType, filename, ttlMs = 5 * 60 * 1000) {
  const id = crypto.randomUUID();
  const expiresAt = now() + ttlMs;
  files.set(id, { buffer, mimeType, filename, expiresAt });
  scheduleDeletion(id, ttlMs);
  return { id, url: `/api/file/${id}`, expiresAt };
}

export function getFile(id) {
  const meta = files.get(id);
  if (!meta) return null;
  if (meta.expiresAt <= now()) {
    files.delete(id);
    return null;
  }
  return meta;
}

export function registerFileRoutes(app) {
  app.post("/api/upload", async (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      let buffer;
      let mimeType;
      let filename;

      if (contentType.startsWith("application/json")) {
        const { data, mimeType: m, filename: f, ttlMs } = req.body || {};
        if (!data || !m) {
          return res.status(400).json({ error: "Missing data or mimeType" });
        }
        buffer = Buffer.from(data, "base64");
        mimeType = m;
        filename = f || "upload";
        const result = storeFile(buffer, mimeType, filename, typeof ttlMs === "number" ? ttlMs : undefined);
        return res.json({ success: true, ...result });
      }

      // Raw binary upload
      buffer = Buffer.from(req.rawBody || []);
      if (!buffer.length) {
        return res.status(400).json({ error: "Empty body" });
      }
      mimeType = contentType || "application/octet-stream";
      filename = (req.query.filename && String(req.query.filename)) || "upload";
      const ttlMs = req.query.ttlMs ? Number(req.query.ttlMs) : undefined;
      const result = storeFile(buffer, mimeType, filename, ttlMs);
      return res.json({ success: true, ...result });
    } catch (error) {
      return res.status(500).json({ error: "Upload failed" });
    }
  });

  app.get("/api/file/:id", async (req, res) => {
    const id = req.params.id;
    const meta = getFile(id);
    if (!meta) return res.status(404).json({ error: "Not found or expired" });
    res.setHeader("Content-Type", meta.mimeType);
    res.setHeader("Cache-Control", "no-store");
    return res.send(meta.buffer);
  });
}