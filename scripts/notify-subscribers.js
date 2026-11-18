#!/usr/bin/env node

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Resend } from 'resend';

const execFileAsync = promisify(execFile);

function parseArgs() {
  const args = process.argv.slice(2);
  const valueAfter = (flag) => {
    const index = args.indexOf(flag);
    return index !== -1 ? args[index + 1] : null;
  };
  return {
    title: valueAfter('--title'),
    slug: valueAfter('--slug'),
    type: valueAfter('--type'),
    local: !args.includes('--remote'),
  };
}

async function loadSubscribers(local) {
  const args = [
    'wrangler',
    'd1',
    'execute',
    'framqui',
    local ? '--local' : '--remote',
    '--json',
    '--command',
    'SELECT email FROM subscribers ORDER BY created_at',
  ];
  const { stdout } = await execFileAsync('pnpm', ['exec', ...args], {
    cwd: fileURLToPath(new URL('..', import.meta.url)),
  });
  const payload = JSON.parse(stdout);
  const rows = Array.isArray(payload) ? payload.flatMap((entry) => entry.results ?? []) : [];
  return rows.map((row) => row.email);
}

async function main() {
  const { title, slug, type, local } = parseArgs();

  if (!title || !slug) {
    console.error('Uso: node scripts/notify-subscribers.js --title "Titulo" --slug "slug" --type "escrito" | "practica"');
    process.exit(1);
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY no está configurada en las variables de entorno.');
    process.exit(1);
  }

  const subscribers = await loadSubscribers(local);

  if (subscribers.length === 0) {
    console.log('No hay suscriptores para notificar.');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const categoryLabel = type === 'practica' ? 'Práctica' : 'Escrito';
  const articleAdj = type === 'practica' ? 'Nueva' : 'Nuevo';
  const publishedAdj = type === 'practica' ? 'publicada' : 'publicado';
  const articleUrl = type === 'practica'
    ? `https://framqui.com/practices/${slug}`
    : `https://framqui.com/posts/${slug}`;

  console.log(`Enviando notificaciones a ${subscribers.length} suscriptor(es)...`);

  const results = await Promise.allSettled(
    subscribers.map(async (email) => {
      await resend.emails.send({
        from: 'framqui <onboarding@resend.dev>',
        to: [email],
        subject: `${articleAdj} ${categoryLabel}: ${title}`,
        html: `
          <h1>¡${articleAdj} ${categoryLabel} ${publishedAdj}!</h1>
          <p>Acabo de publicar un${type === 'practica' ? 'a' : ''} nuevo${type === 'practica' ? 'a' : ''} ${categoryLabel.toLowerCase()}:</p>
          <h2><a href="${articleUrl}">${title}</a></h2>
          <p>Espero que te sea útil.</p>
          <p>— Andres</p>
        `,
      });
      console.log(`  ✓ Enviado a ${email}`);
    }),
  );

  const successes = results.filter((result) => result.status === 'fulfilled').length;
  const failures = results.filter((result) => result.status === 'rejected').length;
  console.log(`\nResultado: ${successes} enviados, ${failures} fallidos.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
