import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  app.enableCors({
    origin: [
      'https://tesis-fonokids-joaquin.vercel.app',
      'http://localhost:4200'
    ],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // ⚠️ Importante: '0.0.0.0'
  
  console.log(`🚀 Application is running on port ${port}`);
}
bootstrap();