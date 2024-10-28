import { WebSocket, WebSocketServer } from 'ws';
import { availableRooms, rooms } from '../db/gameStore.ts';
import { WebsocketMessage, Room, Player } from "../types/types.ts";
import { players } from '../db/playerStore.js';

export function startGame(game: Room) {
  const startGameMessage: WebsocketMessage = {
    type: "start_game",
    data: JSON.stringify({
      ships: game.players[0].ships,
      currentPlayerIndex: game.players[0].id,
    }),
    id: 0,
  };

  game.gameStarted = true;

  game.players.forEach((player) => {
    player.ws.send(JSON.stringify(startGameMessage));
  });
}

export function handleAttack(
  ws: WebSocket,
  gameId: string,
  playerId: string,
  x: number,
  y: number,
  wss: WebSocketServer
) {
  const game = rooms[gameId];
  if (!game) return;

  const currentPlayer = game.players.find((p) => p.id === playerId);
  const opponent = game.players.find((p) => p.id !== playerId);

  if (!currentPlayer || !opponent) return;

  const attackResponse: WebsocketMessage = {
    type: "attack",
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: playerId,
      status: "miss",
    }),
    id: 0,
  };

  ws.send(JSON.stringify(attackResponse));
}

export function handleRandomAttack(
  ws: WebSocket,
  gameId: string,
  playerId: string,
  wss: WebSocketServer
) {
  const game = rooms[gameId];
  if (!game) return;

  const attackResponse: WebsocketMessage = {
    type: "attack",
    data: JSON.stringify({
      position: { x: Math.floor(Math.random() * 10), y: Math.floor(Math.random() * 10) },
      currentPlayer: playerId,
      status: "shot",
    }),
    id: 0,
  };

  ws.send(JSON.stringify(attackResponse));
}

export function updateRoomList() {
  const updateMessage: WebsocketMessage = {
    type: "update_room",
    data: JSON.stringify(
      availableRooms.map((roomId) => {
        const room = rooms[roomId];
        if (!room || !room.players) {
          console.error("Room is missing")
          return null;
        }
        return {
          roomId: room.id,
          roomUsers: room.players.map((player) => ({
            name: player.name,
            index: player.id,
          })),
        };
      })
    ),
    id: 0,
  };

  players.forEach((player) => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(updateMessage));
    }
  });
}
