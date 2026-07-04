FROM node:20-alpine AS builder

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
FROM node:20-alpine AS runner

WORKDIR /app

# Set node environment to production
ENV NODE_ENV=production

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the Prisma client generated in the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy the compiled Javascript from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the port the Express app runs on
EXPOSE 8080
ENV PORT=8080

# Command to run the application
CMD ["node", "dist/index.js"]