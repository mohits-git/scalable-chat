import dotenv from 'dotenv'
dotenv.config();
import { Server } from "socket.io";
import Redis from "ioredis";
import { produceMessage } from './kafka';

const pub = new Redis({
  username: process.env.REDIS_USER,
  host: process.env.REDIS_HOST,
  port: 21884,
  password: process.env.REDIS_PASSWORD,
});
const sub = new Redis({
  username: process.env.REDIS_USER,
  host: process.env.REDIS_HOST,
  port: 21884,
  password: process.env.REDIS_PASSWORD,
});

class SocketService {
  private _io: Server;
  constructor() {
    console.log("INIT SOCKET SERVICE...")
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      }
    });
    sub.subscribe("MESSAGES");
  }

  public async initListeners() {
    const io = this.io;
    console.log("INIT SOCKET LISTENERS...");
    sub.on("message", async (channel, message) => {
      if (channel === "MESSAGES") {
        io.emit('message', message);
        await produceMessage(message);
        console.log("Message Produced to Kafka broker.")
      }
    });
    io.engine.on("connection_error", (err) => {
      console.log(err.req);
      console.log(err.code);
      console.log(err.message);
      console.log(err.context);
    });
    io.on("connect", async (socket) => {
      console.log("New socket connected", socket.id);

      socket.on('disconnect', () => console.log("Socket disconnected."));

      socket.on("event:message", async ({ message }: { message: string }) => {
        await pub.publish('MESSAGES', JSON.stringify({ message }));
      });

    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
