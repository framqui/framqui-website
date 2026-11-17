import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encrypt, decrypt } from '../../utils/encrypt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'subscribers.json');
const PENDING_FILE = path.join(__dirname, '..', 'data', 'pending-subscribers.json');

function loadSubscribers() {
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8').trim();
    if (!content) return [];
    const json = decrypt(content);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function saveSubscribers(subscribers) {
  const dir = path.dirname(DATA_FILE);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(subscribers, null, 2);
  const encrypted = encrypt(json);
  fs.writeFileSync(DATA_FILE, encrypted, 'utf-8');
}

function loadPending() {
  try {
    const content = fs.readFileSync(PENDING_FILE, 'utf-8').trim();
    if (!content) return [];
    const json = decrypt(content);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

function savePending(pending) {
  if (pending.length === 0) {
    try { fs.unlinkSync(PENDING_FILE); } catch {}
    return;
  }
  const dir = path.dirname(PENDING_FILE);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(pending, null, 2);
  const encrypted = encrypt(json);
  fs.writeFileSync(PENDING_FILE, encrypted, 'utf-8');
}

export async function GET({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Token inválido', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const pending = loadPending();
  const index = pending.findIndex((p) => p.token === token);

  if (index === -1) {
    return new Response('Enlace de confirmación inválido o expirado', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  const { email } = pending[index];
  pending.splice(index, 1);
  savePending(pending);

  const subscribers = loadSubscribers();
  subscribers.push(email);
  saveSubscribers(subscribers);

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: 'Framqui <onboarding@resend.dev>',
      to: [email],
      subject: '¡Gracias por confirmar tu suscripción!',
      html: `
        <h1>¡Bienvenido!</h1>
        <p>Tu suscripción a las notificaciones de <strong>Framqui</strong> ha sido confirmada.</p>
        <p>Recibirás un correo cada vez que publique un nuevo artículo o práctica.</p>
        <p>— Andres</p>
      `,
    });
  } catch (err) {
    console.error('Error enviando correo de bienvenida:', err);
  }

  return new Response(
    `<html><head><meta charset="utf-8"></head><body style="font-family: monospace; text-align: center; padding: 50px;">
      <h1>¡Suscripción confirmada!</h1>
      <p>Gracias por confirmar tu correo. Recibirás notificaciones de Framqui.</p>
      <p><a href="/" style="color: #2563eb;">Ir a la página</a></p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}
