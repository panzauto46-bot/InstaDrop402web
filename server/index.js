import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync, writeFileSync, existsSync, createReadStream, statSync, mkdirSync } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3402;

// Stacks Testnet API (FREE - no API key needed)
const STACKS_API = 'https://api.testnet.hiro.so';

// Paths
const DB_PATH = join(__dirname, '..', 'data', 'db.json');
const UPLOADS_DIR = join(__dirname, '..', 'public', 'uploads');

// Ensure directories exist
if (!existsSync(join(__dirname, '..', 'data'))) {
  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
}
if (!existsSync(UPLOADS_DIR)) {
  mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files ONLY through /api/download (NOT directly!)
// Removed: app.use('/uploads', express.static(UPLOADS_DIR));
// Files must go through payment verification

// Allowed file types for upload
const ALLOWED_EXTENSIONS = [
  '.pdf', '.zip', '.rar', '.7z',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp',
  '.mp4', '.mov', '.avi', '.mkv',
  '.mp3', '.wav', '.flac', '.ogg',
  '.doc', '.docx', '.txt', '.md',
  '.html', '.css', '.js', '.ts', '.json', '.xml',
  '.psd', '.ai', '.sketch', '.fig', '.xd',
  '.xlsx', '.csv',
];

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB max

// Multer config for file uploads with validation
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    if (ALLOWED_EXTENSIONS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`));
    }
  },
});

// Helper: Read database
function readDB() {
  if (!existsSync(DB_PATH)) {
    writeFileSync(DB_PATH, '[]', 'utf-8');
  }
  const raw = readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch {
    writeFileSync(DB_PATH, '[]', 'utf-8');
    return [];
  }
}

// Helper: Write database
function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper: Verify transaction on Stacks blockchain (FREE API)
async function verifySTXTransaction(txId, expectedRecipient, expectedAmountSTX) {
  try {
    const res = await fetch(`${STACKS_API}/extended/v1/tx/${txId}`);
    if (!res.ok) {
      return { valid: false, reason: 'Transaction not found on blockchain' };
    }

    const tx = await res.json();

    // Check transaction type
    if (tx.tx_type !== 'token_transfer') {
      return { valid: false, reason: 'Transaction is not an STX transfer' };
    }

    // Check status (accept both success and pending)
    if (tx.tx_status !== 'success' && tx.tx_status !== 'pending') {
      return { valid: false, reason: `Transaction status: ${tx.tx_status}` };
    }

    // Verify recipient matches the seller
    const txRecipient = tx.token_transfer?.recipient_address;
    if (txRecipient !== expectedRecipient) {
      return { valid: false, reason: 'Payment recipient does not match the seller' };
    }

    // Verify amount (microSTX)
    const txAmountMicro = parseInt(tx.token_transfer?.amount || '0', 10);
    const expectedAmountMicro = Math.floor(expectedAmountSTX * 1_000_000);

    // Allow 1% tolerance for rounding
    if (txAmountMicro < expectedAmountMicro * 0.99) {
      return { valid: false, reason: `Payment amount too low. Expected ${expectedAmountSTX} STX, got ${txAmountMicro / 1_000_000} STX` };
    }

    return {
      valid: true,
      status: tx.tx_status,
      sender: tx.sender_address,
      recipient: txRecipient,
      amount: txAmountMicro / 1_000_000,
    };
  } catch (err) {
    console.error('[x402] Verification error:', err.message);
    // If Stacks API is down, allow download with warning (don't block users)
    return { valid: true, reason: 'Could not verify — Stacks API unreachable, allowing download' };
  }
}

// ==========================================
// API ENDPOINTS
// ==========================================

// GET /api/files - Get all files (sorted newest first)
app.get('/api/files', (_req, res) => {
  const drops = readDB();
  drops.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ success: true, data: drops });
});

// GET /api/files/:id - Get single file by ID
app.get('/api/files/:id', (req, res) => {
  const drops = readDB();
  const drop = drops.find((d) => d.id === req.params.id);
  if (!drop) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
  res.json({ success: true, data: drop });
});

// GET /api/files/seller/:wallet - Get files by seller wallet
app.get('/api/files/seller/:wallet', (req, res) => {
  const drops = readDB();
  const sellerDrops = drops.filter((d) => d.sellerWallet === req.params.wallet);
  sellerDrops.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  res.json({ success: true, data: sellerDrops });
});

// POST /api/upload - Upload file + metadata (with validation)
app.post('/api/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'File too large. Maximum size is 500MB.' });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const { title, price, sellerWallet, description, category, isFree } = req.body;

      if (!sellerWallet) {
        return res.status(400).json({ success: false, error: 'Seller wallet address required' });
      }

      // Validate price
      const parsedPrice = isFree === 'true' ? 0 : parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ success: false, error: 'Invalid price' });
      }

      const id = Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);

      const drop = {
        id,
        title: title || req.file.originalname,
        price: isFree === 'true' ? 0 : parsedPrice,
        isFree: isFree === 'true',
        sellerWallet,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        description: description || '',
        category: category || '',
        downloads: 0,
        timestamp: new Date().toISOString(),
      };

      const drops = readDB();
      drops.push(drop);
      writeDB(drops);

      console.log(`[Upload] New file: ${drop.originalName} by ${sellerWallet.slice(0, 10)}...`);
      res.json({ success: true, data: drop });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, error: 'Upload failed' });
    }
  });
});

// GET /api/download/:id - Download file (x402 guard with REAL verification)
app.get('/api/download/:id', async (req, res) => {
  const drops = readDB();
  const drop = drops.find((d) => d.id === req.params.id);

  if (!drop) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }

  // x402 Protocol Logic — with REAL blockchain verification
  if (!drop.isFree && drop.price > 0) {
    const txId = req.query.txId || req.headers['x-payment-txid'];

    if (!txId) {
      // HTTP 402 Payment Required
      return res.status(402).json({
        success: false,
        error: 'Payment Required',
        price: drop.price,
        currency: 'STX',
        recipient: drop.sellerWallet,
        fileId: drop.id,
        protocol: 'x402',
      });
    }

    // Validate txId format
    if (typeof txId !== 'string' || txId.length < 10) {
      return res.status(400).json({ success: false, error: 'Invalid transaction ID format' });
    }

    // REAL verification: check transaction on Stacks blockchain
    console.log(`[x402] Verifying payment for file ${drop.id}...`);
    const verification = await verifySTXTransaction(txId, drop.sellerWallet, drop.price);

    if (!verification.valid) {
      console.log(`[x402] Payment REJECTED: ${verification.reason}`);
      return res.status(403).json({
        success: false,
        error: `Payment verification failed: ${verification.reason}`,
      });
    }

    console.log(`[x402] Payment VERIFIED for file ${drop.id} — txId: ${txId.slice(0, 16)}...`);
  }

  // Serve the file
  const filePath = join(UPLOADS_DIR, drop.filename);

  if (!existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found on disk' });
  }

  // Update download count
  drop.downloads = (drop.downloads || 0) + 1;
  writeDB(drops);

  // Stream file to client
  const stat = statSync(filePath);
  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Type', drop.mimetype || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${drop.originalName}"`);

  const stream = createReadStream(filePath);
  stream.pipe(res);
});

