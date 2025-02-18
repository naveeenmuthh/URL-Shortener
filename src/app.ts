import fastify, { FastifyRequest } from 'fastify'
import fastifyEnv from '@fastify/env';
import fastifyCors from '@fastify/cors';
import fastifyCompress from '@fastify/compress';
import fastifyHelmet from '@fastify/helmet';
import fastifySecureSession from "@fastify/secure-session";
import fastifyPassport from "@fastify/passport";
import  jwt from "jsonwebtoken";
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

// import productsRoutes from './routes/products.routes';
// import categoriesRoutes from './routes/categories.routes';
import { messageSchema, paramIdSchema, paginationSchema } from './schema/common.schema';
import { categorySchema, productSchema } from './schema/models.schema';
import googleAuthRoutes from './routes/googleAuth.routes';

const main = async () => {
  const app = fastify({ logger: loggerConfig });

  

  // Now we setup our app, plugins and such
  await app.register(fastifyEnv, envConfig);

  console.log(app.config.SECRET_SESSION_KEY);

  await app.register(fastifyCors, corsConfig);
  await app.register(fastifyCompress, compressConfig);
  await app.register(fastifyHelmet, helmetConfig);
  await app.register(prismaPlugin);
  await app.register(fastifySecureSession, {
    key: crypto.randomBytes(32) 
  });
  await app.register(fastifyPassport.initialize());
  await app.register(fastifyPassport.secureSession());

  fastifyPassport.registerUserSerializer(
    async (user:any, request:FastifyRequest) => {
      console.log('registerUserSerializer', { user })
      const { id, displayName } = user
      let userForSession:any = { id, displayName }
      // User object sent it from Google. 
      // Here you want to call your DB and get the user info from there and store it in the session.
      // The session is encrypted but if you don't want to store all the user info in the session just store the DB id in the session


      const db = request.server.prisma; 

      const db_user = await db.user.findUnique({
        where:{
             google_id: id
        }
      }) || await db.user.create({data:{
        google_id:id,
        name:displayName
      }});

    console.log("Error here!!");
    const access_token = jwt.sign({user_id:db_user.user_id},"access_key_secret"); // jwt secret

    await db.user_Auth.findUnique({where:{
      google_id:db_user.google_id,
    }}) || await db.user_Auth.create({data:{
      google_id:db_user.google_id,
      access_token
    }});

    console.log(userForSession);

    userForSession = {...userForSession, user_id: db_user.user_id};

      return userForSession
    }
  )

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
 

  // Json Schemas
  app.addSchema(paginationSchema);
  app.addSchema(paramIdSchema);
  app.addSchema(messageSchema);

  app.addSchema(categorySchema);
  app.addSchema(productSchema);

  // Swagger Docs
  if (app.config.ENABLE_SWAGGER) {
    await app.register(fastifySwagger, swaggerConfig);
    await app.register(fastifySwaggerUi, {
      routePrefix: '/docs',
    });
  }

  // API Endpoint routes
  await app.register(async api => {
    // api.register(categoriesRoutes, { prefix: "/categories" });
    // api.register(productsRoutes, { prefix: "/products" });
       api.register(googleAuthRoutes,{prefix:"/auth"});
  });

  return app;
};

export { main };

