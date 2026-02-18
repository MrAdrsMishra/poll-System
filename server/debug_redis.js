const fs = require('fs');
const Redis = require('ioredis');

// Load .env manually
try {
    const env = fs.readFileSync('.env', 'utf8');
    const redisUrlLine = env.split('\n').find(line => line.startsWith('REDIS_URL='));
    const redisUrl = redisUrlLine ? redisUrlLine.split('=', 2)[1].trim() : null;

    if (!redisUrl) {
        console.error('REDIS_URL not found in .env');
        process.exit(1);
    }

    console.log('Testing Redis connection...');
    console.log('URL found (masked):', redisUrl.replace(/:[^:@]+@/, ':***@'));

    const client = new Redis(redisUrl);

    client.on('connect', () => {
        console.log('Connected successfully!');
        client.quit();
    });

    client.on('error', (err) => {
        console.error('Redis connection error:', err);
        client.disconnect();
    });

} catch (e) {
    console.error('Error reading .env or initializing:', e);
}
