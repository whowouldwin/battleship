import { httpServer } from './src/http_server/index.ts';
import { WebSocketServer } from 'ws';
import { handleWebSocketMessage } from './src/handlers/messageHandler.js';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
  console.log(`New connection connected: ${ws}`);

  ws.on('message', (message) => {
    handleWebSocketMessage(ws, message);
  });
  ws.on('close', () => {
    console.log(`Client disconnected: ${ws}`);
  });
});
