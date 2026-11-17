import { encrypt, decrypt } from './encrypt.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'pages', 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending-subscribers.json');

function loadFromFile(filePath) {
  const fs = require('fs');
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    const json = decrypt(content);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function saveToFile(filePath, encrypted) {
  const fs = require('fs');
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, encrypted, 'utf-8');
}

// Si kv está disponible (Cloudflare), usar KV. Si no, usar archivos locales.
async function loadSubscribers(kv) {
  if (kv) {
    const raw = await kv.get('subscribers');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  }
  return loadFromFile(SUBSCRIBERS_FILE);
}

async function saveSubscribers(subscribers, kv) {
  const json = JSON.stringify(subscribers, null, 2);
  const encrypted = encrypt(json);
  if (kv) {
    await kv.put('subscribers', encrypted);
  } else {
    saveToFile(SUBSCRIBERS_FILE, encrypted);
  }
}

async function loadPending(kv) {
  if (kv) {
    const raw = await kv.get('pending');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  }
  return loadFromFile(PENDING_FILE);
}

async function savePending(pending, kv) {
  if (pending.length === 0) {
    if (kv) {
      await kv.delete('pending');
    } else {
      const fs = require('fs');
      try { fs.unlinkSync(PENDING_FILE); } catch {}
    }
    return;
  }
  const json = JSON.stringify(pending, null, 2);
  const encrypted = encrypt(json);
  if (kv) {
    await kv.put('pending', encrypted);
  } else {
    saveToFile(PENDING_FILE, encrypted);
  }
}

export { loadSubscribers, saveSubscribers, loadPending, savePending };
