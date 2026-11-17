import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';
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
  const dir = path.dirname(PENDING_FILE);
  fs.mkdirSync(dir, { recursive: true });
  const json = JSON.stringify(pending, null, 2);
  const encrypted = encrypt(json);
  fs.writeFileSync(PENDING_FILE, encrypted, 'utf-8');
}

function generateToken() {
  return randomBytes(32).toString('hex');
}

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export async function POST({ request }) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Correo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const subscribers = loadSubscribers();
  if (subscribers.includes(email)) {
    return new Response(JSON.stringify({ message: 'Ya estás suscrito' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const pending = loadPending();
  const existingPending = pending.find((p) => p.email === email);
  if (existingPending) {
    // Reenviar el mismo token pendiente
    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    const verifyUrl = `${SITE_URL}/api/verify-subscribe?token=${existingPending.token}`;
    try {
      const result = await resend.emails.send({
        from: 'Framqui <onboarding@resend.dev>',
        to: [email],
        subject: 'Confirma tu suscripción',
        html: `
          <h1>Confirma tu suscripción</h1>
          <p>Haz clic en el siguiente enlace para confirmar tu suscripción a las notificaciones de <strong>Framqui</strong>:</p>
          <p><a href="${verifyUrl}">Confirmar suscripción</a></p>
          <p>Si no te suscribiste, puedes ignorar este correo.</p>
          <p>— Andres</p>
        `,
      });
      if (result.error) {
        return new Response(JSON.stringify({ error: 'No se pudo enviar el correo de confirmación' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
        });
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: 'No se pudo enviar el correo de confirmación' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
    return new Response(JSON.stringify({ message: 'Revisa tu correo para confirmar la suscripción' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const token = generateToken();
  pending.push({ email, token, createdAt: new Date().toISOString() });
  savePending(pending);

  const resend = new Resend(import.meta.env.RESEND_API_KEY);
  const verifyUrl = `${SITE_URL}/api/verify-subscribe?token=${token}`;

  try {
    const result = await resend.emails.send({
      from: 'Framqui <onboarding@resend.dev>',
      to: [email],
      subject: 'Confirma tu suscripción',
      html: `
        <h1>Confirma tu suscripción</h1>
        <p>Haz clic en el siguiente enlace para confirmar tu suscripción a las notificaciones de <strong>Framqui</strong>:</p>
        <p><a href="${verifyUrl}">Confirmar suscripción</a></p>
        <p>Si no te suscribiste, puedes ignorar este correo.</p>
        <p>— Andres</p>
      `,
    });
    if (result.error) {
      pending.pop();
      savePending(pending);
      return new Response(JSON.stringify({ error: 'No se pudo enviar el correo de confirmación' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  } catch (err) {
    pending.pop();
    savePending(pending);
    return new Response(JSON.stringify({ error: 'No se pudo enviar el correo de confirmación' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  return new Response(JSON.stringify({ message: 'Revisa tu correo para confirmar la suscripción' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
