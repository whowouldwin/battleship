import WebSocket from 'ws';
import { handleRegistration } from '../players.js';

export function handleWebSocketMessage(ws: WebSocket, message: any) {
  const parsedMessage = JSON.parse(message.toString());
  switch (parsedMessage.type) {
    case "reg":
      const regResponse = handleRegistration(parsedMessage.data.name, parsedMessage.data.password);
      ws.send(JSON.stringify(regResponse));
      break;
    default:
      console.log('This command is not supported', parsedMessage.type);
      break;
  }
}