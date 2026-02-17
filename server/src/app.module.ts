import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PollModule } from './poll/poll.module';
import { DatabaseModule } from './database/database.module';
import Redis from 'ioredis';
 

@Module({
  imports: [PollModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService, Redis],
})
export class AppModule {}
