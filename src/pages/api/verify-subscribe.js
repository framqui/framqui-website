import { Resend } from 'resend';
import { confirmPending, getDb, getEnv } from '../../utils/storage.js';

export async function GET({ request }) {
  try {
    const token = new URL(request.url).searchParams.get('token');

    if (!token) {
      return new Response('Token inválido', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    const email = await confirmPending(getDb(), token);
    if (!email) {
      return new Response('Enlace de confirmación inválido o expirado', { status: 400, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }

    try {
      const resend = new Resend(getEnv('RESEND_API_KEY'));
      const safeEmail = email.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
      await resend.emails.send({
        from: 'Framqui <onboarding@resend.dev>',
        to: ['andfera201@gmail.com'],
        subject: 'FRAMQUI.SUSCRIBETE',
        html: `<p>Alguien nuevo se suscribió.</p><p>${safeEmail}</p>`,
      });
    } catch (err) {
      console.error('Error notificando la suscripción:', err);
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Suscripción confirmada — Framqui</title>
        </head>
        <body style="margin:0; min-height:100vh; background:#f6f3ee; color:#1a1916; font-family:Georgia,'Iowan Old Style',Palatino,serif;">
          <main style="max-width:42rem; margin:0 auto; padding:5rem 1.5rem;">
            <h1 style="font-size:2.25rem; font-weight:700; letter-spacing:-0.02em; margin:0;">Suscripción confirmada</h1>
            <p style="margin:1.25rem 0 0; font-size:1.05rem; line-height:1.7;">Gracias por confirmar tu correo. Recibirás notificaciones de Framqui, de Andres Ramos.</p>
            <p style="margin:1rem 0 0; font-size:1.05rem; line-height:1.7;">Si tienes alguna consulta, puedes escribirme en mis redes:</p>
            <p style="margin:1rem 0 0; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:0.8rem;">
              <a href="https://github.com/framqui" style="color:#6f6a63; text-decoration:none;">GitHub</a>
              <span style="color:#e4dfd6;"> · </span>
              <a href="https://www.linkedin.com/in/framqui/" style="color:#6f6a63; text-decoration:none;">LinkedIn</a>
              <span style="color:#e4dfd6;"> · </span>
              <a href="mailto:andfera201@gmail.com" style="color:#6f6a63; text-decoration:none;">Correo</a>
            </p>
            <p style="margin:2.5rem 0 0; padding-top:1.5rem; border-top:1px solid #e4dfd6; font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-size:0.95rem;">
              <a href="/" style="color:#1a1916;">Ir al inicio</a>
            </p>
          </main>
        </body>
      </html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err) {
    console.error('Error en verify-subscribe:', err);
    return new Response('Error al verificar la suscripción', { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
