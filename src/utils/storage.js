import { encrypt, decrypt } from './encrypt.js';

// Detectar si estamos en Cloudflare Workers (no tiene fs)
const isCloudflare = typeof process === 'undefined' || !process.versions?.node;

// En Cloudflare, acceder al KV namespace
async function getKV() {
  if (!isCloudflare) return null;
  try {
    const { env } = await import('cloudflare:workers');
    return env?.SUBSCRIBERS || null;
  } catch {
    return null;
  }
}

// En local, usar archivos JSON
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'pages', 'data');
const SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
const PENDING_FILE = path.join(DATA_DIR, 'pending-subscribers.json');

async function loadFromFile(filePath) {
  const fs = await import('fs');
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

async function loadSubscribers() {
  const kv = await getKV();
  if (kv) {
    const raw = await kv.get('subscribers');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  }
  return loadFromFile(SUBSCRIBERS_FILE);
}

async function saveSubscribers(subscribers) {
  const json = JSON.stringify(subscribers, null, 2);
  const encrypted = encrypt(json);
  const kv = await getKV();
  if (kv) {
    await kv.put('subscribers', encrypted);
  } else {
    saveToFile(SUBSCRIBERS_FILE, encrypted);
  }
}

async function loadPending() {
  const kv = await getKV();
  if (kv) {
    const raw = await kv.get('pending');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  }
  return loadFromFile(PENDING_FILE);
}

async function savePending(pending) {
  if (pending.length === 0) {
    const kv = await getKV();
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
  const kv = await getKV();
  if (kv) {
    await kv.put('pending', encrypted);
  } else {
    saveToFile(PENDING_FILE, encrypted);
  }
}

export { loadSubscribers, saveSubscribers, loadPending, savePending };
