import { Server } from "socket.io";

class SocketService {
    private _io: Server;
    constructor() {
        console.log("INIT SOCKET SERVICE...")
        this._io = new Server();
    }

    public initListeners() {
        const io = this.io;
        console.log("INIT SOCKET LISTENERS...")
        io.on("connect", async (socket) => {
            console.log("New socket connected", socket.id);
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
