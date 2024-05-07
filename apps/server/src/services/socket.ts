import { Server } from "socket.io";

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
  }

  public initListeners() {
    const io = this.io;
    console.log("INIT SOCKET LISTENERS...");
    io.engine.on("connection_error", (err) => {
      console.log(err.req);
      console.log(err.code);
      console.log(err.message);
      console.log(err.context);
    });
    io.on("connect", async (socket) => {
      console.log("New socket connected", socket.id);

      socket.on('disconnect', () => console.log("User disconnected."));

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New message received: ", message);
      });

    });
  }

  get io() {
    return this._io;
  }
}

export default SocketService;
