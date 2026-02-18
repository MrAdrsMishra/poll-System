import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PollDto } from './poll.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Poll } from './poll.entity';
import { Subject } from 'rxjs';
import Redis from 'ioredis';
import { Vote } from './vote.entity';

@Injectable()
export class PollService implements OnModuleInit {
  private pollUpdateSubject = new Subject<Poll>();

  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,

    @Inject('REDIS_PUBLISHER')
    private readonly publisher: Redis,

    @Inject('REDIS_SUBSCRIBER')
    private readonly subscriber: Redis,

    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
  ) { }

  async onModuleInit() {
    await this.subscriber.subscribe('poll-updates');

    this.subscriber.on('message', (channel, message) => {
      if (channel === 'poll-updates') {
        const poll = JSON.parse(message);
        this.pollUpdateSubject.next(poll);
      }
    });
  }

  async createPoll(pollData: PollDto) {
    const formattedOptions: Record<string, number> = {};

    pollData.options.forEach((option: string) => {
      formattedOptions[option] = 0;
    });

    const poll = this.pollRepository.create({
      statement: pollData.statement,
      options: formattedOptions,
      validTill: pollData.validTill,
    });

    return this.pollRepository.save(poll);
  }
  getAllPolls() {
    // query builder for valid till
    const queryBuilder = this.pollRepository.createQueryBuilder('poll');
    queryBuilder.where('poll.validTill > :now', { now: new Date() });
    return queryBuilder.getMany();
  }

  getPollById(id: string) {
    return this.pollRepository.findOneBy({ id });
  }
  async vote(
    pollId: string,
    option: string,
    clientToken: string,
    userHash: string
  ) {
    if (!clientToken) {
      throw new BadRequestException('Client token is required');
    }

    const poll = await this.pollRepository.findOneBy({ id: pollId });
    if (!poll) {
      throw new NotFoundException('Poll not found');
    }
    if (!poll.options.hasOwnProperty(option)) {
      throw new BadRequestException('Invalid option');
    }
    const existingByToken = await this.voteRepository.findOneBy({
      pollId,
      clientToken,
    });
    if (existingByToken) {
      throw new BadRequestException('Already voted (token)');
    }
    const existingByHash = await this.voteRepository.findOneBy({
      pollId,
      userHash,
    });
    if (existingByHash) {
      throw new BadRequestException('Already voted (device)');
    }
    const voteRecord = this.voteRepository.create({
      pollId,
      clientToken,
      userHash,
    });
    await this.voteRepository.save(voteRecord);
    poll.options = {
      ...poll.options,
      [option]: poll.options[option] + 1,
    };
    const updatedPoll = await this.pollRepository.save(poll);

    // Emit directly to SSE subscribers (works without Redis)
    this.pollUpdateSubject.next(updatedPoll);

    // Also publish to Redis for multi-server setups (non-blocking)
    try {
      await this.publisher.publish(
        'poll-updates',
        JSON.stringify(updatedPoll)
      );
    } catch (err) {
      console.warn('Redis publish failed (Redis may not be running):', err.message);
    }

    return updatedPoll;
  }


  getPollUpdates() {
    return this.pollUpdateSubject.asObservable();
  }
}
