import Redis from 'ioredis';

function createRedisClient() {
  const redisUrl = process.env.REDIS_URL!;
  const client = new Redis(redisUrl);
  client.on('connect', () => console.log('Redis connected'));
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
