import fastify, { FastifyRequest } from 'fastify'
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from "@fastify/secure-session";
import fastifyPassport from "@fastify/passport";
import  jwt from "jsonwebtoken";
import fastifyRedis from "@fastify/redis";
const OAuth2Strategy = require('passport-google-oauth').OAuth2Strategy;

import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

import crypto from "crypto";
import envConfig from './lib/env.config';
import corsConfig from './config/cors.config';
import loggerConfig from './config/logger.config';
import compressConfig from './config/compress.config';
import prismaPlugin from './plugins/prisma.plugin';
import helmetConfig from './config/helmet.config';
import { swaggerConfig } from './config/swagger.config';

import googleAuthRoutes from './routes/googleAuth.routes';
import urlShortenRoutes from './routes/urlShorten.routes';
import Redis from 'ioredis';


const main = async () => {
  const app = fastify({ logger: loggerConfig });

  // Now we setup our app, plugins and such
  await app.register(fastifyEnv, envConfig);

  console.log(app.config.SECRET_SESSION_KEY);

  await app.register(fastifyCors, corsConfig);
  await app.register(fastifyCompress, compressConfig);
  await app.register(fastifyHelmet, helmetConfig);
  await app.register(prismaPlugin);

  const redisClient = new Redis({username:app.config.REDIS_USER_NAME,password:app.config.REDIS_PASSWORD,host: app.config.REDIS_HOST,
    port: app.config.REDIS_PORT}) ;

  await app.register(fastifyRedis,{client:redisClient});
  await app.register(fastifySecureSession, {
    key: crypto.randomBytes(32) 
  });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());

  fastifyPassport.registerUserSerializer(
    async (user: any, request: FastifyRequest) => {
      try {
        console.log("registerUserSerializer", { user });
  
        const { id: google_id, displayName } = user;
        let userForSession: any = { google_id, displayName };
  
        const db = request.server.prisma;
  
        // Fetch user from DB or create if not exists
        let db_user = await db.user.findUnique({ where: { google_id } });
  
        if (!db_user) {
          db_user = await db.user.create({
            data: { google_id, name: displayName },
          });
        }
  
        // Fetch user authentication details
        let user_auth = await db.user_Auth.findUnique({ where: { google_id } });
  
        let token: string = "";
  
        if (user_auth) {
          token = user_auth.access_token || "";
  
          if (token) {
            try {
              jwt.verify(token, request.server.config.JWT_SECRET);
            } catch (error: any) {
              if (error.name === "TokenExpiredError") {
                console.warn(`Token expired for user: ${google_id}, generating new token.`);
                
                token = jwt.sign({ google_id }, request.server.config.JWT_SECRET, { expiresIn: "2h" });
  
                await db.user_Auth.update({
                  where: { google_id },
                  data: { access_token: token, limit: 0 },
                });
              } else {
                console.error("JWT Error:", error);
                throw new Error("Invalid JWT Token");
              }
            }
          } else {
            throw new Error("Invalid Token!");
          }
        } else {
          console.info(`New user detected: ${google_id}, generating authentication entry.`);
          
          token = jwt.sign({ google_id }, request.server.config.JWT_SECRET, { expiresIn: "2h" });
  
          await db.user_Auth.create({
            data: { google_id, access_token: token, limit: 0 },
          });
        }
  
        // Attach token to request headers
        request.headers.authorization = `Bearer ${token}`;
  
        // Prepare session user object
        userForSession = { ...userForSession, user_id: db_user.user_id };
  
        return userForSession;
  
      } catch (error: any) {
        console.error("Error in registerUserSerializer:", error.message);
        throw new Error("Internal Server Error");
      }
    }
  );

  fastifyPassport.registerUserDeserializer(async (userFromSession:any, request:FastifyRequest) => {
try {
  console.log('registerUserDeserializer', { userFromSession })
  // Here you decrypt the session object and read the user info from there.
  // If the whole user object is stored just return it. If only an ID is stored, look up the user in the DB using the ID and return that user

 const {user_id} = userFromSession;

 console.log("user_id",user_id);

 if(!user_id)
  throw new Error("Invalid User");

  return userFromSession
} catch (error) {
  throw error;
}
  })

  fastifyPassport.use('google', new OAuth2Strategy({
    clientID: app.config.GOOGLE_CLIENT_ID,
    clientSecret: app.config.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/auth/google/callback',
  }, function (accessToken: any, refreshToken: any, profile: any, cb: (arg0: null, arg1: any) => any) {
    return cb(null, profile);
  }
  ))
 

  // Swagger Docs
  if (app.config.ENABLE_SWAGGER) {
    await app.register(fastifySwagger, swaggerConfig);
    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  // API Endpoint routes
  await app.register(async api => {
       api.register(googleAuthRoutes,{prefix:"/auth"});
       api.register(urlShortenRoutes,{prefix:"/api"})
  });

  return app;
};

export { main };