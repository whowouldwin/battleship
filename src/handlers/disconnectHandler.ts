import { WebSocket, WebSocketServer } from 'ws';
import { players } from '../db/playerStore.ts';
import { rooms, availableRooms } from '../db/gameStore.ts';
import { updateRoomList } from '../utils/rooms.ts';

export function handleDisconnect(ws: WebSocket, wss: WebSocketServer) {
  const player = Array.from(players.values()).find((p) => p.ws === ws);

  if (player) {
    players.delete(player.name);
    console.log(`User ${player.name} disconnected and removed.`);

    for (const [roomId, room] of Object.entries(rooms)) {
      const playerIndex = room.players.findIndex((p) => p.id === player.id);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        if (room.players.length === 0) delete rooms[roomId];
        else if (room.players.length === 1) availableRooms.push(roomId);
      }
    }
  }
  updateRoomList(wss);
}