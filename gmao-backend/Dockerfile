FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the TypeScript code
RUN npm run build

#Production 
FROM node:22-alpine AS runner

WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the Prisma client generated in the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /app/prisma ./prisma

COPY --from=builder /app/dist ./dist


RUN chown -R node:node /app
USER node

# Expose the port the Express app runs on
EXPOSE 8080
ENV PORT=8080


# Run migrations (and seed, idempotent via upsert) before starting the app.
# Container Apps has no separate migration step like the old App Service
# app_command_line trick — `prisma migrate deploy` is safe to re-run on every
# container start/restart, so this keeps every deploy self-healing.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run db:seed && node dist/tracing.js"]