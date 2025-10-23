import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptModule } from './gpt/gpt.module';
import { CorsMiddleware } from './cors.middleware';
import { AppController } from './app.controller'; // 👈 AGREGAR

@Module({
  imports: [
    ConfigModule.forRoot(),
    GptModule,
  ],
  controllers: [AppController], // 👈 AGREGAR
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}