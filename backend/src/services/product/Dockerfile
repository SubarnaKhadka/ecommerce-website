FROM node:20-alpine

WORKDIR /app

# Copy root and service files
COPY package*.json ./tsconfig.base.json ./
COPY src/shared ./src/shared
COPY src/services/payment ./src/services/payment

# Install dependencies (resolves all workspaces)
RUN npm install

WORKDIR /app/src/services/payment
RUN npm run build

EXPOSE 3003
CMD ["node", "dist/index.js"]
