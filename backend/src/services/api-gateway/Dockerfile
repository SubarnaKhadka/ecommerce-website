FROM node:20-alpine

WORKDIR /app

# Copy root files (for base tsconfig + dependencies)
COPY package*.json tsconfig.base.json ./

# Copy everything needed for the service
COPY src/services/api-gateway ./src/services/api-gateway

# Install all dependencies (root + shared + service)
RUN npm install

# Build only this service
WORKDIR /app/src/services/api-gateway
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/index.js"]
