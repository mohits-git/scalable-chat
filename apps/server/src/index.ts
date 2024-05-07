import http from "http";
import SocketService from "./services/socket";

async function init() {
  const httpServer = http.createServer();
  const socketService = new SocketService();
  socketService.io.attach(httpServer);
  const PORT = process.env.PORT ? process.env.PORT : 8000;
  httpServer.listen(PORT, () => console.log(`HTTP SERVER STARTED AT PORT: ${PORT}`));
  socketService.initListeners();
}

init();
