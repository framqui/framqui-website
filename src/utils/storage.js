import { encrypt, decrypt } from './encrypt.js';

function getKV(locals) {
  try {
    if (locals && locals.runtime && locals.runtime.env && locals.runtime.env.SUBSCRIBERS) {
      return locals.runtime.env.SUBSCRIBERS;
    }
  } catch {}
  return null;
}

async function loadSubscribers(locals) {
  const kv = getKV(locals);
  if (kv) {
    const raw = await kv.get('subscribers');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  } else {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const DATA_FILE = path.join(__dirname, '..', 'pages', 'data', 'subscribers.json');
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
      if (!content) return [];
      const json = decrypt(content);
      return JSON.parse(json);
    } catch {
      return [];
    }
  }
}

async function saveSubscribers(subscribers, locals) {
  const json = JSON.stringify(subscribers, null, 2);
  const encrypted = encrypt(json);
  const kv = getKV(locals);
  if (kv) {
    await kv.put('subscribers', encrypted);
  } else {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const DATA_FILE = path.join(__dirname, '..', 'pages', 'data', 'subscribers.json');
    const dir = path.dirname(PENDING_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, encrypted, 'utf-8');
  }
}

async function loadPending(locals) {
  const kv = getKV(locals);
  if (kv) {
    const raw = await kv.get('pending');
    if (!raw) return [];
    const json = decrypt(raw);
    return JSON.parse(json);
  } else {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const PENDING_FILE = path.join(__dirname, '..', 'pages', 'data', 'pending-subscribers.json');
    try {
      const content = fs.readFileSync(PENDING_FILE, 'utf-8').trim();
      if (!content) return [];
      const json = decrypt(content);
      return JSON.parse(json);
    } catch {
      return [];
    }
  }
}

async function savePending(pending, locals) {
  if (pending.length === 0) {
    const kv = getKV(locals);
    if (kv) {
      await kv.delete('pending');
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const { fileURLToPath } = await import('url');
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const PENDING_FILE = path.join(__dirname, '..', 'pages', 'data', 'pending-subscribers.json');
      try { fs.unlinkSync(PENDING_FILE); } catch {}
    }
    return;
  }
  const json = JSON.stringify(pending, null, 2);
  const encrypted = encrypt(json);
  const kv = getKV(locals);
  if (kv) {
    await kv.put('pending', encrypted);
  } else {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const PENDING_FILE = path.join(__dirname, '..', 'pages', 'data', 'pending-subscribers.json');
    const dir = path.dirname(PENDING_FILE);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(PENDING_FILE, encrypted, 'utf-8');
  }
}

export { loadSubscribers, saveSubscribers, loadPending, savePending };
