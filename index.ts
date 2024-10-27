import { httpServer } from './src/http_server/index.ts';
import { WebSocketServer } from 'ws';
import { handleConnection} from './src/handlers/connectionHandler.ts';

const HTTP_PORT = 8181;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
httpServer.listen(HTTP_PORT);

const wss = new WebSocketServer({ port: 3000 });

wss.on('connection', (ws) => {
  handleConnection(ws, wss);
});
