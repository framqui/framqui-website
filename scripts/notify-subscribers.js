#!/usr/bin/env node

// Script para notificar a todos los suscriptores cuando se publica un nuevo artículo
// Uso: node scripts/notify-subscribers.js --title "Titulo" --slug "slug" --type "escrito" | "practica"

import { Resend } from 'resend';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { decrypt } from '../src/utils/encrypt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_FILE = join(__dirname, '..', 'src', 'data', 'subscribers.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const title = args.find((a, i) => a === '--title' && args[i + 1]) ? args[args.indexOf('--title') + 1] : null;
  const slug = args.find((a, i) => a === '--slug' && args[i + 1]) ? args[args.indexOf('--slug') + 1] : null;
  const type = args.find((a, i) => a === '--type' && args[i + 1]) ? args[args.indexOf('--type') + 1] : null;
  return { title, slug, type };
}

function loadSubscribers() {
  if (!existsSync(DATA_FILE)) {
    console.log('No hay suscriptores registrados.');
    return [];
  }
  const encrypted = readFileSync(DATA_FILE, 'utf-8');
  const json = decrypt(encrypted);
  return JSON.parse(json);
}

async function main() {
  const { title, slug, type } = parseArgs();

  if (!title || !slug) {
    console.error('Uso: node scripts/notify-subscribers.js --title "Titulo" --slug "slug" --type "escrito" | "practica"');
    process.exit(1);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  if (!process.env.RESEND_API_KEY) {
    console.error('Error: RESEND_API_KEY no está configurada en las variables de entorno.');
    process.exit(1);
  }

  const subscribers = loadSubscribers();

  if (subscribers.length === 0) {
    console.log('No hay suscriptores para notificar.');
    return;
  }

  const categoryLabel = type === 'practica' ? 'Práctica' : 'Escrito';
  const articleAdj = type === 'practica' ? 'Nueva' : 'Nuevo';
  const publishedAdj = type === 'practica' ? 'publicada' : 'publicado';
  let articleUrl;
  if (type === 'practica') {
    articleUrl = `https://framqui.com/practices/${slug}`;
  } else {
    articleUrl = `https://framqui.com/posts/${slug}`;
  }

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
    })
  );

  const successes = results.filter((r) => r.status === 'fulfilled').length;
  const failures = results.filter((r) => r.status === 'rejected').length;

  console.log(`\nResultado: ${successes} enviados, ${failures} fallidos.`);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
