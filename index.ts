import {httpServer} from "./src/http_server/index.ts";
import {WebSocketServer} from 'ws'

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ server: httpServer });
wss.on('connection', (ws) => {
  console.log(`New connection connected: ${ws}`);
  ws.on('message', (message) => {
    console.log(`Received message: ${message.toString()}`);
  })
  ws.on('close', () => {
    console.log(`Client disconnected: ${ws}`);
  });
});