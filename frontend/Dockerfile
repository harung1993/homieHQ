# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Runtime stage - using node instead of nginx
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy build from the build stage
COPY --from=build /app/build /app/build

# Copy the entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh

# Make script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port 3000 (used by serve)
EXPOSE 3000

# Run the entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]