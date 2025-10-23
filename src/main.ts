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

  // ✅ ACTIVAR CORS DIRECTAMENTE EN NESTFACTORY
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        'https://tesis-fonokids-joaquin.vercel.app',
        'http://localhost:4200',
        'http://localhost:4201',
        'http://localhost:3000',
        /\.vercel\.app$/, // Permitir todos los subdominios de vercel.app
      ],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token',
    }
  });

  // Middleware para logging (después del CORS)
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
    console.log(`🌐 CORS enabled for Vercel and localhost`);
    console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log('='.repeat(50));
  });
}

bootstrap().catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});