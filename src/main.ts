import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

// ✅ Función para crear carpetas necesarias
function ensureDirectoriesExist() {
  const directories = [
    path.resolve(__dirname, '../generated/audios'),
    path.resolve(__dirname, '../generated/uploads'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    } else {
      console.log(`📁 Directorio ya existe: ${dir}`);
    }
  });
}

async function bootstrap() {
  // ✅ Crear directorios necesarios ANTES de iniciar la app
  console.log('📂 Verificando directorios necesarios...');
  ensureDirectoriesExist();
  
  // ✅ Verificar configuración de OpenAI
  console.log('🤖 Verificando configuración de OpenAI...');
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API Key configurada');
  } else {
    console.warn('⚠️ ADVERTENCIA: OPENAI_API_KEY no está configurada');
  }

  // ✅ CREAR APP CON CORS HABILITADO GLOBALMENTE
  const app = await NestFactory.create(AppModule);

  // ✅ HABILITAR CORS DE FORMA SIMPLE Y PERMISIVA
  app.enableCors({
    origin: true, // Permitir todos los orígenes temporalmente
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'Origin', 'X-Requested-With', 'Accept'],
  });

  // Middleware para logging
  app.use((req: any, res: any, next: any) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });

  // Body parser para manejar archivos grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 8080;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Application is running on port ${port}`);
    console.log(`📍 Server URL: http://0.0.0.0:${port}`);
    console.log(`🌐 CORS: ✅ HABILITADO (permitiendo todos los orígenes)`);
    console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log('='.repeat(50));
  });
}

bootstrap().catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});