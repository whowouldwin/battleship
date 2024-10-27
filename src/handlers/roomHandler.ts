import { WebSocket } from "ws";
import { rooms, availableRooms } from "../db/gameStore.ts";
import { generateId } from "../utils/generateId.ts";
import { WebsocketMessage, Room, Player } from "../types/types.ts";
import { updateRoomList } from "../utils/rooms.ts";

export function handleRoomMessage(ws: WebSocket, message: WebsocketMessage) {
  const data = message.data ? JSON.parse(message.data) : {};

  if (message.type === "create_room") {
    const roomId = generateId();
    const playerName = data.name || "Unknown Player";
    const playerId = generateId();

    const newPlayer: Player = { id: playerId, name: playerName, password: "", wins: 0, ws };
    const newRoom: Room = { id: roomId, players: [newPlayer], gameStarted: false };

    rooms[roomId] = newRoom;
    availableRooms.push(roomId);

    const response = {
      type: "create_room",
      data: JSON.stringify({ roomId, roomUsers: [{ name: playerName, index: playerId }] }),
      id: 0,
    };
    ws.send(JSON.stringify(response));

    updateRoomList();
  } else if (message.type === "add_user_to_room") {
    const roomId = data.indexRoom;
    const room = rooms[roomId];

    if (room && room.players.length === 1) {
      const playerName = data.name || "Unknown Player";
      const playerId = generateId();

      const newPlayer: Player = { id: playerId, name: playerName, password: "", wins: 0, ws };
      room.players.push(newPlayer);

      availableRooms.splice(availableRooms.indexOf(roomId), 1);

      room.players.forEach((player) => {
        const joinMessage = {
          type: "create_game",
          data: JSON.stringify({ idGame: room.id, idPlayer: player.id }),
          id: 0,
        };
        player.ws.send(JSON.stringify(joinMessage));
      });
    } else {
      const errorResponse = {
        type: "error",
        data: JSON.stringify({ error: true, errorText: "Room full or not found" }),
        id: 0,
      };
      ws.send(JSON.stringify(errorResponse));
    }
  }
}
