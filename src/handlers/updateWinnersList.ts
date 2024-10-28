import { players } from '../db/playerStore.ts';
import { WebsocketMessage } from "../types/types.ts";
import { WebSocketServer } from 'ws';

export function updateWinnersList(wss: WebSocketServer) {

  const winnersData = Array.from(players.values())
    .map(({ name, wins }) => ({ name, wins }))
    .sort((a, b) => b.wins - a.wins);

  const updateWinnersMessage: WebsocketMessage = {
    type: "update_winners",
    data: JSON.stringify(winnersData),
    id: 0,
  };

  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(JSON.stringify(updateWinnersMessage));
    }
  });
}