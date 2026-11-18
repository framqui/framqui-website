import { Resend } from 'resend';
import { getDb, getEnv, removeSubscriber } from '../../utils/storage.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST({ request }) {
  const siteUrl = new URL(request.url).origin;

  try {
    const formData = await request.formData();
    const email = String(formData.get('email') || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return Response.redirect(`${siteUrl}/suscribite?unsub=invalid`, 302);
    }

    const removed = await removeSubscriber(getDb(), email);
    if (!removed) {
      return Response.redirect(`${siteUrl}/suscribite?unsub=notfound`, 302);
    }

    try {
      const resend = new Resend(getEnv('RESEND_API_KEY'));
      const safeEmail = email.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      await resend.emails.send({
        from: 'Framqui <onboarding@resend.dev>',
        to: [email],
        subject: 'Desuscripción exitosa en Framqui',
        html: `<p>Te desuscribiste correctamente.</p><p>Mil gracias.</p><p>Andres Ramos</p>`,
      });
      await resend.emails.send({
        from: 'Framqui <onboarding@resend.dev>',
        to: ['andfera201@gmail.com'],
        subject: 'FRAMQUI.DESUSCRIBETE',
        html: `<p>Alguien se desuscribió.</p><p>${safeEmail}</p>`,
      });
    } catch (err) {
      console.error('Error enviando la confirmación de baja:', err);
    }

    return Response.redirect(`${siteUrl}/suscribite?unsub=success`, 302);
  } catch (err) {
    console.error('Error en unsubscribe:', err);
    return Response.redirect(`${siteUrl}/suscribite?unsub=error`, 302);
  }
}
