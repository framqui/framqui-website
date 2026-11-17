import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const KEY = typeof import.meta !== 'undefined'
  ? (import.meta.env?.ENCRYPT_KEY || process.env.ENCRYPT_KEY)
  : process.env.ENCRYPT_KEY;
const ALGO = 'aes-256-cbc';

if (!KEY || KEY.length !== 64) {
  throw new Error('ENCRYPT_KEY debe ser una clave hex de 64 caracteres (32 bytes).');
}

const keyBuffer = Buffer.from(KEY, 'hex');

function encrypt(text) {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, keyBuffer, iv);
  let encrypted = cipher.update(text, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decrypt(ciphertext) {
  const [ivHex, encrypted] = ciphertext.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = createDecipheriv(ALGO, keyBuffer, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}

export { encrypt, decrypt };
