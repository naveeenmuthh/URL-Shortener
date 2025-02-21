# 🚀 URL-Shortening APIs using Fastify

- The URL-Shortening APIS have been implemented as per the guide lines given [here](https://www.igotskills.in/tasks/31)

## Note

- There might be a initial delay(50 seconds) while using the deployed url after a while since the project is hosted in a free tier plan offered by render. 

## Note

- [Before Accessing any APIs Login Here to get the Bearer token](#login)

## Deployed URL BASE
 - https://url-shortener-uzv7.onrender.com/

 ## Login 
  [Login here](https://url-shortener-uzv7.onrender.com/auth)

 ## Swagger Docs
 - [Swagger Docs here](https://url-shortener-uzv7.onrender.com/docs)


# Overview of the project
 - Shortens long urls into simple short urls. 
 - Provides a variety of analytics for the short urls created by a specific user.
 - Ideal for day to day use, For Example, Managing Social Media Posts and Youtube Content.

 # Challenges Faced and Approach used
- Data Storage: Choosing MongoDb[NoSQl] for better scalability and performance. 
- Setting up Databases: Choosing MongoDB and Redis as a Service for better scalability reasons.
- Unique Hashing: Used Crypto for creating short alias for urls. 
- Google OAuth: Google OAuth Implementation by the integration of passportjs.
- Caching: Used Redis for better caching and data optimizations. 
- Data Integrity: Used Prisma for emphasizing data integrity. 
- Authentication and Session Management: JWT Tokens for Authentication and Session management. 
- Token Based Rate limiting: JWT Tokens used for rate limiting.
- Test Cases: Jest for writing unit tests. 

## Key Components
[Tyepscript](https://www.typescriptlang.org/) - [Fastify](https://github.com/fastify/fastify/) - [PrismaJS](https://github.com/prisma/prisma) - [Docker](https:///www.docker.com/) - [Swagger](https://swagger.io/) - [MongoDB](https://www.mongodb.com/) - [PM2](https://pm2.keymetrics.io/) - [redis](https://redis.io/) - [google-oauth](https://developers.google.com/identity/protocols/oauth2)

## Fastify plugins included
[@fastify/compress](https://github.com/fastify/fastify-compress) - [@fastify/cors](https://github.com/fastify/fastify-cors) - [@fastify/env](https://github.com/fastify/fastify-env) - [@fastify/helmet](https://github.com/fastify/fastify-helmet) - [@fastify/swagger](https://github.com/fastify/fastify-swagger) - [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui)


## Setup & Configuration
Clone the repository:
```bash
git clone https://github.com/danielm/fastify-prisma-swagger-rest-boilerplate.git
```
Create a `.env` file from `.env.example` and tweak it as necessary.
> Some options need some tweaking if running locally or using docker. Read more bellow 👇

---

## Running locally
Make sure your `.env` file has the right settings, these in particular:
```env
# ...
BIND_PORT=5000
BIND_ADDR=127.0.0.1
DATABASE_URL=mongodb://USERNAME:PASSWORD@HOST:PORT/DATABASE
# ...
```
> [Check this section](#databases--mongodb) bellow to quickly spin up locally a MongoDB instance for development

Now, make sure you have installed [Node.js](http://www.nodejs.org) in any recent/lts version.

```bash
# Install all Dev-included dependencies
npm install
# Generates Prisma cliente metadata/types stuff
npx prisma generate
```

Running the project is simple as:

```bash
npm run start
```

Now you should be able access the project:
- APIs: http://127.0.0.1:5000/*
- SwaggerUI documentation: http://127.0.0.1:5000/docs/



### Other useful commands
```bash
# Very nice UI for data visualization of our database
npx prisma studio
# Synchronize your Prisma schema with your database
npx prisma db push
```

### Seed the local Database
```bash
# Seed our database with a bunch of random data
npx prisma db seed
```

## File Structure
```
├── prisma
│   ├── schema.prisma  // Prisma JS DB models/schemas
│   └── seed.ts        // Random data generator using FakerJS
└── src
    ├── app.ts
    ├── config         // Lots of config for fastify and plugins
    ├── controllers
    ├── index.ts       // Main entrypoints
    ├── lib            // Helper functions
    ├── plugins        // Custom plugins
    ├── routes
    └── types          // Typescript types and extensions
```

## Running as a Docker container
During development:

```bash
# Build the docker image
make dev
# Start the container
make up
```

Make sure to have the right settings, these two in particular:
```env
# File: .env

BIND_ADDR=0.0.0.0

# make sure that mongodb host is: 'mongo' instead of '127.0.0.1'
DATABASE_URL="mongodb://USERNAME:PASSWORD@HOST:PORT/DATABASE"
# ...
```

---

## Building for production
```
# Build the image
make prod
```
The production image uses [PM2](https://pm2.keymetrics.io/) for process management, see the content of `pm2.config.json` for settings.

---

## Debugging
```bash
npm run debug
```

This will start the application with code inspection enabled for debugging.

If using VSCode just open the Debug tab, and use the play Button.

If not, use your favourite debugger and connect to: ```0.0.0.0:9229```

## Hot-Reloading

When running by `npm run start` or using the `dev` docker image, the app runs using `nodemon` watching for changes and recompiling the app if necessary.

