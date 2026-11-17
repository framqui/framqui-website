import { Resend } from 'resend';
import { loadSubscribers, saveSubscribers, loadPending, savePending } from '../../utils/storage.js';

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST({ request }) {
  try {
    const siteUrl = new URL(request.url).origin;
    const formData = await request.formData();
    const email = formData.get('email');

    // En Cloudflare Workers, acceder a KV via cloudflare:workers
    let kv = null;
    try {
      const { env } = await import('cloudflare:workers');
      kv = env.SUBSCRIBERS || null;
    } catch {
      // En local, kv será null y usará archivos JSON
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response('Correo inválido', { status: 400 });
    }

    const subscribers = await loadSubscribers(kv);
    if (subscribers.includes(email)) {
      return Response.redirect(`${siteUrl}/suscribite?status=already`, 302);
    }

    const pending = await loadPending(kv);
    const existingPending = pending.find((p) => p.email === email);
    if (existingPending) {
      // Reenviar el mismo token pendiente
      const resend = new Resend(import.meta.env.RESEND_API_KEY);
      const verifyUrl = `${siteUrl}/api/verify-subscribe?token=${existingPending.token}`;
      try {
        await resend.emails.send({
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
      } catch (err) {
        console.error('Error reenviando correo:', err);
      }
      return Response.redirect(`${siteUrl}/suscribite?status=resend`, 302);
    }

    const token = generateToken();
    pending.push({ email, token, createdAt: new Date().toISOString() });
    await savePending(pending, kv);

    const resend = new Resend(import.meta.env.RESEND_API_KEY);
    const verifyUrl = `${siteUrl}/api/verify-subscribe?token=${token}`;

    try {
      await resend.emails.send({
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
    } catch (err) {
      pending.pop();
      await savePending(pending, kv);
      console.error('Error enviando correo:', err);
      return Response.redirect(`${siteUrl}/suscribite?status=error`, 302);
    }

    return Response.redirect(`${siteUrl}/suscribite?status=success`, 302);
  } catch (err) {
    console.error('Error en subscribe:', err);
    return Response.redirect(`${siteUrl}/suscribite?status=error`, 302);
  }
}
