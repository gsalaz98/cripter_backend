import redis from 'redis';
import { config } from './config';

export const redisClient = redis.createClient({
    url: config.redis_url,
    auth_pass: config.redis_auth,
});