# Frontend Dockerfile - Multi-stage build for React Vite application
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies - skip postinstall scripts to avoid lovable-tagger/esbuild ETXTBSY on Alpine
# lovable-tagger is a Lovable.dev-only devDependency not needed for vite production builds
RUN npm ci --ignore-scripts && \
    node node_modules/esbuild/install.js || true

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install a lightweight HTTP server to serve the built app
RUN npm install -g serve

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "dist", "-l", "3000"]
