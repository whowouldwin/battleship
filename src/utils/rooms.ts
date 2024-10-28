import { WebSocket, WebSocketServer } from 'ws';
import { availableRooms, rooms } from '../db/gameStore.ts';
import { WebsocketMessage, Room, Player } from "../types/types.ts";
import { players } from '../db/playerStore.js';
import { updateWinnersList } from '../handlers/updateWinnersList.js';

export function startGame(game: Room) {
  if(game.gameStarted) return;
  game.gameStarted = true;
  game.currentTurnPlayerId = game.players[0].id

  game.players.forEach((player) => {
    player.ws.send(JSON.stringify({
      type: "start_game",
      data: JSON.stringify({
        ships: player.ships,
        currentPlayerIndex: game.currentTurnPlayerId,
      }),
      id: 0,
    }));
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
  if (!game || !game.gameStarted) return;

  const currentPlayer = game.players.find((p) => p.id === playerId);
  const opponent = game.players.find((p) => p.id !== playerId);

  if (!currentPlayer || !opponent) return;


  const isHit = opponent.ships?.some(ship =>
    ship.position.x === x && ship.position.y === y
  );

  const attackStatus = isHit ? "hit" : "miss";
  const attackResponse: WebsocketMessage = {
    type: "attack",
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: playerId,
      status: attackStatus,
    }),
    id: 0,
  };


  ws.send(JSON.stringify(attackResponse));
  opponent.ws.send(JSON.stringify(attackResponse));


  if (attackStatus === "miss" || attackStatus === "hit") {
    game.currentTurnPlayerId = opponent.id;

    const turnMessage: WebsocketMessage = {
      type: "turn",
      data: JSON.stringify({ currentPlayer: opponent.id }),
      id: 0,
    };

    ws.send(JSON.stringify(turnMessage));
    opponent.ws.send(JSON.stringify(turnMessage));
  }

}
export function updateRoomList(wss: WebSocketServer) {
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

