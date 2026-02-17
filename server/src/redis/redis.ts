import Redis from 'ioredis';

// helper to create a client with sensible defaults and logging
function createRedisClient() {
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT || '6379', 10);

    const client = new Redis({
        host,
        port,
        // simple retry strategy so the app doesn't throw immediately
        retryStrategy: (times) => Math.min(times * 50, 2000),
    });

    // listen for errors to avoid unhandled error events
    client.on('error', (err) => {
        // you can replace this with a logger service if you have one
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
