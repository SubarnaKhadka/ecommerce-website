# E-commerce Microservices Setup

This project contains multiple microservices for an e-commerce application.  
You can run it using **Docker Compose** or directly on your **local machine**.

---

## 🚀 Docker Setup

To build and start all services in Docker containers:

````bash
npm run build:shared
docker-compose up -d --build

## 🖥️ Localhost Setup

Run all services locally for development:

```bash
npm run dev
```

### ⚡ Key Points

- Use **`.env`** for Docker container configuration.
- Use **`.env.local`** for local development on your machine.
- Services communicate differently depending on the environment:
  - Docker: via **service names** (`order-service`, `payment-service`, etc.)
  - Localhost: via **`localhost` and ports** (`localhost:3001`, etc.)

---

#### 1️⃣ Docker (`.env`)

```env
# Kafka Broker
KAFKA_BROKERS=kafka:9092

# Service URLs (Docker service names)
ORDER_SERVICE_URL=http://order-service:3001
PAYMENT_SERVICE_URL=http://payment-service:3002
PRODUCT_SERVICE_URL=http://product-service:3003
USER_SERVICE_URL=http://user-service:3004

````

#### 1️⃣ Localhost (`.env.local`)

```env
# Kafka Broker
KAFKA_BROKERS=localhost:9092

ORDER_SERVICE_URL=http://localhost:3001
PAYMENT_SERVICE_URL=http://localhost:3002
PRODUCT_SERVICE_URL=http://localhost:3003
USER_SERVICE_URL=http://localhost:3004
```
