FROM node:20-alpine

WORKDIR /app

# Copy root and service files
COPY package*.json ./tsconfig.base.json ./
COPY src/shared ./src/shared
COPY src/services/order ./src/services/order

# Install dependencies (resolves all workspaces)
RUN npm install

WORKDIR /app/src/services/order
RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]
