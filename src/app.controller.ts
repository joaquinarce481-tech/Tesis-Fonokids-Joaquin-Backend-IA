import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello() {
    return {
      status: 'ok',
      message: 'Backend IA FonoKids is running',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'healthy',
      service: 'FonoKids Backend IA',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}