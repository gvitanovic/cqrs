const express = require('express');
const { Kafka } = require('kafkajs');
const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'cqrs-app',
  brokers: ['kafka:9092'],
});

const consumer = kafka.consumer({ groupId: 'cqrs-group' });

const orders = {};

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'orders-commands', fromBeginning: true });

  console.log('Consumer connected and listening for commands...');

  // Handle commands
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const command = JSON.parse(message.value.toString());

      if (command.type === 'CREATE_ORDER') {
        orders[command.orderId] = { product: command.product, quantity: command.quantity };
        console.log(`Order created: ${command.orderId}`);
      }
    },
  });
};

runConsumer();

// Query endpoint to read orders
app.get('/orders/:orderId', (req, res) => {
  const order = orders[req.params.orderId];
  if (order) {
    res.status(200).send(order);
  } else {
    res.status(404).send('Order not found');
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/orders', (req, res) => {
  if (!Object.keys(orders).length) {
    return res.status(500).send('Orders data is unavailable.');
  }
  res.status(200).json(orders);
});

app.listen(4000, () => {
  console.log('Consumer running on port 4000');
});

