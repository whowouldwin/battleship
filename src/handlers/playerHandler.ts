import { WebSocket } from "ws";
import { players } from "../db/playerStore.ts";
import { generateId } from "../utils/generateId.ts";
import { WebsocketMessage, Player } from "../types/types.ts";
import { updateRoomList } from '../utils/rooms.js';

export function handlePlayerMessage(ws: WebSocket, message: WebsocketMessage) {
  const rawData = message.data === "string" ? JSON.parse(message.data) : message.data;
  const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;
  const { name, password } = data;
  let response;

  if (!players.has(name)) {
    const player: Player = { id: generateId(), name, password, wins: 0, ws };
    players.set(name, player);

    response = {
      type: "reg",
      data: JSON.stringify({ name, index: player.id, error: false, errorText: "" }),
      id: 0,
    };
  } else {
    const player = players.get(name);

    if (player) {
      response = player.password === password
        ? { type: "reg", data: JSON.stringify({ name, index: player.id, error: false, errorText: "" }), id: 0 }
        : { type: "reg", data: JSON.stringify({ name, error: true, errorText: "Invalid password" }), id: 0 };
    } else {
      response = {
        type: "reg",
        data: JSON.stringify({ name, error: true, errorText: "Player not found" }),
        id: 0,
      };
    }
  }

  ws.send(JSON.stringify(response));
  updateRoomList();
}