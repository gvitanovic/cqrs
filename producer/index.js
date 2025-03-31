const express = require('express');
const { Kafka } = require('kafkajs');
const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'cqrs-app',
  brokers: ['kafka:9092'],
});

const producer = kafka.producer();

const runProducer = async () => {
  await producer.connect();
  console.log('Producer connected');
};

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/create-order', async (req, res) => {
  const { orderId, product, quantity } = req.body;

  await producer.send({
    topic: 'orders-commands',
    messages: [
      {
        value: JSON.stringify({ orderId, product, quantity, type: 'CREATE_ORDER' }),
      },
    ],
  });

  res.status(200).send('Order command sent!');
});

runProducer();

app.listen(3000, () => {
  console.log('Producer running on port 3000');
});

