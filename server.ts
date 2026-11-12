import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve file statis dan upload dengan dukungan Byte-Range streaming (video)
app.use(express.static(PUBLIC_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

// Konfigurasi Multer untuk streaming file langsung ke disk
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // Maksimal 500MB
});

const DATA_FILE = path.join(DATA_DIR, 'signage-config.json');

app.get('/api/signage', (_req, res) => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
      return res.json({ success: true, data });
    }
    return res.json({ success: true, data: null });
  } catch (error) {
    console.error('Error reading signage data:', error);
    return res.status(500).json({ success: false, error: 'Failed to read data' });
  }
});

app.post('/api/signage', (req, res) => {
  try {
    const payload = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Configuration saved successfully' });
  } catch (error) {
    console.error('Error saving signage data:', error);
    return res.status(500).json({ success: false, error: 'Failed to save data' });
  }
});

// Endpoint upload multipart streaming
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ success: false, error: err.message || 'Upload failed' });
    }

    try {
      if (req.file) {
        const publicUrl = `/uploads/${req.file.filename}`;
        let fileType = 'image';
        if (req.file.mimetype.startsWith('video/')) fileType = 'video';
        else if (req.file.mimetype.startsWith('audio/')) fileType = 'audio';

        return res.json({
          success: true,
          url: publicUrl,
          filename: req.file.filename,
          type: fileType,
          size: req.file.size,
        });
      }

      // Fallback base64 jika ada
      const { filename, fileData, fileType } = req.body || {};
      if (fileData && filename) {
        const matches = fileData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        const buffer =
          matches && matches.length === 3
            ? Buffer.from(matches[2], 'base64')
            : Buffer.from(fileData, 'base64');

        const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const targetPath = path.join(UPLOADS_DIR, safeName);
        fs.writeFileSync(targetPath, buffer);

        return res.json({
          success: true,
          url: `/uploads/${safeName}`,
          filename: safeName,
          type: fileType || 'unknown',
        });
      }

      return res.status(400).json({ success: false, error: 'No file received' });
    } catch (e: any) {
      console.error('Error saving uploaded file:', e);
      return res.status(500).json({ success: false, error: 'Failed to process file' });
    }
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jasmine Signage Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
