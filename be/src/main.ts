import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // tạo HTTP server bình thường

  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // REST guards / validation / CORS
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  app.enableCors({
    origin: ['http://localhost:5173', 'http://18.142.240.186:8080'],
    methods: '*',
    preflightContinue: false,
  });

  await app.listen(configService.get<number>('PORT') ?? 3000, '0.0.0.0'); // start HTTP server
}

bootstrap();
