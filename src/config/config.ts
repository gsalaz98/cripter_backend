export const config = {
    prod: process.env.NODE_ENV === 'production' ? true : false,
    port: process.env.PORT || '8080',

    db_connection: process.env.MONGO_URI || 'mongodb://localhost:27017/cripter',
    database: process.env.DATABASE || 'cripter',

    salt_rounds: 16,

    redis_url: process.env.REDIS_URI || 'redis://localhost/0',
    redis_auth: process.env.REDIS_AUTH || undefined,
}