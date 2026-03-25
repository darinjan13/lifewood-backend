import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mirror the CORS setup from your Netlify functions
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://soriano-lifewood.netlify.app',
      'https://lifewood-eight.vercel.app',
      'https://lifewood-darinjan13s-projects.vercel.app',
      'https://with-nestjs--soriano-lifewood.netlify.app'
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Lifewood API running on http://localhost:${port}`);
}

bootstrap();
