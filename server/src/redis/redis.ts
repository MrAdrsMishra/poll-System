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
