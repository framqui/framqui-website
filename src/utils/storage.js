import { encrypt, decrypt } from './encrypt.js';

// Estos imports solo se usan en Node.js local, no en Cloudflare Workers
let SUBSCRIBERS_FILE;
let PENDING_FILE;

async function getLocalPaths() {
  // Lazy init: solo se ejecuta cuando se necesita (en local)
  if (!SUBSCRIBERS_FILE) {
    const path = await import('path');
    const url = await import('url');
    const __filename = url.fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const DATA_DIR = path.join(__dirname, '..', 'pages', 'data');
    SUBSCRIBERS_FILE = path.join(DATA_DIR, 'subscribers.json');
    PENDING_FILE = path.join(DATA_DIR, 'pending-subscribers.json');
  }
  return { SUBSCRIBERS_FILE, PENDING_FILE };
}

async function loadFromFile(filePath) {
  const fs = await import('fs');
  try {
    const content = fs.readFileSync(filePath, 'utf-8').trim();
    if (!content) return [];
    const json = await decrypt(content);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

async function saveToFile(filePath, encrypted) {
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, encrypted, 'utf-8');
}

async function deleteFile(filePath) {
  const fs = await import('fs');
  try { fs.unlinkSync(filePath); } catch {}
}

// Si kv está disponible (Cloudflare), usar KV. Si no, usar archivos locales.
async function loadSubscribers(kv) {
  if (kv) {
    const raw = await kv.get('subscribers');
    if (!raw) return [];
    const json = await decrypt(raw);
    return JSON.parse(json);
  }
  const { SUBSCRIBERS_FILE } = await getLocalPaths();
  return loadFromFile(SUBSCRIBERS_FILE);
}

async function saveSubscribers(subscribers, kv) {
  const json = JSON.stringify(subscribers, null, 2);
  const encrypted = await encrypt(json);
  if (kv) {
    await kv.put('subscribers', encrypted);
  } else {
    const { SUBSCRIBERS_FILE } = await getLocalPaths();
    await saveToFile(SUBSCRIBERS_FILE, encrypted);
  }
}

async function loadPending(kv) {
  if (kv) {
    const raw = await kv.get('pending');
    if (!raw) return [];
    const json = await decrypt(raw);
    return JSON.parse(json);
  }
  const { PENDING_FILE } = await getLocalPaths();
  return loadFromFile(PENDING_FILE);
}

async function savePending(pending, kv) {
  if (pending.length === 0) {
    if (kv) {
      await kv.delete('pending');
    } else {
      const { PENDING_FILE } = await getLocalPaths();
      await deleteFile(PENDING_FILE);
    }
    return;
  }
  const json = JSON.stringify(pending, null, 2);
  const encrypted = await encrypt(json);
  if (kv) {
    await kv.put('pending', encrypted);
  } else {
    const { PENDING_FILE } = await getLocalPaths();
    await saveToFile(PENDING_FILE, encrypted);
  }
}

export { loadSubscribers, saveSubscribers, loadPending, savePending };
