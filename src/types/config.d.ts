import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: 'development' | 'production' | 'test';
      BIND_PORT: number;
      BIND_ADDR: string;
      PROJECT_NAME: string;
      APP_SERVER_NAME: string;
      DATABASE_URL: string;
      ENABLE_SWAGGER: boolean;
      GOOGLE_CLIENT_ID:string;
      GOOGLE_CLIENT_SECRET:string;
      SECRET_SESSION_KEY:string;
      JWT_SECRET:string;
      REDIS_USER_NAME:string;
      REDIS_PASSWORD:string;
      REDIS_HOST:string;
      REDIS_PORT:number;
    };
  }
}
