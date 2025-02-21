# ---------------- Development Stage
FROM node:lts-alpine as development

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# ---------------- Build Production Stage
FROM node:lts-alpine as build

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# ---------------- Production Stage
FROM node:lts-alpine as production

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json .  

# Copy necessary files from build stage
COPY --from=build /app/dist .  
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma  
COPY --from=build /app/prisma ./prisma  

# Set environment variables for Render
ENV NODE_ENV=production
ENV PORT=5000

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Install dependencies for production
RUN npm install --production

# Start the app
CMD ["node", "./dist/src/index.js"]
