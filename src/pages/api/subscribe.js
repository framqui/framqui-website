import { Resend } from 'resend';
import { randomBytes } from 'crypto';
import { loadSubscribers, saveSubscribers, loadPending, savePending } from '../../utils/storage.js';

function generateToken() {
  return randomBytes(32).toString('hex');
}

const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'http://localhost:4321';

export async function POST({ request, platform }) {
  const { email } = await request.json();
  const kv = platform?.env?.SUBSCRIBERS || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Correo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const subscribers = await loadSubscribers(kv);
  if (subscribers.includes(email)) {
    return new Response(JSON.stringify({ message: 'Ya estás suscrito' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
    });
  }

  const pending = await loadPending(kv);
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
  await savePending(pending, kv);

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
      await savePending(pending, kv);
      return new Response(JSON.stringify({ error: 'No se pudo enviar el correo de confirmación' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
      });
    }
  } catch (err) {
    pending.pop();
    await savePending(pending, kv);
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
