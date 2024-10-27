import { WebSocket, WebSocketServer } from 'ws';
import { handlePlayerMessage } from './playerHandler.ts';
import { handleRoomMessage } from './roomHandler.ts';
import { handleGameMessage } from './gameHandler.ts';
import { handleDisconnect } from './disconnectHandler.ts';
import { WebsocketMessage } from '../types/types.ts';

export function handleConnection(ws: WebSocket, wss: WebSocketServer) {
  ws.on('message', (message) => {
    const parsedMessage: WebsocketMessage = JSON.parse(message.toString());
    const { type } = parsedMessage;

    if (type === "reg") handlePlayerMessage(ws, parsedMessage);
    else if (type === "create_room" || type === "add_user_to_room") handleRoomMessage(ws, parsedMessage);
    else if (type === "add_ships" || type === "attack" || type === "randomAttack") handleGameMessage(ws, parsedMessage, wss);
  });

  ws.on('close', () => handleDisconnect(ws));
  ws.on('error', (error) => {
    console.error("WebSocket error:", error);
    handleDisconnect(ws);
  });
}