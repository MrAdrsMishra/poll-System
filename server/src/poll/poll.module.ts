import { Module } from '@nestjs/common';
import { PollService } from './poll.service';
import { PollController } from './poll.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { Vote } from './vote.entity';
import { RedisPublisher, RedisSubscriber } from 'src/redis/redis';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, Vote])],
  providers: [PollService, RedisPublisher, RedisSubscriber],
  controllers: [PollController]
})
export class PollModule { }
