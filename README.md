# CQRS with Kafka

## Overview

This project demonstrates a **CQRS (Command Query Responsibility Segregation)** pattern using **Kafka** as the event-driven backbone. It consists of two microservices:

- **Producer (Command Side):** Sends `CREATE_ORDER` events to Kafka.
- **Consumer (Query Side):** Listens to Kafka, processes orders, and serves read requests.

Kafka acts as the event bus, ensuring asynchronous communication between the services.

## Architecture

```
                +------------+
                |  Client    |
                +------------+
                      |
                      | HTTP Request
                      v
             +----------------+
             | Producer (API) |
             +----------------+
                      |
                      | Kafka Event (orders-commands)
                      v
             +----------------+
             |  Kafka Broker  |
             +----------------+
                      |
                      | Kafka Consumer
                      v
             +----------------+
             | Consumer (API) |
             +----------------+
                      |
                      | HTTP Response
                      v
                +------------+
                |  Client    |
                +------------+
```

## Services

### 1. Producer (Command Side)

- Exposes `POST /create-order`
- Sends messages to Kafka (`orders-commands` topic)

### 2. Consumer (Query Side)

- Listens for messages from Kafka
- Stores orders in memory
- Exposes `GET /orders` to fetch orders

## Prerequisites

Ensure you have:

- **Docker & Docker Compose** installed
- **Node.js** (for local development)

## Setup & Running

Clone the repository:

```sh
$ git clone https://github.com/your-repo/cqrs-kafka.git
$ cd cqrs-kafka
```

Start all services using Docker Compose:

```sh
$ docker-compose up --build
```

Services:

- **Producer:** `http://localhost:3000`
- **Consumer:** `http://localhost:4000`
- **Kafka UI:** `http://localhost:8080`

## API Endpoints

### 1️⃣ Create Order (Producer)

```sh
curl -X POST http://localhost:3000/create-order \
     -H "Content-Type: application/json" \
     -d '{ "orderId": "123", "product": "Laptop", "quantity": 1 }'
```

### 2️⃣ Get Orders (Consumer)

```sh
curl -X GET http://localhost:4000/orders
```

## Kafka UI

To inspect Kafka topics and messages, visit:

```
http://localhost:8080
```

## Docker-Compose Services

```yaml
version: '3.8'
services:
  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    container_name: zookeeper
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
    healthcheck:
      test: ["CMD", "nc", "-z", "localhost", "2181"]
      interval: 10s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:latest
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      zookeeper:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "kafka-topics", "--bootstrap-server", "localhost:9092", "--list"]
      interval: 10s
      retries: 5
      start_period: 20s

  producer:
    build: ./producer
    container_name: producer
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_BROKER: kafka:9092
    ports:
      - "3000:3000"

  consumer:
    build: ./consumer
    container_name: consumer
    depends_on:
      kafka:
        condition: service_healthy
    environment:
      KAFKA_BROKER: kafka:9092
    ports:
      - "4000:4000"

  kafka-ui:
    image: provectuslabs/kafka-ui
    container_name: kafka-ui
    ports:
      - "8080:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAP_SERVERS: kafka:9092
    depends_on:
      kafka:
        condition: service_healthy
```

