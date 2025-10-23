import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  healthCheck() {
    return {
      status: 'ok',
      message: 'Backend IA FonoKids is running',
      timestamp: new Date().toISOString()
    };
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}