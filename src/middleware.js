import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  // Exponer el runtime de Cloudflare en locals para acceder a bindings (KV, etc.)
  if (import.meta.env.SSR) {
    try {
      const { env } = await import('cloudflare:workers');
      context.locals.runtime = { env };
    } catch {
      // No estamos en Cloudflare Workers (desarrollo local)
      context.locals.runtime = { env: null };
    }
  }
  return next();
});
