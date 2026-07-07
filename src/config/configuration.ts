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
});
