import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { DocumentBuilder } from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);


const config = new DocumentBuilder()
  .setTitle('Cats example')
  .setDescription('The cats API description')
  .setVersion('1.0')
  .addTag('cats')
  .addBearerAuth( // Define Bearer token authentication
    { 
      type: 'http', 
      scheme: 'bearer', 
      bearerFormat: 'JWT',
      description: 'Enter your JWT token here to authorize requests.',
    },
    'jwt' // This is an arbitrary name for your security scheme
  )
  .build();
const documentFactory = () => SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, documentFactory);
app.enableCors();
await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
