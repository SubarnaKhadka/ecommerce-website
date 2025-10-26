FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=prod
COPY . .
WORKDIR /app/src/services/payment
RUN npm install --only=dev
CMD ["npx", "ts-node", "-r", "tsconfig-paths/register", "src/index.ts"]
