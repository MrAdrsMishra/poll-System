import { Test, TestingModule } from '@nestjs/testing';
import { Poll } from './poll.service';

describe('Poll', () => {
  let provider: Poll;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Poll],
    }).compile();

    provider = module.get<Poll>(Poll);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
