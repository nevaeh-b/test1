import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true, // 우선 모든 곳에서 접근 가능하게 바꿈
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
