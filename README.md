# E-commerce Microservices Setup

This project contains multiple microservices for an e-commerce application.  
You can run it using **Docker Compose** or directly on your **local machine**.

---

# Kafka Setup

- docker pull confluentinc/cp-kafka:latest
- docker run -d \
  --name kafka \
  -p 9092:9092 \
  -p 9093:9093 \
  -e KAFKA_NODE_ID=1 \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_PROCESS_ROLES=broker,controller \
  -e KAFKA_CONTROLLER_QUORUM_VOTERS="1@localhost:9093" \
  -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_LISTENERS="PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093" \
  -e KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092" \
  -e KAFKA_INTER_BROKER_LISTENER_NAME=PLAINTEXT \
  -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true \
  -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
  -e KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1 \
  -e KAFKA_NUM_PARTITIONS=4 \
  -e CLUSTER_ID="flzvp_jsS-eerY-X_B5PEg" \
  -v kafka-data:/var/lib/kafka/data \
  confluentinc/cp-kafka:latest

# Elastic Search Setup

- docker pull elasticsearch:9.2.1
- docker run -d \
  --name elasticsearch \
  -p 9200:9200 \
  -p 9300:9300 \
  -e "discovery.type=single-node" \
  -e http.host=0.0.0.0
  elasticsearch:9.2.1

#### Default user: elastic

#### For Password:

- docker exec -it elasticsearch bin/elasticsearch-setup-passwords interactive

### Custom User

- docker exec -it elasticsearch bin/elasticsearch-users useradd <myuser> -p <mypassword> -r superuser

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
