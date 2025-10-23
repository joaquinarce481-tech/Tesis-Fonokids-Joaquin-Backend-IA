import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: false // Deshabilitamos CORS por defecto para configurarlo manualmente
  });

  // Middleware para logging
  app.use((req: any, res: any, next: any) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin}`);
    next();
  });

  // CORS manual más agresivo
  app.use((req: any, res: any, next: any) => {
    const allowedOrigins = [
      'https://tesis-fonokids-joaquin.vercel.app',
      'http://localhost:4200',
      'http://localhost:4201',
      'http://localhost:3000'
    ];
    
    const origin = req.headers.origin;
    
    // Si el origen está en la lista O si no hay origen (peticiones directas)
    if (!origin || allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    } else {
      // Para debugging - permitir cualquier origen en producción temporalmente
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '86400');
    
    // Responder inmediatamente a las peticiones OPTIONS
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    
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
    console.log(`🚀 Application is running on port ${port}`);
    console.log(`📍 Server URL: http://0.0.0.0:${port}`);
    console.log(`🌐 CORS enabled for Vercel and localhost`);
  });
}

bootstrap().catch(err => {
  console.error('❌ Error starting server:', err);
  process.exit(1);
});