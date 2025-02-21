# ---------------- To develop as a container
FROM node:lts-alpine as development

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# ---------------- Build Prod Stage
FROM node:lts-alpine as build

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# ---------------- Run Prod Stage
FROM node:lts-alpine as production

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./  
COPY pm2.config.json ./

# Copy necessary files from build stage
COPY --from=build /app/dist/src .  
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma  
COPY --from=build /app/prisma ./prisma  

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm install -g pm2

