import { Resend } from 'resend';
import { deletePendingByEmail, findPendingByEmail, getDb, getEnv, isSubscribed, savePending } from '../../utils/storage.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function confirmationHtml(verifyUrl, policiesUrl) {
  return `<p>Gracias por suscribirte.</p><p>Antes de confirmar, te invito a leer las <a href="${policiesUrl}">políticas de privacidad</a>. Ahí explico el tratamiento de tus datos, los servicios que usa el sitio y cómo se protege esa información. Léelas: tu seguridad en la web es importante para mí.</p><p>Para confirmar tu suscripción, entra en este enlace:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Mil gracias.</p><p>Andres Ramos</p>`;
}

async function sendConfirmation(apiKey, email, verifyUrl, policiesUrl) {
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: 'Framqui <onboarding@resend.dev>',
    to: [email],
    subject: 'Suscripción Framqui (Andres Ramos)',
    html: confirmationHtml(verifyUrl, policiesUrl),
  });
}

export async function POST({ request }) {
  const siteUrl = new URL(request.url).origin;

  try {
    const db = getDb();
    const formData = await request.formData();
    const email = String(formData.get('email') || '').trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      return new Response('Correo inválido', { status: 400 });
    }

    if (await isSubscribed(db, email)) {
      return Response.redirect(`${siteUrl}/suscribite?status=already`, 302);
    }

    const existingPending = await findPendingByEmail(db, email);
    const token = existingPending?.token ?? randomToken();
    if (!existingPending) {
      await savePending(db, email, token);
    }

    const verifyUrl = `${siteUrl}/api/verify-subscribe?token=${token}`;

    const apiKey = getEnv('RESEND_API_KEY');

    try {
      await sendConfirmation(apiKey, email, verifyUrl, `${siteUrl}/politicas`);
    } catch (err) {
      if (!existingPending) {
        await deletePendingByEmail(db, email);
      }
      console.error('Error enviando correo:', err);
      return Response.redirect(`${siteUrl}/suscribite?status=error`, 302);
    }

    const status = existingPending ? 'resend' : 'success';
    return Response.redirect(`${siteUrl}/suscribite?status=${status}`, 302);
  } catch (err) {
    console.error('Error en subscribe:', err);
    return Response.redirect(`${siteUrl}/suscribite?status=error`, 302);
  }
}
