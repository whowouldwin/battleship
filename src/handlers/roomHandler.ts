import { generateId } from '../utils/generateId.js';
import { Player, Room, WebsocketMessage } from '../types/types.js';

const rooms: Record<string, Room> = {};
const availableRooms: string[] = [];

export function createRoom(player: Player) {
  const roomId = generateId();
  rooms[roomId] = { id: roomId, players: [player], gameStarted: false };
  availableRooms.push(roomId);

  return JSON.parse(JSON.stringify({
    type: 'create_room',
    data: JSON.stringify(''),
    id: 0,
  }));
}

export function addUserToRoom(indexRoom: string, player: Player): WebsocketMessage[] {
  const room = rooms[indexRoom];

  if (!room) {
    return [
      JSON.parse(JSON.stringify({
        type: 'error',
        data: JSON.stringify({
          error: true,
          errorText: `Room ${indexRoom} doesn't exist`,
        }),
        id: 0,
      })),
    ];
  }

  if (room && room.players.length === 1) {
    room.players.push(player);

    const roomIndex = availableRooms.indexOf(indexRoom);
    if (roomIndex > -1) {
      availableRooms.splice(roomIndex, 1);
    }

    const idGame = generateId();
    const player1Id = generateId();
    const player2Id = generateId();

    return [
      JSON.parse(JSON.stringify({
        type: 'create_room',
        data: JSON.stringify({
          idGame, idPlayer: player1Id,
        }),
        id: 0,
        error: false,
        errorText: '',
      })),
      JSON.parse(JSON.stringify({
        type: 'create_game',
        data: JSON.stringify({
          idGame, idPlayer: player2Id,
        }),
        id: 0,
        error: false,
        errorText: '',
      })),
    ];
  } else {
    throw new Error(`Room is full or doesn't exist ${indexRoom}`);
  }
}

export function updateRoomState(): WebsocketMessage {
  return JSON.parse(JSON.stringify({
    type: 'update_room',
    data: JSON.stringify(
      availableRooms.map((roomId) => {
        const room = rooms[roomId];
        return {
          roomId: room.id,
          roomUsers: room.players.map(({ name, id }) => ({ name, index: id })),
        };
      }),
    ),
    id: 0,
  }));
}

