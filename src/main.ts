import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Crear app con CORS habilitado desde el inicio
  const app = await NestFactory.create(AppModule, {
    cors: true
  });

  // Configuración explícita de CORS
  app.enableCors({
    origin: '*', // Temporalmente permitir todo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type,Authorization,Accept',
  });

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application is running on port ${port}`);
  console.log(`🌐 CORS enabled: origin=* (all origins allowed)`);
}
bootstrap();