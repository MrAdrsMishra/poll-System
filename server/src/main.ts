import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser'
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors(
    {
      // for postman
      origin:["https://apius.reqbin.com","https://poll-room.netlify.app/","*"],
      credentials:true
    }
  )
  await app.listen(process.env.PORT || 3000,()=>{
    console.log(`workign correctly running on port ${process.env.PORT || 3000}`)
  });
}
bootstrap();
