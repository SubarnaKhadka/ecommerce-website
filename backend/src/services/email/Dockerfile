FROM node:20-alpine

WORKDIR /app

# Copy root and service files
COPY package*.json ./tsconfig.base.json ./
COPY src/shared ./src/shared
COPY src/services/email ./src/services/email

# Install dependencies (resolves all workspaces)
RUN npm install

WORKDIR /app/src/services/email
RUN npm run build

EXPOSE 3005
CMD ["node", "dist/index.js"]
