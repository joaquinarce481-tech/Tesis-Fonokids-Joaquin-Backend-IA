import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GptModule } from './gpt/gpt.module';
import { CorsMiddleware } from './cors.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    GptModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorsMiddleware)
      .forRoutes('*');
  }
}