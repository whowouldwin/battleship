import { Player, WebsocketMessage } from '../types/types.js';
import { generateId } from '../utils/generateId.js';

const playerDB: Record<string, Player> = {};

function createSuccessResponse(name: string, id: string): WebsocketMessage {
  return {
    type: 'reg',
    data: {
      name,
      index: id,
      error: false,
      errorText: "",
    },
    id: 0,
  }
}

function createErrorResponse(name: string, errorText: string): WebsocketMessage {
  return {
    type: 'reg',
    data: {
      name,
      index: "",
      error: true,
      errorText,
    },
    id: 0,
  }
}

export function handleRegistration(name: string, password: string): WebsocketMessage {
  const player = playerDB[name];
  if (player && player.password === password) {
    return createSuccessResponse(player.name, player.id);
  } else if (player && player.password !== password) {
    return createErrorResponse(name, "Invalid password");
  } else {
    const playerId = generateId();
    playerDB[name] = { id: playerId, name, password, wins: 0 };
    return createSuccessResponse(name, playerId);
  }
}