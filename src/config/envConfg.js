require('dotenv').config()

const envConfig = {
    BASE_URL: process.env.BASE_URL || '/ems/api',
    PORT: process.env.PORT || 3000,
    SWAGGER_URL: process.env.SWAGGER_URL || '/ems/swagger',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || 27017,
    DB_NAME: process.env.DB_NAME || 'ems-db',
    DB_USERNAME: process.env.DB_USERNAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_ACCESS_TOKEN_PRIVATE_KEY:
        process.env.JWT_ACCESS_TOKEN_PRIVATE_KEY || 'ems-key',
    JWT_ACCESS_TOKEN_EXPIRES: process.env.JWT_ACCESS_TOKEN_EXPIRES || '36000',

    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || 6379,
    REDIS_USERNAME: process.env.REDIS_USERNAME || 'default',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'siginx123',
}

module.exports = { envConfig }
