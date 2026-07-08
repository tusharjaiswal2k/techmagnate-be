export default () => ({
  port: parseInt(process.env.PORT ?? '3001', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/techmagnate',
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresInSeconds: parseInt(
      process.env.JWT_EXPIRES_IN_SECONDS ?? '86400',
      10,
    ),
  },
});
