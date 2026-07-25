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

# Copy the Prisma schema + migrations so `prisma migrate deploy` can run
# against this exact image (e.g. from a one-off Job at deploy time).
COPY --from=builder /app/prisma ./prisma

# Copy the compiled Javascript from the builder stage
COPY --from=builder /app/dist ./dist

# Run as the non-root 'node' user (built into the base image) instead of root.
# uploads/ is created at runtime by multer, so /app must be writable by this user.
RUN chown -R node:node /app
USER node

# Expose the port the Express app runs on
EXPOSE 8080
ENV PORT=8080

# Command to run the application — tracing.js, not index.js: it sets up
# OpenTelemetry instrumentation before dynamically importing the real app.
# See src/tracing.ts for why this ordering matters.
CMD ["node", "dist/tracing.js"]