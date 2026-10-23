import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// High limit for base64 video/image/audio uploads
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

const DATA_FILE = path.join(DATA_DIR, 'signage-config.json');

// API: Get signage config
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

// API: Save signage config
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

// API: Upload media file (Base64 data URL)
app.post('/api/upload', (req, res) => {
  try {
    const { filename, fileData, fileType } = req.body;
    if (!fileData || !filename) {
      return res.status(400).json({ success: false, error: 'Filename and fileData are required' });
    }

    // Extract base64
    const matches = fileData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    let buffer: Buffer;
    if (matches && matches.length === 3) {
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(fileData, 'base64');
    }

    const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const targetPath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(targetPath, buffer);

    const publicUrl = `/uploads/${safeName}`;
    return res.json({
      success: true,
      url: publicUrl,
      filename: safeName,
      type: fileType || 'unknown',
    });
  } catch (error) {
    console.error('Error processing upload:', error);
    return res.status(500).json({ success: false, error: 'Upload failed' });
  }
});

// API: Health / Ping
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite middleware for development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Jasmine Signage Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`- TV Player: http://localhost:${PORT}?mode=tv`);
    console.log(`- Admin CMS: http://localhost:${PORT}?mode=admin`);
  });
}

startServer();
