import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Sse,
  MessageEvent,
  Req,
  Res,
} from '@nestjs/common';
import { PollService } from './poll.service';
import { Poll } from './poll.entity';
import { PollDto } from './poll.dto';
import { filter, map, Observable } from 'rxjs';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';

@Controller('poll')
export class PollController {
  constructor(private readonly pollService: PollService) { }
  @Post('create-poll')
  async createPoll(@Body() pollData: PollDto) {
    return this.pollService.createPoll(pollData);
  }
  @Get('get-polls')
  async getAllPolls(@Req() req: Request, @Res() res: Response) {
    let voteToken = req.cookies?.voteToken;
    if (!voteToken) {
      voteToken = crypto.randomUUID();
      res.cookie('voteToken', voteToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 30,
      });
    }
    const allPolls = await this.pollService.getAllPolls();
    return res.json(allPolls);
  }
  @Get(':id')
  async getPollById(@Param('id') id: string) {
    return this.pollService.getPollById(id);
  }
  @Post(':id/vote')
  async vote(
    @Param('id') id: string,
    @Body() body: { option: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    let clientToken = req.cookies?.voteToken;
    const ip = req.ip ?? req.headers['x-forwarded-for']?.toString();
    // get fingerprint
    const userAgent = req.headers['user-agent'];
    const fingerprint = req.body.fingerprint.toString();
    const userHash = crypto.createHash('sha256').update(ip + fingerprint).digest('hex');
    return this.pollService.vote(id, body.option, clientToken, userHash);
  }
  @Sse(':id/live')
  pollUpdate(@Param('id') id: string): Observable<MessageEvent> {
    return this.pollService.getPollUpdates().pipe(
      filter((poll: Poll) => poll.id === id),
      map((poll: Poll) => ({ data: poll })),
    );
  }
}

import Redis from 'ioredis';

function createRedisClient() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    const client = new Redis({
        host,
        port,
        retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    client.on('error', (err) => {
        console.error('Redis error event:', err);
    });

    return client;
}

export const RedisPublisher = {
    provide: 'REDIS_PUBLISHER',
    useFactory: () => createRedisClient(),
};

export const RedisSubscriber = {
    provide: 'REDIS_SUBSCRIBER',
    useFactory: () => createRedisClient(),
};
