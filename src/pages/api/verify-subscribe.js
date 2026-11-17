import { Resend } from 'resend';
import { loadSubscribers, saveSubscribers, loadPending, savePending } from '../../utils/storage.js';

export async function GET({ request, platform }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const kv = platform?.env?.SUBSCRIBERS || null;

    if (!token) {
      return new Response('Token inválido', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const pending = await loadPending(kv);
    const index = pending.findIndex((p) => p.token === token);

    if (index === -1) {
      return new Response('Enlace de confirmación inválido o expirado', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const { email } = pending[index];
    pending.splice(index, 1);
    await savePending(pending, kv);

    const subscribers = await loadSubscribers(kv);
    subscribers.push(email);
    await saveSubscribers(subscribers, kv);

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
  } catch (err) {
    // Devolver el error real para debuggear
    return new Response(
      `<html><head><meta charset="utf-8"></head><body style="font-family: monospace; padding: 50px;">
        <h1>Error</h1>
        <p><strong>${err.message}</strong></p>
        <pre>${err.stack || ''}</pre>
      </body></html>`,
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
