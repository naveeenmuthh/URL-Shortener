# ---------------- Development Stage
FROM node:lts-alpine as development

# Install dependencies required for Prisma and native modules
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

# ---------------- Build Production Stage
FROM node:lts-alpine as build

# Install dependencies required for native modules
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# ---------------- Production Stage
FROM node:lts-alpine as production

# Install runtime dependencies (Fixes `ld-linux-x86-64.so.2` error)
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package*.json .  

# Copy necessary files from build stage
COPY --from=build /app/dist .  
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma  

# Set environment variables for Render
ENV NODE_ENV=production
ENV PORT=5000  

# Install only production dependencies
RUN npm install --production --no-audit --no-optional

# Generate Prisma client (after copying dependencies)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Start the app (using the compiled TypeScript output)
CMD ["node", "server.js"]