// GET /api/stats - Get platform stats
app.get('/api/stats', (_req, res) => {
  const drops = readDB();
  const totalFiles = drops.length;
  const totalDownloads = drops.reduce((sum, d) => sum + (d.downloads || 0), 0);
  const totalSellers = new Set(drops.map((d) => d.sellerWallet)).size;
  res.json({
    success: true,
    data: { totalFiles, totalDownloads, totalSellers },
  });
});

// ==========================================
// SERVE FRONTEND (Production only)
// In production, serve the built frontend from dist/
// ==========================================
const DIST_DIR = join(__dirname, '..', 'dist');
if (existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  // SPA catch-all: any non-API route serves index.html
  app.get('*', (_req, res) => {
    res.sendFile(join(DIST_DIR, 'index.html'));
  });
  console.log('[Server] Serving frontend from dist/');
}

// Start server
app.listen(PORT, () => {
  console.log(`\n  ⚡ InstaDrop 402 API Server`);
  console.log(`  ==========================`);
  console.log(`  Local:      http://localhost:${PORT}`);
  console.log(`  Network:    Stacks Testnet`);
  console.log(`  Verify TX:  ENABLED (via Hiro API)`);
  console.log(`  File types: ${ALLOWED_EXTENSIONS.length} extensions allowed`);
  console.log(`  Max size:   ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  console.log(`  Status:     ✅ Running\n`);
});

