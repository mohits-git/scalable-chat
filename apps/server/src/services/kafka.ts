import dotenv from "dotenv";
dotenv.config();
import { Kafka, Producer } from "kafkajs";
import fs from 'fs';
import path from 'path';
import prismaClient from "./prisma";

const kafka = new Kafka({
  brokers: [`${process.env.KAFKA_HOST}:${process.env.KAFKA_PORT}`],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
  },
  sasl: {
    username: process.env.KAFKA_USER || '',
    password: process.env.KAFKA_PASSWORD || '',
    mechanism: "plain"
  }
});

let producer: Producer | null = null;

export async function createProducer() {
  if (producer) return producer;
  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  await producer.send({
    messages: [{ key: `message-${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
  return true;
}

export async function startMessageConsumer() {
  console.log("Message Consumer is running...");
  const consumer = kafka.consumer({ groupId: 'default' });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES" });

  await consumer.run({
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log("New message received at kafka...");
      try {
        await prismaClient.message.create({
          data: { text: message.value.toString() }
        })
      } catch (error) {
        console.log(error);
        console.log('Something is wrong, Kafka is paused for a minute');
        pause();
        setTimeout(() => { 
          consumer.resume([{ topic: 'MESSAGES' }]);
        }, 60*1000);
      }
    }
  })
}

export default kafka;
