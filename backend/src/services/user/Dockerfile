FROM node:20-alpine

WORKDIR /app

# Copy root and service files
COPY package*.json ./tsconfig.base.json ./
COPY src/shared ./src/shared
COPY src/services/user ./src/services/user

# Install dependencies (resolves all workspaces)
RUN npm install

WORKDIR /app/src/services/user
RUN npm run build

EXPOSE 3004
CMD ["node", "dist/index.js"]
