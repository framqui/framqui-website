import { env } from 'cloudflare:workers';

export function getDb() {
  const db = env.DB;
  if (!db) {
    throw new Error('El binding D1 "DB" no está disponible.');
  }
  return db;
}

export function getEnv(key) {
  return env[key] ?? process.env[key];
}

export async function isSubscribed(db, email) {
  const row = await db.prepare('SELECT email FROM subscribers WHERE email = ?').bind(email).first();
  return Boolean(row);
}

export async function findPendingByEmail(db, email) {
  return db.prepare('SELECT email, token FROM pending_subscribers WHERE email = ?').bind(email).first();
}

export async function savePending(db, email, token) {
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO pending_subscribers (email, token, created_at) VALUES (?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET token = excluded.token, created_at = excluded.created_at`,
    )
    .bind(email, token, createdAt)
    .run();
}

export async function deletePendingByEmail(db, email) {
  await db.prepare('DELETE FROM pending_subscribers WHERE email = ?').bind(email).run();
}

export async function confirmPending(db, token) {
  const row = await db.prepare('SELECT email FROM pending_subscribers WHERE token = ?').bind(token).first();
  if (!row) return null;

  const createdAt = new Date().toISOString();
  await db.batch([
    db.prepare('DELETE FROM pending_subscribers WHERE token = ?').bind(token),
    db.prepare(
      'INSERT INTO subscribers (email, created_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING',
    ).bind(row.email, createdAt),
  ]);

  return row.email;
}

export async function removeSubscriber(db, email) {
  const result = await db.prepare('DELETE FROM subscribers WHERE email = ?').bind(email).run();
  return (result.meta?.changes ?? 0) > 0;
}
