import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import * as fs from 'fs';
import * as path from 'path';

function ensureDirectoriesExist() {
  const directories = [
    path.resolve(__dirname, '../generated/audios'),
    path.resolve(__dirname, '../generated/uploads'),
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Directorio creado: ${dir}`);
    }
  });
}

async function bootstrap() {
  console.log('📂 Verificando directorios necesarios...');
  ensureDirectoriesExist();
  
  console.log('🤖 Verificando configuración de OpenAI...');
  if (process.env.OPENAI_API_KEY) {
    console.log('✅ OpenAI API Key configurada');
  }

  const app = await NestFactory.create(AppModule);

  // ✅ CORS ULTRA PERMISIVO - PERMITIR TODO
  app.use((req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Max-Age', '86400');
    
    if (req.method === 'OPTIONS') {
      console.log('🔄 Preflight request recibido para:', req.url);
      return res.status(200).end();
    }
    
    next();
  });

  // Logging
  app.use((req: any, res: any, next: any) => {
    console.log(`📥 ${req.method} ${req.url} - Origin: ${req.headers.origin || 'sin origen'}`);
    next();
  });

  // Body parser
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 3000;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log(`🚀 Servidor ejecutándose en puerto ${port}`);
    console.log(`🌐 CORS: TOTALMENTE ABIERTO (*)`)
    console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? '✅' : '❌'}`);
    console.log(`📧 SendGrid: ${process.env.SENDGRID_API_KEY ? '✅' : '❌'}`);
    console.log('='.repeat(50));
  });
}

bootstrap().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});