import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { encrypt, decrypt } from '../../utils/encrypt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'subscribers.json');

function loadSubscribers() {
  try {
    const encrypted = fs.readFileSync(DATA_FILE, 'utf-8');
    const json = decrypt(encrypted);
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

export async function POST({ request }) {
  const { email } = await request.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Correo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const subscribers = await loadSubscribers();

  if (subscribers.includes(email)) {
    return new Response(JSON.stringify({ message: 'Ya estás suscrito' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  subscribers.push(email);
  await saveSubscribers(subscribers);

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  let emailError = null;
  try {
    const result = await resend.emails.send({
      from: 'Framqui <onboarding@resend.dev>',
      to: [email],
      subject: '¡Gracias por suscribirte!',
      html: `
        <h1>¡Bienvenido!</h1>
        <p>Te has suscrito correctamente a las notificaciones de <strong>Framqui</strong>.</p>
        <p>Recibirás un correo cada vez que publique un nuevo artículo.</p>
        <p>— Andres</p>
      `,
    });
    if (result.error) {
      emailError = result.error;
      console.error('Error enviando correo de bienvenida:', result.error);
    }
  } catch (err) {
    emailError = err;
    console.error('Error enviando correo de bienvenida:', err);
  }

  if (emailError) {
    return new Response(JSON.stringify({ message: 'Suscrito correctamente', warning: 'El correo de bienvenida no pudo enviarse aún' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ message: 'Suscrito correctamente' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
