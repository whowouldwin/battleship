import { WebSocket, WebSocketServer } from "ws";
import { rooms } from "../db/gameStore.ts";
import { WebsocketMessage, Room } from "../types/types.ts";
import { handleAttack, startGame } from '../utils/rooms.ts';

export function handleGameMessage(ws: WebSocket, message: WebsocketMessage, wss: WebSocketServer) {
  const data = JSON.parse(message.data);

  if (message.type === "add_ships") {
    const game = rooms[data.gameId];
    const player = game?.players.find((p) => p.id === data.indexPlayer);

    if (player) {
      player.ships = data.ships;
      if (game.players.every((p) => p.ships)) {
        startGame(game);
      }
    }
    ws.send(JSON.stringify({ type: "ack", data: JSON.stringify({ message: "Ships placed" }), id: 0 }));
  }
  else if (message.type === "attack") {
    const { gameId, indexPlayer, x, y } = data;
    handleAttack(ws, gameId, indexPlayer, x, y, wss); // Process the attack
  }
}