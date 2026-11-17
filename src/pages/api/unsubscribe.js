import { loadSubscribers, saveSubscribers } from '../../utils/storage.js';

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
      return Response.redirect(`${siteUrl}/suscribite?unsub=invalid`, 302);
    }

    const subscribers = await loadSubscribers(kv);
    const index = subscribers.indexOf(email);

    if (index === -1) {
      return Response.redirect(`${siteUrl}/suscribite?unsub=notfound`, 302);
    }

    subscribers.splice(index, 1);
    await saveSubscribers(subscribers, kv);

    return Response.redirect(`${siteUrl}/suscribite?unsub=success`, 302);
  } catch (err) {
    console.error('Error en unsubscribe:', err);
    return Response.redirect(`${siteUrl}/suscribite?unsub=error`, 302);
  }
}
