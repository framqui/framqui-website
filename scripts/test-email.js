#!/usr/bin/env node

// Script de prueba para enviar un correo de test con Resend
// Uso: node scripts/test-email.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
  console.error('Error: RESEND_API_KEY no está configurada.');
  process.exit(1);
}

async function main() {
  console.log('Enviando correo de prueba a andfera201@gmail.com...');

  try {
    const result = await resend.emails.send({
      from: 'Andres Ramos <andfera201@gmail.com>',
      to: ['andfera201@gmail.com'],
      subject: 'Prueba de framqui - ¡Funciona!',
      html: `
        <h1>¡Hola!</h1>
        <p>Este es un correo de prueba desde el sistema de suscripción de <strong>framqui.com</strong>.</p>
        <p>Si recibiste este correo, todo está funcionando correctamente.</p>
        <p>— Andres</p>
      `,
    });

    console.log('✓ Correo enviado exitosamente.');
    console.log('ID del correo:', result.id);
  } catch (err) {
    console.error('Error al enviar el correo:', err.message);
    process.exit(1);
  }
}

main();
