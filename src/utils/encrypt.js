function getKeyHex() {
  if (typeof import.meta !== 'undefined' && import.meta.env?.ENCRYPT_KEY) {
    return import.meta.env.ENCRYPT_KEY;
  }
  return process.env.ENCRYPT_KEY;
}

function getKeyBytes() {
  const keyHex = getKeyHex();
  if (!keyHex || keyHex.length !== 64) {
    throw new Error('ENCRYPT_KEY debe ser una clave hex de 64 caracteres (32 bytes).');
  }
  const bytes = new Uint8Array(keyHex.length / 2);
  for (let i = 0; i < keyHex.length; i += 2) {
    bytes[i / 2] = parseInt(keyHex.substr(i, 2), 16);
  }
  return bytes;
}

function uint8ArrayToHex(uint8) {
  return Array.from(uint8).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function encrypt(text) {
  const keyBytes = getKeyBytes();
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['encrypt']);
  const encoded = new TextEncoder().encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, key, encoded);
  return `${uint8ArrayToHex(iv)}:${uint8ArrayToHex(new Uint8Array(encrypted))}`;
}

async function decrypt(ciphertext) {
  const keyBytes = getKeyBytes();
  const [ivHex, encryptedHex] = ciphertext.split(':');
  const iv = hexToUint8Array(ivHex);
  const encrypted = hexToUint8Array(encryptedHex);
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CBC' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

export { encrypt, decrypt };
